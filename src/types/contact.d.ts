enum LinkPrecedence {
  Primary = "primary",
  Secondary = "secondary",
}
// Define type for a user object retrieved from the database
export interface Contact {
  id: number;
  email: string;
  phoneNumber: number;
  linkedId: number;
  linkPrecedence: LinkPrecedence;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
}
