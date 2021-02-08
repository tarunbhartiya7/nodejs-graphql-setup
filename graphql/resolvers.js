/* This file will  contain the business logic or
handlers for the incoming requests */

import bcrypt from "bcrypt";

import User from "../models/users.js";

export const hello = () => ({
  text: "Hello World!",
  views: 123,
});

export const createUser = async ({ userInput }) => {
  const { email, name, password } = userInput;
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
