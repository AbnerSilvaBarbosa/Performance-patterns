import { ConfigService } from "@nestjs/config";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

export const DrizzleAsyncProvider = "DrizzleAsyncProvider";

export const drizzleProvider = [
  {
    provide: DrizzleAsyncProvider,
    inject: [ConfigService],
    useFactory: async (configService: ConfigService) => {
      const connectionString = configService.get<string>("DATABASE_URL");
      const pool = new Pool({ connectionString });
      return drizzle(pool, { schema }) as NodePgDatabase<typeof schema>;
    },
  },
];
