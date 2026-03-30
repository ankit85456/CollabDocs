const router = require("express").Router();
const auth = require("../middleware/authmiddleware");
const asyncHandler = require("../utils/asynchandler");
const {
  createDoc,
  getDocs,
  getDocById,
  updateDoc,
  createShareLink,
  getVersions,
  restoreVersion,
  deleteDoc,
} = require("../controllers/documentController");

router.post("/", auth, asyncHandler(createDoc));
router.get("/", auth, asyncHandler(getDocs));
router.post("/:id/share", auth, asyncHandler(createShareLink));
router.get("/:id/versions", auth, asyncHandler(getVersions));
router.post("/:id/versions/:versionId/restore", auth, asyncHandler(restoreVersion));
router.get("/:id", auth, asyncHandler(getDocById));
router.put("/:id", auth, asyncHandler(updateDoc));
router.delete("/:id", auth, asyncHandler(deleteDoc));

module.exports = router;
