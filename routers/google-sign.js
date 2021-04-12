const router = require("express").Router();

const controller = require("../controllers/google-sign");
const getGoogleResource = require("../middlewares/getGoogleResource");
const tokenCheck = require("../middlewares/tokenCheck");

router.post("/up", getGoogleResource, controller.up);
router.patch("/in", getGoogleResource, controller.in);
router.patch("/out", tokenCheck, controller.out);
router.delete("/withdraw", tokenCheck, getGoogleResource, controller.withdraw);

module.exports = router;
