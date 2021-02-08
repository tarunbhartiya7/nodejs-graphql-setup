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
    # this is one to many relation between
    # user and post where one user cna be the creator of multiple posts
    post: [Post!]!
  }

  input UserInputData {
    email: String!
    name: String!
    password: String!
  }

  type RootMutation {
    createUser(userInput: UserInputData): User!
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
