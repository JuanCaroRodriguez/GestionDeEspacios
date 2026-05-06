import mongoose from "mongoose";

export class DatabaseConnection {
  private static instance: DatabaseConnection;
  private isConnected: boolean = false;

  private constructor() {}

  public static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  public async connect(): Promise<void> {
    if (this.isConnected) {
      console.log("Database already connected");
      return;
    }

    try {
      const mongoUri =
        process.env.MONGODB_URI || "mongodb://localhost:27017/gestion_espacios";

      await mongoose.connect(mongoUri, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });

      this.isConnected = true;
      console.log("✅ Database connected successfully");

      // Handle connection events
      mongoose.connection.on("error", (error) => {
        console.error("❌ Database connection error:", error);
      });

      mongoose.connection.on("disconnected", () => {
        console.log("⚠️ Database disconnected");
        this.isConnected = false;
      });

      mongoose.connection.on("reconnected", () => {
        console.log("✅ Database reconnected");
        this.isConnected = true;
      });
    } catch (error) {
      console.warn(
        "⚠️ Database connection failed, running in mock mode:",
        error,
      );
      console.log("🔄 Server will run without database persistence");
      this.isConnected = false;
      // Don't throw error, allow server to run without database
    }
  }

  public async disconnect(): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      await mongoose.disconnect();
      this.isConnected = false;
      console.log("✅ Database disconnected successfully");
    } catch (error) {
      console.error("❌ Error disconnecting from database:", error);
      throw error;
    }
  }

  public isConnectionActive(): boolean {
    return this.isConnected && mongoose.connection.readyState === 1;
  }
}
