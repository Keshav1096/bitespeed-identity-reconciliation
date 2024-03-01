/**
 * 
	{
		"contact":{
			"primaryContatctId": 1,
			"emails": ["lorraine@hillvalley.edu","mcfly@hillvalley.edu"]
			"phoneNumbers": ["123456"]
			"secondaryContactIds": [23]
		}
	}
 */

import { readContacts } from "../model";
import { Contact, QueryResult } from "../types";

export async function identifyContact(
  email: string,
  phoneNumber: number
): Promise<Contact[]> {
  const response: QueryResult = await readContacts(email, phoneNumber);
  const responseRows: Contact[] = response.rows;
  return responseRows;
}
