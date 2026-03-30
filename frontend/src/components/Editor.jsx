import { useEffect, useRef, useState } from "react";
import { socket } from "../socket/socket";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { createShareLink, getDocById, getVersions, restoreVersion, updateDoc } from "../services/docservice";
import AvatarGroup from "./AvatarGroup";
import ShareModal from "./ShareModal";

export default function Editor({ docId, shareToken }) {
  const [value, setValue] = useState("");
  const [title, setTitle] = useState("Untitled Document");
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState("Saved");
  const [shareMessage, setShareMessage] = useState("");
  const [accessRole, setAccessRole] = useState("owner");
  const [versions, setVersions] = useState([]);
  const [remoteCursors, setRemoteCursors] = useState({});
  const [typingUsers, setTypingUsers] = useState({});
  const [shareLinks, setShareLinks] = useState({ viewer: "", editor: "" });
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [copiedRole, setCopiedRole] = useState("");
  const titleSaveTimeoutRef = useRef(null);
  const autoSaveTimeoutRef = useRef(null);
  const quillRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const currentUser = (() => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("user") || "null");
      if (!storedUser) return { id: "unknown-user", name: "You" };
      return {
        id: storedUser._id || "unknown-user",
        name: storedUser.name || storedUser.email || "You",
      };
    } catch {
      return { id: "unknown-user", name: "You" };
    }
  })();

  const readOnly = accessRole === "viewer";

  const getCursorColor = (userId) => {
    const colors = ["#2563eb", "#db2777", "#0891b2", "#7c3aed", "#ea580c", "#16a34a"];
    const hash = userId.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const activeUsers = Object.values(remoteCursors);
  const activeTypingUsers = Object.values(typingUsers);
  const typingText =
    activeTypingUsers.length === 1
      ? `${activeTypingUsers[0].userName} is typing...`
      : activeTypingUsers.length > 1
      ? `${activeTypingUsers[0].userName} and ${activeTypingUsers.length - 1} other${
          activeTypingUsers.length > 2 ? "s" : ""
        } are typing...`
      : "";

  const showShareToast = (message, role = "") => {
    setShareMessage(message);
    setCopiedRole(role);
    window.setTimeout(() => {
      setShareMessage("");
      setCopiedRole("");
    }, 2200);
  };

  const loadVersions = async () => {
    const res = await getVersions(docId, shareToken);
    setVersions(res.data.versions || []);
  };

  useEffect(() => {
    let ignore = false;

    const loadDoc = async () => {
      try {
        const res = await getDocById(docId, shareToken);
        if (!ignore) {
          setValue(res.data?.content || "");
          setTitle(res.data?.title || "Untitled Document");
          setAccessRole(res.data?.accessRole || "owner");
        }
        const versionsRes = await getVersions(docId, shareToken);
        if (!ignore) {
          setVersions(versionsRes.data?.versions || []);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadDoc();

    return () => {
      ignore = true;
    };
  }, [docId, shareToken]);

  useEffect(() => {
    socket.emit("join-doc", {
      docId,
      userId: currentUser.id,
      userName: currentUser.name,
    });

    socket.on("receive-changes", (data) => {
      setValue(data);
    });

    socket.on("receive-cursor", ({ userId, userName, range }) => {
      if (!userId || userId === currentUser.id) return;

      setRemoteCursors((current) => {
        if (!range) {
          const next = { ...current };
          delete next[userId];
          return next;
        }

        return {
          ...current,
          [userId]: {
            userId,
            userName,
            range,
          },
        };
      });
    });

    socket.on("cursor-left", ({ userId }) => {
      if (!userId) return;
      setRemoteCursors((current) => {
        const next = { ...current };
        delete next[userId];
        return next;
      });
      setTypingUsers((current) => {
        const next = { ...current };
        delete next[userId];
        return next;
      });
    });

    socket.on("typing-status", ({ userId, userName, isTyping }) => {
      if (!userId || userId === currentUser.id) return;

      setTypingUsers((current) => {
        const next = { ...current };
        if (isTyping) {
          next[userId] = { userId, userName };
        } else {
          delete next[userId];
        }
        return next;
      });
    });

    return () => {
      socket.emit("leave-doc", { docId, userId: currentUser.id });
      socket.off("receive-changes");
      socket.off("receive-cursor");
      socket.off("cursor-left");
      socket.off("typing-status");
      setRemoteCursors({});
      setTypingUsers({});
    };
  }, [docId, currentUser.id, currentUser.name]);

  const handleChange = (content) => {
    if (readOnly) return;
    setValue(content);
    setSaveStatus("Saving...");
    socket.emit("send-changes", { docId, content });
    socket.emit("typing-status", {
      docId,
      userId: currentUser.id,
      userName: currentUser.name,
      isTyping: true,
    });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("typing-status", {
        docId,
        userId: currentUser.id,
        userName: currentUser.name,
        isTyping: false,
      });
    }, 1200);
  };

  const handleTitleChange = (nextTitle) => {
    if (readOnly) return;
    setTitle(nextTitle);
    setSaveStatus("Saving...");

    if (titleSaveTimeoutRef.current) {
      clearTimeout(titleSaveTimeoutRef.current);
    }

    titleSaveTimeoutRef.current = setTimeout(async () => {
      await updateDoc(docId, { title: nextTitle || "Untitled Document" }, shareToken);
      setSaveStatus("Saved");
      await loadVersions();
    }, 500);
  };

  const handleOpenShare = async () => {
    try {
      const [viewerRes, editorRes] = await Promise.all([
        createShareLink(docId, "viewer"),
        createShareLink(docId, "editor"),
      ]);

      setShareLinks({
        viewer: `${window.location.origin}/doc/${docId}?share=${viewerRes.data.shareToken}`,
        editor: `${window.location.origin}/doc/${docId}?share=${editorRes.data.shareToken}`,
      });
      setShareModalOpen(true);
    } catch (err) {
      showShareToast(err.response?.data?.msg || "Could not create share links");
    }
  };

  const handleCopyShareLink = async (role) => {
    try {
      await navigator.clipboard.writeText(shareLinks[role]);
      showShareToast(
        role === "viewer"
          ? "Viewer link copied. Anyone logged in with this link can open the document in read-only mode."
          : "Editor link copied. Anyone logged in with this link can open and edit the document.",
        role
      );
    } catch (err) {
      showShareToast(err.response?.data?.msg || "Could not copy share link");
    }
  };

  useEffect(() => {
    if (loading) return;
    if (readOnly) return;
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    autoSaveTimeoutRef.current = setTimeout(async () => {
      try {
        await updateDoc(docId, { title: title || "Untitled Document", content: value }, shareToken);
        setSaveStatus("Saved");
        await loadVersions();
      } catch {
        setSaveStatus("Save failed");
      }
    }, 2500);

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [docId, shareToken, title, value, readOnly, loading]);

  const handleRestoreVersion = async (versionId) => {
    await restoreVersion(docId, versionId, shareToken);
    const res = await getDocById(docId, shareToken);
    setValue(res.data?.content || "");
    setTitle(res.data?.title || "Untitled Document");
    setSaveStatus("Saved");
    await loadVersions();
  };

  const handleSelectionChange = (range, _source, editor) => {
    if (!editor) return;

    socket.emit("cursor-move", {
      docId,
      userId: currentUser.id,
      userName: currentUser.name,
      range: range ? { index: range.index, length: range.length } : null,
    });
  };

  useEffect(() => {
    return () => {
      if (titleSaveTimeoutRef.current) {
        clearTimeout(titleSaveTimeoutRef.current);
      }
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  if (loading) {
    return <div className="p-6 text-slate-500">Loading editor...</div>;
  }

  const quillEditor = quillRef.current?.getEditor?.();
  const renderedRemoteCursors = Object.values(remoteCursors)
    .map((cursor) => {
      if (!quillEditor || !cursor.range) return null;

      try {
        const bounds = quillEditor.getBounds(cursor.range.index, cursor.range.length || 0);
        return {
          ...cursor,
          top: bounds.top,
          left: bounds.left,
          height: bounds.height || 20,
          color: getCursorColor(cursor.userId),
        };
      } catch {
        return null;
      }
    })
    .filter(Boolean);

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-xl shadow-slate-200">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="w-full">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
              Document Title
            </p>
            <input
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              readOnly={readOnly}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-2xl font-bold text-slate-900 outline-none transition focus:border-blue-500"
            />
          </div>

          <div className="flex gap-2 md:flex-col md:items-end">
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-600">
              {saveStatus}
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600">
              {readOnly ? "Read-only access" : "Live sync on"}
            </span>
            <AvatarGroup users={activeUsers} currentUserName={currentUser.name} />
            {accessRole === "owner" ? (
              <button
                onClick={handleOpenShare}
                className="rounded-full bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-200 transition duration-300 hover:scale-[1.02]"
              >
                Share
              </button>
            ) : null}
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          {typingText ? (
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
              <span className="flex gap-1">
                <span className="h-2 w-2 animate-bounce rounded-full bg-blue-500 [animation-delay:-0.3s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-blue-500 [animation-delay:-0.15s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-blue-500" />
              </span>
              {typingText}
            </div>
          ) : (
            <p className="text-sm text-slate-500">Collaborator presence appears here while others edit.</p>
          )}

          {shareMessage ? (
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 shadow-sm transition">
              <span className="inline-flex h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-500" />
              {shareMessage}
            </div>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="rounded-3xl bg-slate-100 p-4 shadow-xl shadow-slate-200">
          <div className="relative">
            <ReactQuill
              ref={quillRef}
              value={value}
              onChange={handleChange}
              onChangeSelection={handleSelectionChange}
              readOnly={readOnly}
            />

            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              {renderedRemoteCursors.map((cursor) => (
                <div
                  key={cursor.userId}
                  className="absolute"
                  style={{
                    transform: `translate(${cursor.left + 16}px, ${cursor.top + 12}px)`,
                  }}
                >
                  <div
                    className="w-0.5 rounded-full"
                    style={{
                      height: `${cursor.height}px`,
                      backgroundColor: cursor.color,
                    }}
                  />
                  <div
                    className="mt-1 rounded-md px-2 py-1 text-xs font-semibold text-white shadow-sm"
                    style={{ backgroundColor: cursor.color }}
                  >
                    {cursor.userName}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Version History</h3>
          <p className="mt-1 text-sm text-slate-500">
            Recent saved snapshots of this document.
          </p>

          <div className="mt-4 space-y-3">
            {versions.length === 0 ? (
              <p className="text-sm text-slate-500">No saved versions yet.</p>
            ) : (
              versions.map((version) => (
                <div key={version._id} className="rounded-xl border border-slate-200 p-3">
                  <p className="font-medium text-slate-900">{version.title || "Untitled Document"}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {new Date(version.savedAt).toLocaleString()}
                  </p>
                  {!readOnly ? (
                    <button
                      onClick={() => handleRestoreVersion(version._id)}
                      className="mt-3 rounded-lg border border-blue-200 px-3 py-2 text-sm font-medium text-blue-700"
                    >
                      Restore
                    </button>
                  ) : null}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        title={`Share "${title || "Untitled Document"}"`}
        viewerLink={shareLinks.viewer}
        editorLink={shareLinks.editor}
        onCopy={handleCopyShareLink}
        copiedRole={copiedRole}
      />
    </div>
  );
}
