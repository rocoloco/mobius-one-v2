import { 
  users, conversations, messages, systemConnections,
  type User, type InsertUser, 
  type Conversation, type InsertConversation,
  type Message, type InsertMessage,
  type SystemConnection, type InsertSystemConnection
} from "@shared/schema";

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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private conversations: Map<number, Conversation>;
  private messages: Map<number, Message>;
  private systemConnections: Map<number, SystemConnection>;
  private currentUserId: number;
  private currentConversationId: number;
  private currentMessageId: number;
  private currentConnectionId: number;

  constructor() {
    this.users = new Map();
    this.conversations = new Map();
    this.messages = new Map();
    this.systemConnections = new Map();
    this.currentUserId = 1;
    this.currentConversationId = 1;
    this.currentMessageId = 1;
    this.currentConnectionId = 1;

    // Create default user
    this.createUser({
      username: "johndoe",
      password: "password",
      name: "John Doe",
      role: "Sales Manager",
      initials: "JD"
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id,
    };
    this.users.set(id, user);
    return user;
  }

  async getConversation(id: number): Promise<Conversation | undefined> {
    return this.conversations.get(id);
  }

  async getConversationsByUserId(userId: number): Promise<Conversation[]> {
    return Array.from(this.conversations.values())
      .filter(conv => conv.userId === userId)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  async createConversation(insertConversation: InsertConversation): Promise<Conversation> {
    const id = this.currentConversationId++;
    const now = new Date();
    const conversation: Conversation = {
      ...insertConversation,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.conversations.set(id, conversation);
    return conversation;
  }

  async updateConversation(id: number, updates: Partial<Conversation>): Promise<Conversation | undefined> {
    const conversation = this.conversations.get(id);
    if (!conversation) return undefined;
    
    const updated = { ...conversation, ...updates, updatedAt: new Date() };
    this.conversations.set(id, updated);
    return updated;
  }

  async getMessage(id: number): Promise<Message | undefined> {
    return this.messages.get(id);
  }

  async getMessagesByConversationId(conversationId: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(msg => msg.conversationId === conversationId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.currentMessageId++;
    const message: Message = {
      ...insertMessage,
      id,
      createdAt: new Date(),
    };
    this.messages.set(id, message);
    return message;
  }

  async getSystemConnection(userId: number, systemType: string): Promise<SystemConnection | undefined> {
    return Array.from(this.systemConnections.values())
      .find(conn => conn.userId === userId && conn.systemType === systemType);
  }

  async getSystemConnectionsByUserId(userId: number): Promise<SystemConnection[]> {
    return Array.from(this.systemConnections.values())
      .filter(conn => conn.userId === userId);
  }

  async createSystemConnection(insertConnection: InsertSystemConnection): Promise<SystemConnection> {
    const id = this.currentConnectionId++;
    const connection: SystemConnection = {
      ...insertConnection,
      id,
      lastSync: new Date(),
    };
    this.systemConnections.set(id, connection);
    return connection;
  }

  async updateSystemConnection(id: number, updates: Partial<SystemConnection>): Promise<SystemConnection | undefined> {
    const connection = this.systemConnections.get(id);
    if (!connection) return undefined;
    
    const updated = { ...connection, ...updates };
    this.systemConnections.set(id, updated);
    return updated;
  }
}

export const storage = new MemStorage();
