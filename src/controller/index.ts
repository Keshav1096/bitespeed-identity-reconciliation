import { Request, Response } from "express";
import * as Joi from "joi";

// file imports
import { identifyContact } from "../service";

export async function identifyController(req: Request, res: Response) {
  console.log("req >>>> ", req);
  const reqParams = {
    email: req.body.email,
    phoneNumber: req.body.phoneNumber,
  };

  const joiSchema = Joi.object({
    email: Joi.string().optional(),
    phoneNumber: Joi.number().optional(),
  });

  const joiResult = joiSchema.validate(reqParams);

  if (joiResult.error) {
    throw joiResult.error;
  }

  const result = await identifyContact(req.body.email, req.body.phoneNumber);

  return res.json(result);
}
