const Document = require("../models/Document");
const crypto = require("crypto");
const mongoose = require("mongoose");

const isOwner = (doc, userId) => doc.owner === userId;
const getCollaborator = (doc, userId) =>
  doc.collaborators?.find((entry) => entry.userId === userId);
const isCollaborator = (doc, userId) => Boolean(getCollaborator(doc, userId));
const getAccessRole = (doc, userId) => {
  if (isOwner(doc, userId)) return "owner";
  return getCollaborator(doc, userId)?.role || null;
};

const addVersionSnapshot = (doc) => {
  doc.versions = doc.versions || [];
  const lastVersion = doc.versions[doc.versions.length - 1];
  const nextSnapshot = {
    title: doc.title || "Untitled Document",
    content: doc.content || "",
    savedAt: new Date(),
  };

  if (
    lastVersion &&
    lastVersion.title === nextSnapshot.title &&
    lastVersion.content === nextSnapshot.content
  ) {
    return;
  }

  doc.versions.push(nextSnapshot);

  if (doc.versions.length > 20) {
    doc.versions = doc.versions.slice(-20);
  }
};

const ensureDocAccess = async (docId, userId, shareToken) => {
  if (!mongoose.Types.ObjectId.isValid(docId)) {
    return null;
  }

  const doc = await Document.findById(docId);
  if (!doc) {
    return null;
  }

  const currentRole = getAccessRole(doc, userId);
  if (currentRole) {
    return { doc, role: currentRole };
  }

  const shareLinks = doc.shareLinks || {};
  let invitedRole = null;

  if (shareToken && shareLinks.editor === shareToken) {
    invitedRole = "editor";
  } else if (shareToken && shareLinks.viewer === shareToken) {
    invitedRole = "viewer";
  } else if (shareToken && doc.shareToken === shareToken) {
    invitedRole = "editor";
  }

  if (invitedRole) {
    doc.collaborators = doc.collaborators || [];
    const existing = getCollaborator(doc, userId);

    if (!existing) {
      doc.collaborators.push({ userId, role: invitedRole });
      await doc.save();
    } else if (existing.role !== invitedRole && invitedRole === "editor") {
      existing.role = invitedRole;
      await doc.save();
    }

    return { doc, role: invitedRole };
  }

  return false;
};

exports.createDoc = async (req, res) => {
  const doc = await Document.create({
    title: "Untitled Document",
    owner: req.user,
    content: "",
    shareToken: crypto.randomBytes(12).toString("hex"),
    shareLinks: {
      viewer: crypto.randomBytes(12).toString("hex"),
      editor: crypto.randomBytes(12).toString("hex"),
    },
    versions: [],
  });
  addVersionSnapshot(doc);
  await doc.save();
  res.json(doc);
};

exports.getDocs = async (req, res) => {
  const docs = await Document.find({
    $or: [{ owner: req.user }, { "collaborators.userId": req.user }],
  }).sort({ updatedAt: -1 });
  res.json(docs);
};

exports.getDocById = async (req, res) => {
  const access = await ensureDocAccess(req.params.id, req.user, req.query.shareToken);
  if (access === null) return res.status(404).json({ msg: "Document not found" });
  if (access === false) return res.status(403).json({ msg: "Access denied" });
  res.json({ ...access.doc.toObject(), accessRole: access.role });
};

exports.updateDoc = async (req, res) => {
  const { title, content } = req.body;
  const access = await ensureDocAccess(req.params.id, req.user, req.query.shareToken);
  if (access === null) return res.status(404).json({ msg: "Document not found" });
  if (access === false) return res.status(403).json({ msg: "Access denied" });
  if (access.role === "viewer") {
    return res.status(403).json({ msg: "Viewer access is read-only" });
  }

  const { doc } = access;
  let changed = false;

  if (typeof title === "string" && title !== doc.title) {
    doc.title = title;
    changed = true;
  }
  if (typeof content === "string" && content !== doc.content) {
    doc.content = content;
    changed = true;
  }

  if (changed) {
    addVersionSnapshot(doc);
  }
  await doc.save();

  res.json({ ...doc.toObject(), accessRole: access.role });
};

exports.createShareLink = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(404).json({ msg: "Document not found" });
  }

  const role = req.body?.role === "viewer" ? "viewer" : "editor";
  const doc = await Document.findOne({ _id: req.params.id, owner: req.user });
  if (!doc) return res.status(404).json({ msg: "Document not found" });

  doc.shareLinks = doc.shareLinks || {};
  if (!doc.shareLinks[role]) {
    doc.shareLinks[role] = crypto.randomBytes(12).toString("hex");
    await doc.save();
  }

  res.json({ shareToken: doc.shareLinks[role], role });
};

exports.getVersions = async (req, res) => {
  const access = await ensureDocAccess(req.params.id, req.user, req.query.shareToken);
  if (access === null) return res.status(404).json({ msg: "Document not found" });
  if (access === false) return res.status(403).json({ msg: "Access denied" });

  const versions = (access.doc.versions || [])
    .slice()
    .reverse()
    .map((version) => ({
      _id: version._id,
      title: version.title,
      content: version.content,
      savedAt: version.savedAt,
    }));

  res.json({ versions, accessRole: access.role });
};

exports.restoreVersion = async (req, res) => {
  const access = await ensureDocAccess(req.params.id, req.user, req.query.shareToken);
  if (access === null) return res.status(404).json({ msg: "Document not found" });
  if (access === false) return res.status(403).json({ msg: "Access denied" });
  if (access.role === "viewer") {
    return res.status(403).json({ msg: "Viewer access is read-only" });
  }

  const version = access.doc.versions?.id(req.params.versionId);
  if (!version) {
    return res.status(404).json({ msg: "Version not found" });
  }

  access.doc.title = version.title;
  access.doc.content = version.content;
  addVersionSnapshot(access.doc);
  await access.doc.save();

  res.json({ ...access.doc.toObject(), accessRole: access.role });
};

exports.deleteDoc = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(404).json({ msg: "Document not found" });
  }

  await Document.findOneAndDelete({ _id: req.params.id, owner: req.user });
  res.json({ msg: "Deleted" });
};
