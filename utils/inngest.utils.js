import { Inngest } from "inngest";
import { User } from "../models/User.models.js";
import { Story } from "../models/Story.models.js";
import { Connection } from "../models/Connection.models.js";
import { Message } from "../models/Message.models.js";
import sendEmail from "./nodemailer.utils.js";

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
      const existingUsername = await User.findOne({ username });

      if (existingUsername) {
        username = username + Math.floor(Math.random() * 10000);
      }

      // last_name = "null" ? "" : last_name;

      const newUser = new User({
        _id: id,
        email: email_addresses[0].email_address,
        full_name: `${first_name} ${(last_name = "null" ? "" : last_name)}`,
        // full_name: `${first_name} ${last_name}`,
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
    console.log("Tried deleting:", id, "Result:", userToDelete);

    if (userToDelete) {
      return { message: "User Deleted Successfully" };
    }
  },
);
//#endregion

//#region Send Email when a new connection is created
const sendNewConnectionRequestReminder = inngest.createFunction(
  { id: "send-new-connection-reminder" },
  { event: "app/connection.request" },
  async ({ event, step }) => {
    const { connectionId } = event.data;
    await step.run("send-connection-request-mail", async () => {
      const connection = await Connection.findById(connectionId).populate(
        "from_user_id to_user_id",
      );

      const subject = `👋 New Connection Request`;
      const body = `
      <div style="font-family: Arial, sans-serif; padding: 20px">
        <h2>Hello ${connection.to_user_id.full_name},</h2>
        <p>You have a new connection request from ${connection.from_user_id.full_name} - @${connection.from_user_id.username}.</p>
        <p>Click <a href="${process.env.FRONTEND_URL}/connections" style="color: #10b981;">here</a> to accept or reject the request.</p>
        <br/>
        <p>Thanks,<br/>Knect Team - Stay Connected</p>
      </div>`;

      await sendEmail(connection.to_user_id.email, subject, body);
    });

    const in24Hours = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await step.sleepUntil("wait-for-24-hours", in24Hours);
    await step.run("send-connection-request-reminder", async () => {
      const connection = await Connection.findById(connectionId).populate(
        "from_user_id to_user_id",
      );

      if (connection.status === "accepted") {
        return { message: "Already Accepted" };
      }

      const subject = `👋 New Connection Request`;
      const body = `
      <div style="font-family: Arial, sans-serif; padding: 20px">
        <h2>Hello ${connection.to_user_id.full_name},</h2>
        <p>You have a new connection request from ${connection.from_user_id.full_name} - @${connection.from_user_id.username}.</p>
        <p>Click <a href="${process.env.FRONTEND_URL}/connections" style="color: #10b981;">here</a> to accept or reject the request.</p>
        <br/>
        <p>Thanks,<br/>Knect Team - Stay Connected</p>
      </div>`;

      await sendEmail(connection.to_user_id.email, subject, body);

      return { message: "Reminder Sent" };
    });
  },
);
//#endregion

//#region Background Task -> Delete A Story After 24 Hours
const deleteStory = inngest.createFunction(
  { id: "story-delete" },
  { event: "app/story.delete" },
  async ({ event, step }) => {
    const { storyId } = event.data;

    const in24Hours = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await step.sleepUntil("wait-for-24-hours", in24Hours);
    await step.run("delete-story", async () => {
      await Story.findByIdAndDelete(storyId);
      return { message: "Story Deleted" };
    });
  },
);
//#endregion

//#region Send Notification of Unseen Messages
export const sendUnseenMessageNotification = inngest.createFunction(
  { id: "send-unseen-message-notification" },
  { cron: "TZ=America/New_York 0 9 * * *" }, // Every day at 9am
  async ({ step }) => {
    const messages = await Message.find({ seen: false }).populate("to_user_id");

    const unseenCount = {};

    messages.map((message) => {
      unseenCount[message.to_user_id._id] =
        (unseenCount[message.to_user_id._id] || 0) + 1;
    });

    for (const userId in unseenCount) {
      const user = await User.findById(userId);
      const subject = `📩 You have ${unseenCount[userId]} new messages`;
      const body = `
      <div style="font-family: Arial, sans-serif; padding: 20px">
        <h2>Hello ${user.full_name},</h2>
        <p>You have ${unseenCount[userId]} new messages</p>
        <p>Click <a href="${process.env.FRONTEND_URL}/messages" style="color: #10b981;">here</a> to view them</p>
        <br/>
        <p>Thanks,<br/>Knect Team - Stay Connected</p>
      </div>`;

      await sendEmail({
        to: user.email,
        subject,
        body,
      });
    }
    return { message: "Notification Sent" };
  },
);
//#endregion

export const functions = [
  syncUserCreation,
  syncUserUpdation,
  syncUserDeletion,
  sendNewConnectionRequestReminder,
  deleteStory,
  sendUnseenMessageNotification,
];
