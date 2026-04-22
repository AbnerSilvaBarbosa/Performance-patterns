import { Global, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { DrizzleAsyncProvider, drizzleProvider } from "./drizzle.provider";

@Global()
@Module({
  imports: [ConfigModule.forRoot()],
  providers: [...drizzleProvider],
  exports: [DrizzleAsyncProvider],
})
export class DatabaseModule {}
