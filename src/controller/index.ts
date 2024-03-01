import { Request, Response } from "express";
import Joi from "joi";

// file imports
import { identifyContact } from "../service";
import { ContactJson } from "../types";

export async function identifyController(req: Request, res: Response) {
  const reqParams = {
    email: req.body.email,
    phoneNumber: req.body.phoneNumber,
  };

  // TODO:: check Joi validation. Currently allows unknown values as well. Ideally should only allow email and phoneNumber but both are optional fields.
  const joiSchema = Joi.object({
    email: Joi.string(),
    phoneNumber: Joi.string(),
  }).unknown(false);

  const joiResult = joiSchema.validate(reqParams);

  if (joiResult.error) {
    return res.status(400).json({ error: joiResult.error.message });
  }

  const result: ContactJson = await identifyContact(
    req.body.email,
    req.body.phoneNumber
  );

  return res.json(result);
}
