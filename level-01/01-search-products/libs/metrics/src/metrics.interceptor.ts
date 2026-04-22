import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { Observable, tap, catchError, throwError } from "rxjs";
import { MetricsService } from "./metrics.service";

const REQUEST_TIMEOUT_MS = 120000;

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(private readonly metricsService: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const method = req.method;
    const route = req.route?.path ?? req.path;

    const endTimer = this.metricsService.httpRequestDuration.startTimer({ method, route });
    this.metricsService.httpRequestsInFlight.inc({ method, route });

    const timeout = setTimeout(() => {
      this.metricsService.httpRequestsTimeout.inc({ method, route });
    }, REQUEST_TIMEOUT_MS);

    return next.handle().pipe(
      tap(() => {
        clearTimeout(timeout);
        const res = context.switchToHttp().getResponse();
        const statusCode = String(res.statusCode);
        endTimer({ status_code: statusCode });
        this.metricsService.httpRequestsTotal.inc({ method, route, status_code: statusCode });
        this.metricsService.httpRequestsInFlight.dec({ method, route });
      }),
      catchError((err) => {
        clearTimeout(timeout);
        const statusCode = String(err.status ?? 500);
        endTimer({ status_code: statusCode });
        this.metricsService.httpRequestsTotal.inc({ method, route, status_code: statusCode });
        this.metricsService.httpRequestsInFlight.dec({ method, route });
        return throwError(() => err);
      }),
    );
  }
}
