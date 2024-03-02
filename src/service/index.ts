import {
  getContactBasedOnCondition,
  getContactBasedOnId,
  insertContact,
  readContacts,
  readExistingContact,
  updateContact,
} from "../model";
import { Contact, ContactJson, IdentifyRequest } from "../types";

import { getLatestContact } from "../utils";

async function checkExistingContact(
  email: string,
  phoneNumber: string
): Promise<boolean> {
  return await readExistingContact(email, phoneNumber);
}

export async function identifyContact(identifyReq: IdentifyRequest) {
  /**
   * 1. based on email or phonenumber, fetch the record from db. If the record has linkPrecedence as secondary, fetch the linkedId which is always primary
   * 2. fetch all records with LinkedId as primary records id.
   */
  const { email, phoneNumber } = identifyReq;
  // Fetch the matching record
  let matchingContacts: Contact[] = await readContacts(
    identifyReq.email,
    identifyReq.phoneNumber
  );

  // Initiaizing response structure
  let responseContact: ContactJson = {
    primaryContactId: 0,
    emails: [],
    phoneNumbers: [],
    secondaryContactIds: [],
  };

  if (matchingContacts && matchingContacts.length === 0) {
    // There are no pre existing records
    // Create a new record here
    return await createNewContact(email, phoneNumber, responseContact);
  }

  // Find primary contact from list of matching contacts
  let primaryContact: Contact | undefined = matchingContacts.find(
    (matchingContact) => matchingContact.linkPrecedence === "primary"
  );

  let primaryContactId: number;
  if (primaryContact === undefined) {
    // get primary contact based on secondary contact id
    primaryContactId = matchingContacts[0].linkedId!;
    primaryContact = await getContactBasedOnId(primaryContactId!);
  }

  if (matchingContacts.length === 1) {
    const isExistingContact = await checkExistingContact(email, phoneNumber);
    if (!isExistingContact) {
      // If there is no existing contact of the same type, create a new contact
      let __return;
      ({ __return, responseContact } = await handleNonExistingContact(
        email,
        phoneNumber,
        responseContact
      ));
      return __return;
    }
  }

  matchingContacts = matchingContacts.filter(
    (contact) => contact.linkPrecedence === "primary"
  );
  if (matchingContacts.length > 1) {
    // There are multiple records with link precedence as primary and matching email or phoneNumber (ideally maximum of two records can exist for a given combination of email and phoneNumber)
    // Update the latest record to secondary link precedence

    return await handleMultipleMatchingContacts(
      matchingContacts,
      responseContact
    );
  }

  responseContact.primaryContactId = primaryContact.id!;

  responseContact.emails.push(primaryContact.email!);
  responseContact.phoneNumbers.push(primaryContact.phoneNumber!);

  const secondaryContacts: Contact[] = await getContactBasedOnCondition(
    primaryContactId!,
    "secondary"
  );

  secondaryContacts.forEach((secondaryContact) => {
    responseContact.emails.push(secondaryContact.email!);
    responseContact.phoneNumbers.push(secondaryContact.phoneNumber!);
    responseContact.secondaryContactIds.push(secondaryContact.id!);
  });

  responseContact.emails = [...new Set(responseContact.emails.filter(Boolean))];
  responseContact.phoneNumbers = [
    ...new Set(responseContact.phoneNumbers.filter(Boolean)),
  ];
  responseContact.secondaryContactIds = [
    ...new Set(responseContact.secondaryContactIds.filter(Boolean)),
  ];
  return { contact: responseContact };
}
async function handleNonExistingContact(
  email: string,
  phoneNumber: string,
  responseContact: ContactJson
) {
  const contact: Contact = {
    email: email,
    phoneNumber: phoneNumber,
    linkPrecedence: "primary",
  };

  const insertedContact = await insertContact(contact);
  const primaryContactId: number = insertedContact.id || 0;
  const emails = [];
  const phoneNumbers = [];

  emails.push(insertedContact.email !== undefined ? insertedContact.email : "");
  phoneNumbers.push(
    insertedContact.phoneNumber !== undefined ? insertedContact.phoneNumber : ""
  );

  responseContact = {
    primaryContactId: primaryContactId,
    emails: emails,
    phoneNumbers: phoneNumbers,
    secondaryContactIds: [],
  };
  return { __return: { contact: responseContact }, responseContact };
}

async function handleMultipleMatchingContacts(
  matchingContacts: Contact[],
  responseContact: ContactJson
) {
  const latestContact = getLatestContact(
    matchingContacts[0],
    matchingContacts[1]
  ); // Passing 0th and 1st element since not more than 2 records can exist
  const earliestContact = matchingContacts.find(
    (contact) => contact.id !== latestContact.id
  );
  latestContact.linkedId = earliestContact?.id;
  latestContact.linkPrecedence = "secondary";
  await updateContact(
    latestContact.linkedId!,
    latestContact.linkPrecedence!,
    latestContact.id!
  );

  // Set the primary contact id
  responseContact.primaryContactId = earliestContact?.id!;

  // Set the emails
  responseContact.emails.push(earliestContact?.email!);
  responseContact.emails.push(latestContact?.email!);

  // Set the phoneNumbers
  responseContact.phoneNumbers.push(earliestContact?.phoneNumber!);
  responseContact.phoneNumbers.push(latestContact?.phoneNumber!);

  // Set the secondaryContactIds
  responseContact.secondaryContactIds.push(latestContact.id!);

  return { contact: responseContact };
}

async function createNewContact(
  email: string,
  phoneNumber: string,
  responseContact: ContactJson
) {
  const newContact: Contact = {
    email: email,
    phoneNumber: phoneNumber,
    linkPrecedence: "primary",
  };

  const insertedContact: Contact = await insertContact(newContact);
  responseContact.primaryContactId = insertedContact.id!;

  responseContact.emails.push(insertedContact.email!);
  responseContact.phoneNumbers.push(insertedContact.phoneNumber!);

  return { contact: responseContact };
}
