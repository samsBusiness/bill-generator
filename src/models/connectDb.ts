// utils/connectDb.ts
import mongoose from "mongoose";

interface ConnectionType {
  isConnected?: number;
}

const connection: ConnectionType = {};

const connectDb = async () => {
  console.log("HERE");
  if (connection.isConnected) {
    // Use existing database connection
    return;
  }

  try {
    console.log("*****************Connecting", process.env.MONGODB_URI);
    const db = await mongoose.connect(process.env.MONGODB_URI as string);

    connection.isConnected = db.connections[0].readyState;
    console.log("MongoDB connected");
  } catch (error) {
    console.error(error);
  }
};

export default connectDb;
