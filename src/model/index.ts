import { executeQuery } from "../db";
import { QueryResult } from "../types";

export async function readContacts(
  email: string,
  phoneNumber: number
): Promise<QueryResult> {
  const whereClause = `where email = $1 and phone_number = $2`;
  const query: string = `Select * from contact ${
    email && phoneNumber ? whereClause : ""
  }`;

  const params = [email, phoneNumber];
  const result: QueryResult = await executeQuery(query, params);

  return result;
}
