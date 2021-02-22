/* This file will  contain the business logic or
handlers for the incoming requests, similar to controllers in REST APIs */

import bcrypt from "bcrypt";
import validator from "validator";
import jwt from "jsonwebtoken";

import User from "../models/users.js";

const books = [
  {
    title: "The Awakening",
    author: "Kate Chopin",
  },
  {
    title: "City of Glass",
    author: "Paul Auster",
  },
];

const createUser = async (_, { userInput }) => {
  const { email, name, password } = userInput;
  const errors = [];
  if (validator.isEmpty(name)) {
    errors.push({ message: "Name is required!" });
  }
  if (validator.isEmpty(email)) {
    errors.push({ message: "Email is required!" });
  }
  if (!validator.isEmail(email)) {
    errors.push({ message: "Email is invalid!" });
  }
  if (!validator.isLength(password, { min: 5 })) {
    errors.push({ message: "Password too short!" });
  }
  if (errors.length > 0) {
    const error = new Error("Invalid input");
    error.data = errors;
    error.code = 422;
    throw error;
  }
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const error = new Error("Email exists already!");
    throw error;
  }
  const hashedPassword = await bcrypt.hash(password, 12);
  const user = new User({
    email,
    name,
    password: hashedPassword,
  });
  const createdUser = await user.save();
  return createdUser;
};

const login = async (_, { email, password }) => {
  const user = await User.findOne({ email });
  if (!user) {
    const error = new Error("User not found");
    error.code = 401;
    throw error;
  }
  const isEqual = await bcrypt.compare(password, user.password);
  if (!isEqual) {
    const error = new Error("Password is incorrect");
    error.code = 401;
    throw error;
  }
  const token = jwt.sign(
    {
      userId: user._id.toString(),
      email: user.email,
    },
    "supersecretkey",
    { expiresIn: "1h" }
  );
  return { token, userId: user._id.toString() };
};

export const apolloResolvers = {
  Query: {
    books: () => books,
    login: login,
  },
  Mutation: {
    createUser: createUser,
  },
};

export const hello = () => ({
  text: "Hello World!",
  views: 123,
});
