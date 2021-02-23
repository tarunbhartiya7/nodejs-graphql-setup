import { gql } from "apollo-server-express";

export const typeDefs = gql`
  type Book {
    title: String
    author: String
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
    post: [Post!]!
  }

  input UserInputData {
    email: String!
    name: String!
    password: String!
  }

  input PostInputData {
    title: String!
    content: String!
  }

  type AuthData {
    token: String!
    userId: String!
  }

  type Query {
    books: [Book]
    login(email: String!, password: String!): AuthData!
  }

  type Mutation {
    createUser(userInput: UserInputData): User!
    createPost(postInput: PostInputData): Post!
  }
`;
