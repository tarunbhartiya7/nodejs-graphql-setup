import express from "express";
import { graphqlHTTP } from "express-graphql";

import { hello, signup } from "./graphql/resolvers.js";
import { graphqlSchema } from "./graphql/schema.js";

const app = express();
const port = 3000;

app.use(
  "/graphql",
  graphqlHTTP({
    schema: graphqlSchema,
    rootValue: { hello, signup },
    graphiql: true,
  })
);

app.get("/", (req, res) => {
  res.send("Nodejs Express app for GraphQL APIs");
});

app.listen(port, () => {
  console.log(`GraphQL app listening at http://localhost:${port}`);
});
