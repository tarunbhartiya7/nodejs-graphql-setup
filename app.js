import express from "express";
import mongoose from "mongoose";
import { ApolloServer } from "apollo-server-express";
import jwt from "jsonwebtoken";

import { apolloResolvers } from "./graphql/resolvers.js";
import { typeDefs } from "./graphql/schema.js";
const app = express();
const port = 3000;
const server = new ApolloServer({
  typeDefs,
  resolvers: apolloResolvers,
  context: ({ req }) => {
    /* This middleware will run every request that reaches our end point but it will not deny any request if
there is no token but just set some parameters which will help us identify whether user is authenticated or not
*/
    const token = req.headers.authorization;
    if (token) {
      const decodedToken = jwt.verify(token, "supersecretkey");
      return { userId: decodedToken.userId };
    }
  },
  formatError: (err) => {
    if (!err.originalError) {
      return err;
    }
    const { data } = err.originalError;
    const message = err.message || "An error occurred.";
    const code = err.originalError.code || 500;
    return {
      message,
      status: code,
      data,
    };
  },
});
server.applyMiddleware({ app });

// enable CORS
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "*"); // Explicitly GET, POST, PUT, DELETE, PATCH, OPTIONS
  res.setHeader("Access-Control-Allow-Headers", "*"); // Content-Type, Authorization
  if (req.method === "OPTIONS") {
    return res.statusCode(200);
  }
  next();
});

app.get("/", (req, res) => {
  res.send("Nodejs Express app for GraphQL APIs");
});

// app.use((error, req, res, next) => {
//   const { message, data } = error;
//   // 500 is server side error
//   res.status(error.statusCode || 500).json({
//     message,
//     data,
//   });
// });

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
