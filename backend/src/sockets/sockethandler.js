module.exports = (io) => {
  io.on("connection", (socket) => {
    socket.on("join-doc", ({ docId, userId, userName }) => {
      socket.join(docId);
      socket.data.docId = docId;
      socket.data.userId = userId;
      socket.data.userName = userName;
    });

    socket.on("send-changes", ({ docId, content }) => {
      socket.to(docId).emit("receive-changes", content);
    });

    socket.on("cursor-move", ({ docId, userId, userName, range }) => {
      socket.to(docId).emit("receive-cursor", { userId, userName, range });
    });

    socket.on("typing-status", ({ docId, userId, userName, isTyping }) => {
      socket.to(docId).emit("typing-status", { userId, userName, isTyping });
    });

    socket.on("leave-doc", ({ docId, userId }) => {
      socket.leave(docId);
      socket.to(docId).emit("cursor-left", { userId });
    });

    socket.on("save-doc", async ({ docId, content }) => {
      try {
        const Document = require("../models/Document");
        await Document.findByIdAndUpdate(docId, { content });
      } catch (error) {
        console.error("Socket save-doc failed:", error.message);
      }
    });

    socket.on("disconnect", () => {
      if (socket.data?.docId && socket.data?.userId) {
        socket.to(socket.data.docId).emit("cursor-left", { userId: socket.data.userId });
      }
    });
  });
};
