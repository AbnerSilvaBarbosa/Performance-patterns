import { Injectable, OnModuleInit } from "@nestjs/common";
import { collectDefaultMetrics, Counter, Histogram, Gauge, Registry } from "prom-client";

@Injectable()
export class MetricsService implements OnModuleInit {
  readonly registry = new Registry();

  readonly httpRequestsTotal = new Counter({
    name: "http_requests_total",
    help: "Total de requisições HTTP recebidas",
    labelNames: ["method", "route", "status_code"],
    registers: [this.registry],
  });

  readonly httpRequestsTimeout = new Counter({
    name: "http_requests_timeout_total",
    help: "Total de requisições HTTP que deu timeout",
    labelNames: ["method", "route"],
    registers: [this.registry],
  });

  readonly httpRequestDuration = new Histogram({
    name: "http_request_duration_seconds",
    help: "Duração das requisições HTTP em segundos",
    labelNames: ["method", "route", "status_code"],
    buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
    registers: [this.registry],
  });

  readonly httpRequestsInFlight = new Gauge({
    name: "http_requests_in_flight",
    help: "Requisições HTTP sendo processadas no momento",
    labelNames: ["method", "route"],
    registers: [this.registry],
  });

  onModuleInit() {
    collectDefaultMetrics({ register: this.registry });
  }

  getMetrics(): Promise<string> {
    return this.registry.metrics();
  }

  getContentType(): string {
    return this.registry.contentType;
  }
}
