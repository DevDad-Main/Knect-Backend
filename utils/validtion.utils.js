import { body } from "express-validator";
import { User } from "../models/User.models.js";

//#region Register User Validation
export const registerUserValidation = [
  body("firstName").notEmpty().withMessage("First name is required.").trim(),

  body("lastName").notEmpty().withMessage("Last name is required.").trim(),

  body("username")
    .notEmpty()
    .withMessage("Username is required")
    .trim()
    .bail()
    .isLength({ min: 5, max: 12 })
    .withMessage("Username must be between 5 and 12 characters.")
    .custom(async (value) => {
      const user = await User.findOne({ username: value });
      if (user) {
        throw new Error("Username already exists, Please choose another.");
      }
    }),
  body("email")
    .notEmpty()
    .withMessage("Email is required.")
    .bail()
    .isEmail()
    .withMessage("Please enter a valid email address.")
    .custom(async (value) => {
      const user = await User.findOne({ email: value });
      if (user) {
        throw new Error("Email address already in use, Please choose another.");
      }
    })
    .normalizeEmail(),
  body("password")
    .notEmpty()
    .withMessage("Password is required.")
    .isStrongPassword({
      minLength: 6,
      maxLength: 12,
      minUppercase: 1,
      minNumbers: 3,
      minSymbols: 1,
    })
    .withMessage(
      "Password must be 6–12 characters and include at least 1 uppercase, 3 numbers, and 1 symbol.",
    )
    .trim(),
];
//#endregion

//#region Login User Validation
export const loginUserValidation = [
  body("username")
    .notEmpty()
    .withMessage("Username can't be empty!")
    .bail()
    .custom(async (value) => {
      const userToFind = await User.findOne({ username: value });
      if (!userToFind) {
        throw new Error("User Not Found!");
      }
    })
    .trim(),
  body("password").notEmpty().withMessage("Password can't be empty!"),
];
//#endregion

//#region Update User Details Validation
export const updateUserValidation = [
  body("full_name")
    .notEmpty()
    .withMessage("Full name is required and cannot be empty!")
    .trim(),
  body("username")
    .notEmpty()
    .withMessage("Username is required")
    .trim()
    .bail()
    .isLength({ min: 5, max: 12 })
    .withMessage("Username must be between 5 and 12 characters.")
    .custom(async (value, { req }) => {
      const loggedInUser = await User.findById(req.user?._id);
      if (loggedInUser.username === value) {
        return;
      }
      const user = await User.findOne({ username: value });
      if (user) {
        throw new Error("Username already exists, Please choose another.");
      }
    }),
];
//#endregion

//#region Add Story Validation
export const addStoryValidation = [
  body("content").notEmpty().withMessage("Please enter some text!"),
];
//#endregion
