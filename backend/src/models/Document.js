// src/models/Document.js
const mongoose = require("mongoose");

const versionSchema = new mongoose.Schema(
  {
    title: String,
    content: String,
    savedAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const docSchema = new mongoose.Schema({
  title: String,
  content: String,
  owner: String,
  shareToken: String,
  shareLinks: {
    viewer: String,
    editor: String,
  },
  collaborators: [
    {
      userId: String,
      role: { type: String, enum: ["viewer", "editor"] },
    },
  ],
  versions: [versionSchema],
}, { timestamps: true });

module.exports = mongoose.model("Document", docSchema);
