/* This file will  contain the business logic or
handlers for the incoming requests, similar to controllers in REST APIs */

import bcrypt from "bcrypt";
import validator from "validator";
import jwt from "jsonwebtoken";

import User from "../models/users.js";
import Post from "../models/post.js";
import mongoose from "mongoose";

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

const createPost = async (_, { postInput }, context) => {
  if (!context.userId) {
    const error = new Error("Not authenticated!");
    error.code = 401;
    throw error;
  }
  const { title, content } = postInput;
  const errors = [];
  if (!validator.isLength(title, { min: 5 })) {
    errors.push({ message: "Title too short!" });
  }
  if (!validator.isLength(content, { min: 5 })) {
    errors.push({ message: "Content too short!" });
  }
  if (errors.length > 0) {
    const error = new Error("Invalid input");
    error.data = errors;
    error.code = 422;
    throw error;
  }
  const user = await User.findById(context.userId);
  if (!user) {
    const error = new Error("Invalid user");
    error.code = 401;
    throw error;
  }
  const post = new Post({
    title,
    content,
    creator: user,
  });
  const createPost = await post.save();
  user.posts.push(post);
  await user.save();
  return {
    ...createPost._doc,
    _id: createPost._id.toString(),
    createdAt: createPost.createdAt.toISOString(),
    updatedAt: createPost.updatedAt.toISOString(),
  };
};

const updatePost = async (_, { id, postInput }, context) => {
  if (!context.userId) {
    const error = new Error("Not authenticated!");
    error.code = 401;
    throw error;
  }
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error("Not a valid id!");
    error.code = 404;
    throw error;
  }
  const post = await Post.findById(id).populate("creator");
  if (!post) {
    const error = new Error("No post found!");
    error.code = 404;
    throw error;
  }
  if (post.creator._id.toString() !== context.userId) {
    const error = new Error("Not authorized!");
    error.code = 404;
    throw error;
  }
  const { title, content } = postInput;
  const errors = [];
  if (!validator.isLength(title, { min: 5 })) {
    errors.push({ message: "Title too short!" });
  }
  if (!validator.isLength(content, { min: 5 })) {
    errors.push({ message: "Content too short!" });
  }
  if (errors.length > 0) {
    const error = new Error("Invalid input");
    error.data = errors;
    error.code = 422;
    throw error;
  }
  post.title = title;
  post.content = content;
  const updatedPost = await post.save();
  return {
    ...updatedPost._doc,
    _id: updatedPost._id.toString(),
    createdAt: updatedPost.createdAt.toISOString(),
    updatedAt: updatedPost.updatedAt.toISOString(),
  };
};

const deletePost = async (_, { id }, context) => {
  if (!context.userId) {
    const error = new Error("Not authenticated!");
    error.code = 401;
    throw error;
  }
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error("Not a valid id!");
    error.code = 404;
    throw error;
  }
  const post = await Post.findById(id);
  if (!post) {
    const error = new Error("No post found!");
    error.code = 404;
    throw error;
  }
  if (post.creator.toString() !== context.userId) {
    const error = new Error("Not authorized!");
    error.code = 404;
    throw error;
  }
  await Post.findByIdAndRemove(id);
  const user = await User.findById(context.userId);
  user.posts.pull(id);
  await user.save();
  return true;
};

const posts = async (_, { page, pageSize }, context) => {
  if (!context.userId) {
    const error = new Error("Not authenticated!");
    error.code = 401;
    throw error;
  }
  if (!page) page = 1;
  if (!pageSize) pageSize = 2;
  const totalPosts = await Post.find().countDocuments();
  const posts = await Post.find()
    .sort({ createdAt: -1 })
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .populate("creator");
  return {
    posts: posts.map((p) => {
      return {
        ...p._doc,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
      };
    }),
    totalPosts,
  };
};

const post = async (_, { id }, context) => {
  if (!context.userId) {
    const error = new Error("Not authenticated!");
    error.code = 401;
    throw error;
  }
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error("Not a valid id!");
    error.code = 404;
    throw error;
  }
  const post = await Post.findById(id).populate("creator");
  if (!post) {
    const error = new Error("No post found!");
    error.code = 404;
    throw error;
  }
  return {
    ...post._doc,
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
  };
};

export const apolloResolvers = {
  Query: {
    books: () => books,
    login: login,
    posts: posts,
    post: post,
  },
  Mutation: {
    createUser,
    createPost,
    updatePost,
    deletePost,
  },
};
