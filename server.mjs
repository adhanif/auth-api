import express from "express";
import cors from "cors";
import "./loadEnv.mjs";
const app = express();

const corsOptions = {
  origin: "http://localhost:8081",
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

import db from "./models/index.js";


db.mongoose
  .connect(
    process.env.DB_URL,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  )
  .then(() => {
    console.log("Successfully connect to MongoDB.");
  })
  .catch((err) => {
    console.error("Connection error", err);
    process.exit();
  });
// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to Auth server application." });
});

// routes
import routes from "./routes/auth.routes.js";
routes(app)

// set port, listen for requests
const serverPort = process.env.PORT || 8080;
app.listen(serverPort, () => {
  console.log(`Auth server is running on port ${serverPort}.`);
});