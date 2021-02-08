import express from "express";
import { graphqlHTTP } from "express-graphql";
import mongoose from "mongoose";

import { hello, createUser } from "./graphql/resolvers.js";
import { graphqlSchema } from "./graphql/schema.js";

const app = express();
const port = 3000;

// enable CORS
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "*"); // Explicitly GET, POST, PUT, DELETE, PATCH, OPTIONS
  res.setHeader("Access-Control-Allow-Headers", "*"); // Content-Type, Authorization
  next();
});

app.use(
  "/graphql",
  graphqlHTTP({
    schema: graphqlSchema,
    rootValue: { hello, createUser },
    graphiql: true,
  })
);

app.get("/", (req, res) => {
  res.send("Nodejs Express app for GraphQL APIs");
});

app.use((error, req, res, next) => {
  const { message, data } = error;
  // 500 is server side error
  res.status(error.statusCode || 500).json({
    message,
    data,
  });
});

mongoose
  .connect(
    "mongodb+srv://sam:CLguEEdLPjyNTBZg@cluster0.3iiam.mongodb.net/graphql-posts?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => {
    app.listen(port, () => {
      console.log(`Example app listening at http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.log(err);
    throw err;
  });
