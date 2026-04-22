import { Injectable, OnModuleInit } from "@nestjs/common";
import { createClient, RedisClientType } from "redis";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class CacheService implements OnModuleInit {
  private client: RedisClientType;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    const redisUrl = this.configService.get("REDIS_URL") || "redis://localhost:6379";
    
    this.client = createClient({ url: redisUrl });
    
    this.client.on("error", (err) => console.error("Redis Client Error", err));
    this.client.on("connect", () => console.log("Redis connected"));
    
    await this.client.connect();
  }

  async get<T>(key: string): Promise<T | null> {
    const value = await this.client.get(key);
    if (!value) return null;
    return JSON.parse(value) as T;
  }

  async set(key: string, value: unknown, ttlSeconds: number = 300): Promise<void> {
    await this.client.set(key, JSON.stringify(value), { EX: ttlSeconds });
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async getOrSet<T>(
    key: string,
    fn: () => Promise<T>,
    ttlSeconds: number = 300,
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached) return cached;

    const value = await fn();
    await this.set(key, value, ttlSeconds);
    return value;
  }
}