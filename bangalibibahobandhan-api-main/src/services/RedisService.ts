// src/services/RedisService.ts
import { Redis } from "ioredis";

export interface RedisTemplate {
  title: string;
  content: string;
}

export class RedisService {
  private redis: Redis;

  constructor() {
    this.redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");
  }

  // Online Users Management
  async setUserOnline(userId: string, socketId: string): Promise<void> {
    // Store socket ID and online status
    await this.redis.hset("online_users", userId, socketId);
    await this.redis.setex(
      `user:${userId}:last_seen`,
      86400,
      new Date().toISOString()
    );
    await this.redis.setex(`user:${userId}:online`, 86400, "true"); // 24 hours TTL
  }

  async setUserOffline(userId: string): Promise<void> {
    // Remove from online users but keep last_seen
    await this.redis.hdel("online_users", userId);
    await this.redis.del(`user:${userId}:online`);
    await this.redis.setex(
      `user:${userId}:last_seen`,
      86400,
      new Date().toISOString()
    );
  }

  async isUserOnline(userId: string): Promise<boolean> {
    const online = await this.redis.get(`user:${userId}:online`);
    return online === "true";
  }

  async getUserLastSeen(userId: string): Promise<Date | null> {
    const lastSeen = await this.redis.get(`user:${userId}:last_seen`);
    return lastSeen ? new Date(lastSeen) : null;
  }

  async getUserSocketId(userId: string): Promise<string | null> {
    return await this.redis.hget("online_users", userId);
  }

  async getAllOnlineUsers(): Promise<Record<string, string>> {
    return await this.redis.hgetall("online_users");
  }

  async getOnlineStatuses(
    userIds: string[]
  ): Promise<Record<string, { isOnline: boolean; lastSeen: Date | null }>> {
    const statuses: Record<
      string,
      { isOnline: boolean; lastSeen: Date | null }
    > = {};

    for (const userId of userIds) {
      const [online, lastSeen] = await Promise.all([
        this.redis.get(`user:${userId}:online`),
        this.redis.get(`user:${userId}:last_seen`),
      ]);

      statuses[userId] = {
        isOnline: online === "true",
        lastSeen: lastSeen ? new Date(lastSeen) : null,
      };
    }

    return statuses;
  }

  // Typing Status Management
  async setTypingStatus(
    userId: string,
    conversationId: string,
    isTyping: boolean
  ): Promise<void> {
    const key = `typing:${conversationId}`;

    if (isTyping) {
      await this.redis.hset(key, userId, "1");
      await this.redis.expire(key, 30); // Auto-expire after 30 seconds
    } else {
      await this.redis.hdel(key, userId);
    }
  }

  async getTypingUsers(conversationId: string): Promise<string[]> {
    const key = `typing:${conversationId}`;
    const typingUsers = await this.redis.hkeys(key);
    return typingUsers;
  }

  async getAllTypingStatuses(): Promise<Record<string, string[]>> {
    const typingKeys = await this.redis.keys("typing:*");
    const statuses: Record<string, string[]> = {};

    for (const key of typingKeys) {
      const conversationId = key.replace("typing:", "");
      statuses[conversationId] = await this.redis.hkeys(key);
    }

    return statuses;
  }

  // User Conversations Management
  async addUserToConversation(
    userId: string,
    conversationId: string
  ): Promise<void> {
    await this.redis.sadd(`user:${userId}:conversations`, conversationId);
  }

  async setConversationMeta(
    conversationId: string,
    meta: { hasGhotokParticipant: boolean; moderatorId: string }
  ) {
    await this.redis.hset(`conversation:${conversationId}:meta`, {
      hasGhotokParticipant: meta.hasGhotokParticipant ? "1" : "0",
      moderatorId: meta.moderatorId,
    });
  }

  async getUserConversations(userId: string): Promise<string[]> {
    return await this.redis.smembers(`user:${userId}:conversations`);
  }

  async getConversationMeta(conversationId: string) {
    const data = await this.redis.hgetall(
      `conversation:${conversationId}:meta`
    );
    return {
      hasGhotokParticipant: data.hasGhotokParticipant === "1",
      moderatorId: data.moderatorId,
    };
  }

