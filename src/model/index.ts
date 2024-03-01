import { executeQuery } from "../db";
import { Contact, QueryResult } from "../types";

export async function readContacts(
  email: string = "",
  phoneNumber: string = ""
): Promise<Contact[]> {
  let whereClause: string;

  if (email && phoneNumber) {
    whereClause = `where email = '${email}' or phone_number = '${phoneNumber}'`;
  } else if (email) {
    whereClause = `where email = '${email}'`;
  } else if (phoneNumber) {
    whereClause = `where phone_number = '${phoneNumber}'`;
  } else {
    throw new Error("email and phone number not present"); // This condition will not happen since Joi validation takes care of this.
  }

  const query: string = `Select * from contact ${whereClause}`;

  const result: QueryResult = await executeQuery(query, []);

  return result.rows;
}

export async function insertContact(contact: Contact): Promise<Contact> {
  const query = `INSERT INTO contact(
	phone_number, email, linked_id, link_precedence)
	VALUES ($1, $2, $3, $4) RETURNING id, phone_number as "phoneNumber", email as "email", linked_id as "linkedId", link_precedence as "linkPrecedence", created_at as "createdAt", updated_at as "updatedAt", deleted_at as "deletedAt";`;
  const params = [
    contact.phoneNumber,
    contact.email,
    contact.linkedId,
    contact.linkPrecedence,
  ];

  const result = await executeQuery(query, params);

  return result.rows[0];
}
