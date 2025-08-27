import { Inngest } from "inngest";
import { User } from "../models/User.models.js";
import mongoose from "mongoose";

export const inngest = new Inngest({ id: "knect-app" });

//#region User Creation
const syncUserCreation = inngest.createFunction(
  {
    id: "sync-user-from-clerk",
  },
  { event: "webhook-integration/user.created" },
  async ({ event }) => {
    const { id, first_name, last_name, email_addresses, image_url } =
      event.data;

    let username = email_addresses[0].email_address.split("@")[0];

    try {
      // Ensure username uniqueness (loop until unique)
      while (await User.findOne({ username })) {
        username = username + Math.floor(Math.random() * 10000);
      }

      const newUser = new User({
        _id: id,
        email: email_addresses[0].email_address,
        full_name: `${first_name} ${last_name}`,
        username,
        profile_picture: image_url,
      });

      await newUser.save();
      console.log("User Saved!");
    } catch (err) {
      console.error("❌ Error saving user:", err);
      throw err; // don’t swallow the real error
    }
  },
);
//#endregion

//#region Update User Details
const syncUserUpdation = inngest.createFunction(
  {
    id: "update-user-from-clerk",
  },
  { event: "webhook-integration/user.updated" },
  async ({ event }) => {
    const { id, first_name, last_name, email_addresses, image_url } =
      event.data;

    const userToUpdate = await User.findByIdAndUpdate(id, {
      email: email_addresses[0].email_address,
      full_name: `${first_name} ${last_name}`,
      profile_picture: image_url,
    });
  },
);
//#endregion

//#region Delete User
const syncUserDeletion = inngest.createFunction(
  {
    id: "delete-user-from-clerk",
  },
  { event: "webhook-integration/user.deleted" },
  async ({ event }) => {
    const { id } = event.data;

    const userToDelete = await User.findByIdAndDelete(id);

    if (userToDelete) {
      console.log("User deleted successfully");
    }
  },
);
//#endregion

// Inngest function to save user data to a database using webhooks from clerk User.created

// Create an empty array where we'll export future Inngest functions
export const functions = [syncUserCreation, syncUserUpdation, syncUserDeletion];
