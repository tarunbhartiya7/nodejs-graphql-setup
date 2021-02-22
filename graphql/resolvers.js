/* This file will  contain the business logic or
handlers for the incoming requests, similar to controllers in REST APIs */

import bcrypt from "bcrypt";
import validator from "validator";

import User from "../models/users.js";

export const hello = () => ({
  text: "Hello World!",
  views: 123,
});

export const createUser = async ({ userInput }) => {
  const { email, name, password } = userInput;
  const errors = [];
  if (validator.isEmpty(name)) {
    errors.push({ message: "Name is required!" });
  }
  if (!validator.isEmail(email)) {
    errors.push({ message: "Email is invalid!" });
  }
  if (
    validator.isEmpty(password) ||
    !validator.isLength(password, { min: 5 })
  ) {
    errors.push({ message: "Password too short!" });
  }
  if (errors.length > 0) {
    const error = new Error("Invalid input");
    error.data = errors;
    error.code = 422;
    throw error;
  }
  // check if user already existing in db
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

// export const hello = () => "Hello!";
