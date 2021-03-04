import express from "express";
import mongoose from "mongoose";
import { ApolloServer } from "apollo-server-express";
import jwt from "jsonwebtoken";
import helmet from "helmet";
import morgan from "morgan";

import { apolloResolvers } from "./graphql/resolvers.js";
import { typeDefs } from "./graphql/schema.js";
const app = express();
const port = process.env.PORT || 3000;

// enable secure headers
// app.use(helmet());

// enable logging, not required since it is handled by hosting provider
// app.use(morgan("combined"));

const server = new ApolloServer({
  typeDefs,
  resolvers: apolloResolvers,
  context: ({ req }) => {
    /* This middleware will run every request that reaches our end point but it will not deny any request if
there is no token but just set some parameters which will help us identify whether user is authenticated or not
*/
    const token = req.headers.authorization;
    if (token) {
      const decodedToken = jwt.verify(token, process.env.SECRET_KEY);
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

mongoose
  .connect(
    `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.3iiam.mongodb.net/${process.env.MONGO_DATABASE}`,
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
