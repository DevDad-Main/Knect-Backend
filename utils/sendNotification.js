//#region Notification Wrapper
export const sendNotification = (io, onlineUsers, recipientId, payload) => {
  const destSockets = onlineUsers.get(recipientId.toString());
  if (destSockets) {
    for (const sid of destSockets) {
      io.to(sid).emit("notification", payload);
    }
  }
};
//#endregion
