/* This file will  contain the business logic or
handlers for the incoming requests */

export const hello = () => ({
  text: "Hello World!",
  views: 123,
});

export const signup = async ({ userInput }) => {
  // const email = args.userInput.email
  const { email, name } = userInput;
  return {
    _id: 1,
    name,
    email,
  };
};

// export const hello = () => "Hello!";
