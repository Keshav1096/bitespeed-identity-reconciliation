import { Contact } from "./contact";
// Define type for database connection configuration
export interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

// Define type for the result of a database query to retrieve contacts
export interface QueryResult {
  // rowCount: number;
  rows: Contact[];
}

// Define type for database error
export interface DatabaseError {
  message: string;
  code: string;
}

// Define type for database connection
export interface DatabaseConnection {
  connect(config: DatabaseConfig): Promise<void>;
  query(queryString: string, params?: any[]): Promise<QueryResult>;
  close(): Promise<void>;
}
