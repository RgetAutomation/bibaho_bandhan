// src/services/RedisService.ts
import { Redis } from "ioredis";

interface RedisTemplate {
  title: string;
  content: string;
}

export class RedisService {
  private redis: Redis;

  constructor() {
    this.redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");
  }

  get client() {
    return this.redis;
  }

  async setTemplate(id: string, title: string, content: string): Promise<void> {
    await this.redis.hset(`template:${id}`, {
      title,
      content,
    });

    await this.redis.sadd("templates:ids", id);
  }

  // =========================
  // 2️⃣ GET SINGLE TEMPLATE
  // =========================
  async getSingleTemplate(id: string) {
    try {
      const key = `template:${id}`;
      const data = await this.redis.hgetall(key);

      if (!Object.keys(data).length) return null;

      return {
        id,
        title: data.title,
        content: data.content,
      };
    } catch (error) {
      console.error("Error getting template:", error);
      throw error;
    }
  }

  // =========================
  // 3️⃣ GET ALL TEMPLATES
  // =========================
  async getAllTemplatesFromRedis(): Promise<
    { id: string; title: string; content: string }[]
  > {
    const ids = await this.redis.smembers("templates:ids");
    if (!ids.length) return [];

    const pipeline = this.redis.pipeline();
    ids.forEach((id) => pipeline.hgetall(`template:${id}`));

    const results = await pipeline.exec();
    if (!results) return [];

    return results
      .map((result, index) => {
        const [error, data] = result;

        if (error || !data || typeof data !== "object") {
          return null;
        }

        const template = data as RedisTemplate;

        return {
          id: ids[index],
          title: template.title,
          content: template.content,
        };
      })
      .filter(
        (
          item
        ): item is {
          id: string;
          title: string;
          content: string;
        } => item !== null
      );
  }

  // =========================
  // 4️⃣ DELETE TEMPLATE
  // =========================
  async deleteTemplate(id: string): Promise<boolean> {
    const key = `template:${id}`;

    const [deletedCount] = await Promise.all([
      this.redis.del(key),
      this.redis.srem("templates:ids", id),
    ]);

    return deletedCount > 0;
  }

  // Health check
  async ping(): Promise<string> {
    return await this.redis.ping();
  }
}

export const redisService = new RedisService();
