// package imports
import express, { Request, Response } from "express";
import dotenv from "dotenv";

// file imports
import router from "./routes";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get("/healthz", (req: Request, res: Response) => {
  res.send("OK!");
});

app.use("/", router);

app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});
