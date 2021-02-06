import { buildSchema } from "graphql";

// export const querySchema = buildSchema(`
//   type TestData {
//     text: String!
//     views: Int!
//   }

//   type RootQuery {
//     hello: TestData
//   }

//   schema {
//     query: RootQuery
//   }
// `);

export const graphqlSchema = buildSchema(`
  type TestData {
    text: String!
    views: Int!
  }
  
  type RootQuery {
    hello: TestData
  }

  type Post {
    _id: ID!
    title: String!
    content: String!
    creator: User!
    createdAt: String!
    updatedAt: String!
  }

  type User {
    _id: ID!
    email: String!
    name: String!
    password: String!
    status: String!
    post: [Post!]!
  }

  input UserInputData {
    email: String!
    name: String!
    password: String!
  }

  type RootMutation {
    signup(userInput: UserInputData): User!
  }

  schema {
    query: RootQuery
    mutation: RootMutation
  }
`);

// const graphqlSchema = buildSchema(`
//   type Query {
//     hello: String
//   }
// `);
