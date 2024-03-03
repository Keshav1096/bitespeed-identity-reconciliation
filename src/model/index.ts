import { executeQuery } from "../db";
import { Contact, QueryResult } from "../types";

export async function readPrimaryContacts(
  email: string = "",
  phoneNumber: string = ""
): Promise<Contact[]> {
  let whereClause: string;

  if (email && phoneNumber) {
    whereClause = `where link_precedence = 'primary' and  email = '${email}' or phone_number = '${phoneNumber}' and deleted_at is null`;
  } else if (email) {
    whereClause = `where link_precedence = 'primary' and email = '${email}' and deleted_at is null`;
  } else if (phoneNumber) {
    whereClause = `where link_precedence = 'primary' and phone_number = '${phoneNumber}' and deleted_at is null`;
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
	WHERE id = $3 and deleted_at is null RETURNING id, phone_number as "phoneNumber", email as "email", linked_id as "linkedId", link_precedence as "linkPrecedence", created_at as "createdAt", updated_at as "updatedAt", deleted_at as "deletedAt";`;
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
  and deleted_at is null;`;

  const result = await executeQuery(query, []);

  return result.rows;
}

export async function getContactBasedOnId(id: number): Promise<Contact> {
  const query = `SELECT id, phone_number as "phoneNumber", email as "email", linked_id as "linkedId", link_precedence as "linkPrecedence", created_at as "createdAt", updated_at as "updatedAt", deleted_at as "deletedAt" from contact
	WHERE id = $1 and deleted_at is null;`;

  const result = await executeQuery(query, [id]);

  return result.rows[0];
}

export async function readExistingContact(
  email: string | null,
  phoneNumber: string | null
): Promise<boolean> {
  let whereClause: string;

  if (email && phoneNumber) {
    whereClause = `where email = '${email}' and phone_number = '${phoneNumber}' and deleted_at is null`;
  } else if (email && !phoneNumber) {
    whereClause = `where email = '${email}' and phone_number is null and deleted_at is null`;
  } else if (!email && phoneNumber) {
    whereClause = `where email is null and phone_number = '${phoneNumber}' and deleted_at is null`;
  } else {
    return Promise.reject();
  }
  const query = `select id from contact ${whereClause}`;

  const result = await executeQuery(query, []);

  return result.rowCount ? true : false;
}

export async function getPrimaryAndSecondaryContactsBasedOnPrimaryId(
  id: number
): Promise<Contact[]> {
  const query = `select email, phone_number as "phoneNumber", id, linked_id as "linkedId", link_precedence as "linkPrecedence", created_at as "createdAt", updated_at as "updatedAt", deleted_at as "deletedAt" from contact where deleted_at is null and (id = $1 or linked_id = $1);`;
  const params = [id];

  const result = await executeQuery(query, params);

  return result.rows;
}
