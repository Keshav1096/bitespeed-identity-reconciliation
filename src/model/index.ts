import { boolean } from "joi";
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

  const query: string = `Select email, phone_number as "phoneNumber", id, linked_id as "linkedId", link_precedence as "linkPrecedence", created_at as "createdAt", updated_at as "updatedAt", deleted_at as "deletedAt" from contact ${whereClause}`;

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

export async function updateContact(
  linkedId: number,
  linkPrecedence: string,
  id: number
): Promise<Contact> {
  const query = `UPDATE contact SET 
	linked_id = $1, link_precedence = $2
	WHERE id = $3 RETURNING id, phone_number as "phoneNumber", email as "email", linked_id as "linkedId", link_precedence as "linkPrecedence", created_at as "createdAt", updated_at as "updatedAt", deleted_at as "deletedAt";`;
  const params = [linkedId, linkPrecedence, id];

  const result = await executeQuery(query, params);

  return result.rows[0];
}

export async function getContactBasedOnCondition(
  linkId: number,
  linkedPrecedence: string
): Promise<Contact[]> {
  const query = `SELECT id, phone_number as "phoneNumber", email as "email", linked_id as "linkedId", link_precedence as "linkPrecedence", created_at as "createdAt", updated_at as "updatedAt", deleted_at as "deletedAt" from contact
	WHERE 
  ${linkId ? `linked_id = '${linkId}'` : ""}
  ${
    linkedPrecedence
      ? ` ${linkId ? " and " : ""} link_precedence = '${linkedPrecedence}'`
      : ""
  }
  ;`;

  const result = await executeQuery(query, []);

  return result.rows;
}

export async function getContactBasedOnId(id: number): Promise<Contact> {
  const query = `SELECT id, phone_number as "phoneNumber", email as "email", linked_id as "linkedId", link_precedence as "linkPrecedence", created_at as "createdAt", updated_at as "updatedAt", deleted_at as "deletedAt" from contact
	WHERE id = $1;`;

  const result = await executeQuery(query, [id]);

  return result.rows[0];
}

export async function readExistingContact(
  email: string | null,
  phoneNumber: string | null
): Promise<boolean> {
  let whereClause: string;

  if (email && phoneNumber) {
    whereClause = `where email = '${email}' and phone_number = '${phoneNumber}'`;
  } else if (email && !phoneNumber) {
    whereClause = `where email = '${email}' and phone_number is null`;
  } else if (!email && phoneNumber) {
    whereClause = `where email is null and phone_number = '${phoneNumber}'`;
  } else {
    return Promise.reject();
  }
  const query = `select id from contact ${whereClause}`;

  const result = await executeQuery(query, []);

  return result.rowCount ? true : false;
}
