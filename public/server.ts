import cors from "cors";
import express from "express";

import { db } from "./db";


const app = express();

app.use(cors({
  origin: ["http://127.0.0.1:5500", "http://localhost:5500"],
  methods: ["GET", "POST", "PUT", "DELETE"],
}));

app.use(express.json());


app.use(express.json());

app.get("/health/db", async (_req, res) => {
  const result = await db.query("SELECT NOW() as now");
  res.json({ ok: true, now: result.rows[0].now });
});

app.listen(4000, () => console.log("API running http://localhost:4000"));

