import express from "express";

// file imports
import { identifyController } from "../controller";

const router = express.Router();

router.route("/identify").post(identifyController);

export default router;
