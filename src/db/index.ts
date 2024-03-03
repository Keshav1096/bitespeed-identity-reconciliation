import { Pool, QueryResult } from "pg";
import { DatabaseConfig } from "../types";
import dotenv from "dotenv";

dotenv.config();

const dbConfig: DatabaseConfig = {
  user: process.env.PG_USER_NAME || "postgres",
  host: process.env.PG_HOST || "localhost",
  database: process.env.PG_DATABASE || "postgres",
  password: process.env.PG_PASSWORD || "password",
  port: process.env.PG_PORT ? parseInt(process.env.PG_PORT) : 5432,
};

// Connection configuration
const pool = new Pool(dbConfig);

export async function executeQuery(
  query: string,
  params: any[]
): Promise<QueryResult> {
  const client = await pool.connect();
  try {
    const res: QueryResult = await client.query(query, params);

    return res;
  } catch (error) {
    throw error;
  } finally {
    client.release(); // Release the client back to the pool
  }
}
