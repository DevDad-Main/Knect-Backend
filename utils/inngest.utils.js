import { Inngest } from "inngest";
import { User } from "../models/User.models.js";
import { Story } from "../models/Story.models.js";
import { Connection } from "../models/Connection.models.js";
import { Message } from "../models/Message.models.js";
import sendEmail from "./nodemailer.utils.js";

export const inngest = new Inngest({ id: "knect-app" });

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
  sendNewConnectionRequestReminder,
  deleteStory,
  sendUnseenMessageNotification,
];
