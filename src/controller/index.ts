import { Request, Response } from "express";
import Joi from "joi";

// file imports
import { identifyContact } from "../service";
import { ContactJson, ContactResponse, IdentifyRequest } from "../types";

export async function identifyController(req: Request, res: Response) {
  const reqParams = {
    email: req.body.email,
    phoneNumber: req.body.phoneNumber,
  };

  // TODO:: check Joi validation. Currently allows unknown values as well. Ideally should only allow email and phoneNumber but both are optional fields.
  const joiSchema = Joi.object({
    email: Joi.string().required().allow(null),
    phoneNumber: Joi.string().required().allow(null),
  }).unknown(false);

  const joiResult = joiSchema.validate(reqParams);

  if (joiResult.error) {
    return res.status(400).json({ error: joiResult.error.message });
  }

  const identifyReq: IdentifyRequest = {
    email: req.body.email,
    phoneNumber: req.body.phoneNumber,
  };
  const result = await identifyContact(identifyReq);

  return res.json(result);
}
