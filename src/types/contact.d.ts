// Define type for a user object retrieved from the database
export interface Contact {
  id?: number;
  email?: string;
  phoneNumber?: string;
  linkedId?: number;
  linkPrecedence: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

// Note: First elements of emails and phoneNumbers should be of the first contact.
export interface ContactJson {
  primaryContactId: number;
  emails: string[]; // first element being email of primary contact
  phoneNumbers: string[]; // first element being phoneNumber of primary contact
  secondaryContactIds: number[];
}