  async removeUserFromConversation(
    userId: string,
    conversationId: string
  ): Promise<void> {
    await this.redis.srem(`user:${userId}:conversations`, conversationId);
  }

  // Message Delivery Status
  async setMessageDeliveryStatus(
    messageId: string,
    status: "SENT" | "DELIVERED" | "READ"
  ): Promise<void> {
    await this.redis.setex(`message:${messageId}:status`, 86400, status); // 24 hours TTL
  }

  async getMessageDeliveryStatus(messageId: string): Promise<string | null> {
    return await this.redis.get(`message:${messageId}:status`);
  }

  // Cleanup user data
  async cleanupUserData(userId: string): Promise<void> {
    const conversations = await this.getUserConversations(userId);

    for (const conversationId of conversations) {
      await this.setTypingStatus(userId, conversationId, false);
    }

    await this.redis.del(`user:${userId}:conversations`);
    await this.setUserOffline(userId);
  }

  /*********************** TEAM CONVERSATION **************************/

  async setTeamConversation(
    teamId: string,
    conversationId: string
  ): Promise<void> {
    const client = await this.redis;
    await client.sadd(
      `team-to-team-conversation:${conversationId}:team`,
      teamId
    );
  }

  async removeTeamFromConversation(
    teamId: string,
    conversationId: string
  ): Promise<void> {
    const client = await this.redis;
    await client.srem(
      `team-to-team-conversation:${conversationId}:team`,
      teamId
    );
  }

  async cleanupTeamConversationData(teamId: string): Promise<void> {
    const client = await this.redis;

    // The key that stores all conversations this team is part of
    const conversationKey = `team:${teamId}:conversations`;
    const conversations = await client.smembers(conversationKey);

    if (conversations.length > 0) {
      for (const conversationId of conversations) {
        await client.srem(
          `team-to-team-conversation:${conversationId}:team`,
          teamId
        );
      }
    }

    // Finally, remove the team's own conversation tracking key
    await client.del(conversationKey);
  }

  /*********************** TEAM CONVERSATION **************************/

  /*********************** ADMIN & MODERATOR CONVERSATION **************************/

  async addUserToTeamConversation(
    userId: string,
    conversationId: string
  ): Promise<void> {
    const client = await this.redis;
    await client.sadd(`team-conversation:${conversationId}:users`, userId);
    await client.set(`user:${userId}:team-conversations`, conversationId);
  }

  async removeUserFromTeamConversation(
    userId: string,
    conversationId: string
  ): Promise<void> {
    await this.redis.srem(`team-conversation:${conversationId}:users`, userId);
  }

  // async getOnlineUsersInTeamConversation(
  //   conversationId: string
  // ): Promise<string[]> {
  //   const client = await this.getClient();
  //   return await client.sMembers(`team-conversation:${conversationId}:users`);
  // }

  // async setTeamTypingStatus(
  //   userId: string,
  //   conversationId: string,
  //   isTyping: boolean
  // ): Promise<void> {
  //   const client = await this.getClient();
  //   const key = `team-typing:${conversationId}:${userId}`;

  //   if (isTyping) {
  //     await client.set(key, "true", "EX", 10); // Expire after 10 seconds
  //   } else {
  //     await client.del(key);
  //   }
  // }

  async cleanupTeamUserData(userId: string): Promise<void> {
    const client = this.redis;
    // Remove from all team conversations
    const conversationKey = `user:${userId}:team-conversations`;
    const conversations = await client.get(conversationKey);

    if (conversations) {
      await client.srem(`team-conversation:${conversations}:users`, userId);
    }

    await client.del(conversationKey);
  }

  async setTemplate(id: string, title: string, content: string): Promise<void> {
    await this.redis.hset(`template:${id}`, {
      title,
      content,
    });

    await this.redis.sadd("templates:ids", id);
  }

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

  /*********************** ADMIN & MODERATOR CONVERSATION **************************/

  // Health check
  async ping(): Promise<string> {
    return await this.redis.ping();
  }
}

export const redisService = new RedisService();
