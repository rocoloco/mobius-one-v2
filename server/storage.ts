import { 
  users, conversations, messages, systemConnections,
  type User, type InsertUser, 
  type Conversation, type InsertConversation,
  type Message, type InsertMessage,
  type SystemConnection, type InsertSystemConnection
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Conversations
  getConversation(id: number): Promise<Conversation | undefined>;
  getConversationsByUserId(userId: number): Promise<Conversation[]>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  updateConversation(id: number, updates: Partial<Conversation>): Promise<Conversation | undefined>;

  // Messages
  getMessage(id: number): Promise<Message | undefined>;
  getMessagesByConversationId(conversationId: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;

  // System Connections
  getSystemConnection(userId: number, systemType: string): Promise<SystemConnection | undefined>;
  getSystemConnectionsByUserId(userId: number): Promise<SystemConnection[]>;
  createSystemConnection(connection: InsertSystemConnection): Promise<SystemConnection>;
  updateSystemConnection(id: number, updates: Partial<SystemConnection>): Promise<SystemConnection | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getConversation(id: number): Promise<Conversation | undefined> {
    const [conversation] = await db.select().from(conversations).where(eq(conversations.id, id));
    return conversation || undefined;
  }

  async getConversationsByUserId(userId: number): Promise<Conversation[]> {
    return await db.select().from(conversations).where(eq(conversations.userId, userId));
  }

  async createConversation(insertConversation: InsertConversation): Promise<Conversation> {
    const [conversation] = await db
      .insert(conversations)
      .values(insertConversation)
      .returning();
    return conversation;
  }

  async updateConversation(id: number, updates: Partial<Conversation>): Promise<Conversation | undefined> {
    const [conversation] = await db
      .update(conversations)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(conversations.id, id))
      .returning();
    return conversation || undefined;
  }

  async getMessage(id: number): Promise<Message | undefined> {
    const [message] = await db.select().from(messages).where(eq(messages.id, id));
    return message || undefined;
  }

  async getMessagesByConversationId(conversationId: number): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(messages.createdAt);
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db
      .insert(messages)
      .values(insertMessage)
      .returning();
    return message;
  }

  async getSystemConnection(userId: number, systemType: string): Promise<SystemConnection | undefined> {
    const [connection] = await db
      .select()
      .from(systemConnections)
      .where(and(eq(systemConnections.userId, userId), eq(systemConnections.systemType, systemType)));
    return connection || undefined;
  }

  async getSystemConnectionsByUserId(userId: number): Promise<SystemConnection[]> {
    return await db
      .select()
      .from(systemConnections)
      .where(eq(systemConnections.userId, userId));
  }

  async createSystemConnection(insertConnection: InsertSystemConnection): Promise<SystemConnection> {
    const [connection] = await db
      .insert(systemConnections)
      .values(insertConnection)
      .returning();
    return connection;
  }

  async updateSystemConnection(id: number, updates: Partial<SystemConnection>): Promise<SystemConnection | undefined> {
    const [connection] = await db
      .update(systemConnections)
      .set(updates)
      .where(eq(systemConnections.id, id))
      .returning();
    return connection || undefined;
  }
}

export const storage = new DatabaseStorage();
