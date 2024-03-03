import moment from "moment";
import { Contact } from "../types";

export const getLatestContact = (
  contact1: Contact,
  contact2: Contact
): Contact => {
  if (moment(contact1.createdAt).isAfter(moment(contact2.createdAt))) {
    return contact1;
  } else {
    return contact2;
  }
};
