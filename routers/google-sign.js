const router = require("express").Router();

const controller = require("../controllers/google-sign");
const getGoogleResource = require("../middlewares/getGoogleResource");
const requiredTokenCheck = require("../middlewares/requiredTokenCheck");

router.post("/up", getGoogleResource, controller.up);
router.patch("/in", getGoogleResource, controller.in);
router.patch("/out", requiredTokenCheck, controller.out);
router.delete(
  "/withdraw",
  requiredTokenCheck,
  getGoogleResource,
  controller.withdraw
);

module.exports = router;
