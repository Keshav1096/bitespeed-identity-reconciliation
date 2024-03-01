import { insertContact, readContacts } from "../model";
import { Contact, ContactJson } from "../types";

export async function identifyContact(
  email: string,
  phoneNumber: string
): Promise<ContactJson> {
  const contacts = await readContacts(email, phoneNumber);

  let isNewContact: boolean = !contacts.length ? true : false; // If the returned contacts is 0, this is a new contact.

  let newContact: Contact;
  let responseContact: ContactJson = {
    primaryContactId: 0,
    emails: [],
    phoneNumbers: [],
    secondaryContactIds: [],
  };

  if (isNewContact) {
    newContact = await handleNewContact(email, phoneNumber);
    const primaryContactId: number = newContact.id || 0;
    const emails = [];
    const phoneNumbers = [];

    emails.push(newContact.email !== undefined ? newContact.email : "");
    phoneNumbers.push(
      newContact.phoneNumber !== undefined ? newContact.phoneNumber : ""
    );

    responseContact = {
      primaryContactId: primaryContactId,
      emails: emails,
      phoneNumbers: phoneNumbers,
      secondaryContactIds: [],
    };
  }

  return responseContact;
}

async function handleNewContact(
  email: string,
  phoneNumber: string
): Promise<Contact> {
  const contact: Contact = {
    email: email,
    phoneNumber: phoneNumber,
    linkPrecedence: "primary",
  };

  const insertedContact = await insertContact(contact);

  return insertedContact;
}
