const express = require("express");
const { createHousehold, joinHousehold, getMyHousehold, leaveHousehold } = require("../handlers/household");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.use(protect);

router.get("/me", getMyHousehold);
router.post("/create", createHousehold);
router.post("/join", joinHousehold);
router.delete("/leave", leaveHousehold);

module.exports = router;
