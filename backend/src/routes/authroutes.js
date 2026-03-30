const router = require("express").Router();
const { signup, login } = require("../controllers/authController");
const asyncHandler = require("../utils/asynchandler");

router.post("/signup", asyncHandler(signup));
router.post("/login", asyncHandler(login));

module.exports = router;
