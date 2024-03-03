import {
  getPrimaryAndSecondaryContactsBasedOnPrimaryId,
  insertContact,
  readExistingContact,
  readPrimaryContacts,
  updateContact,
} from "../model";
import {
  Contact,
  ContactJson,
  ContactResponse,
  IdentifyRequest,
} from "../types";

import { getLatestContact } from "../utils";

export async function identifyContact(
  identifyReq: IdentifyRequest
): Promise<ContactResponse> {
  let primaryContactId: number = 0;
  let skipContactCreation: boolean = false;

  const { email, phoneNumber } = identifyReq;

  // Check if primary contact exists
  const primaryContacts: Contact[] = await readPrimaryContacts(
    email,
    phoneNumber
  );

  const isPrimaryContactPresent = checkIfPrimaryContactExists(primaryContacts);

  // If primary contact is not present, create a new contact
  if (!isPrimaryContactPresent) {
    const insertedContact: Contact = await createNewContact(
      email,
      phoneNumber,
      "primary",
      null
    );
    primaryContactId = insertedContact.id!;
  }

  // Check if two primary contacts are returned. If two are returned, set the latest contact as secondary
  if (primaryContacts.length > 1) {
    primaryContactId = await handleTwoPrimaryContacts(primaryContacts);
    skipContactCreation = true;
  } else if (primaryContacts.length === 1) {
    primaryContactId = primaryContacts[0].id!;
  }

  // Since primary contact is present, check if exact contact is present
  const isDuplicateContact: boolean = await checkExistingContact(
    email,
    phoneNumber
  );

  if (!isDuplicateContact && !skipContactCreation) {
    // Add contact as secondary
    await createNewContact(email, phoneNumber, "secondary", primaryContactId);
  }

  const response = await buildResponse(primaryContactId);

  return { contact: response };
}

const checkIfPrimaryContactExists = (primaryContacts: Contact[]): boolean => {
  let isExists: boolean;
  if (primaryContacts.length > 0) {
    isExists = true;
  } else {
    isExists = false;
  }
  return isExists;
};

const createNewContact = async (
  email: string,
  phoneNumber: string,
  linkPrecedence: "primary" | "secondary",
  linkedId: number | null
): Promise<Contact> => {
  const newContact: Contact = {
    email: email,
    phoneNumber: phoneNumber,
    linkPrecedence: linkPrecedence,
    ...(linkedId && { linkedId: linkedId }),
  };

  const insertedContact: Contact = await insertContact(newContact);
  return insertedContact;
};

const checkExistingContact = async (
  email: string,
  phoneNumber: string
): Promise<boolean> => {
  return await readExistingContact(email, phoneNumber);
};

const handleTwoPrimaryContacts = async (
  primaryContacts: Contact[]
): Promise<number> => {
  const latestContact = getLatestContact(
    primaryContacts[0],
    primaryContacts[1]
  ); // Passing 0th and 1st element since not more than 2 records can exist

  const earliestContact = primaryContacts.find(
    (contact) => contact.id !== latestContact.id
  );
  latestContact.linkedId = earliestContact?.id;
  latestContact.linkPrecedence = "secondary";
  await updateContact(
    latestContact.linkedId!,
    latestContact.linkPrecedence!,
    latestContact.id!
  );

  return earliestContact?.id!;
};

const buildResponse = async (
  primaryContactId: number
): Promise<ContactJson> => {
  // Use the primary contact id to fetch the primary contact and all its secondary contact
  const primaryAndSecondaryContacts: Contact[] =
    await getPrimaryAndSecondaryContactsBasedOnPrimaryId(primaryContactId);

  const responseJson: ContactJson = {
    primaryContactId: 0,
    emails: [],
    phoneNumbers: [],
    secondaryContactIds: [],
  };

  const primaryContact: Contact = primaryAndSecondaryContacts.find(
    (contact) => contact.linkPrecedence === "primary"
  )!;
  responseJson.primaryContactId = primaryContact.id!;
  responseJson.emails.push(primaryContact.email!);
  responseJson.phoneNumbers.push(primaryContact.phoneNumber!);

  primaryAndSecondaryContacts.forEach((contact) => {
    if (contact.linkPrecedence === "secondary") {
      responseJson.emails.push(contact.email!);
      responseJson.phoneNumbers.push(contact.phoneNumber!);
      responseJson.secondaryContactIds.push(contact.id!);
    }
  });

  responseJson.emails = [...new Set(responseJson.emails.filter(Boolean))];
  responseJson.phoneNumbers = [
    ...new Set(responseJson.phoneNumbers.filter(Boolean)),
  ];
  responseJson.secondaryContactIds = [
    ...new Set(responseJson.secondaryContactIds.filter(Boolean)),
  ];

  return responseJson;
};
