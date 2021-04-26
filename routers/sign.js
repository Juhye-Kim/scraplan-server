const router = require("express").Router();

const controller = require("../controllers/sign");
const requiredTokenCheck = require("../middlewares/requiredTokenCheck");

router.post("/up", controller.up);
router.patch("/in", controller.in);
router.patch("/out", requiredTokenCheck, controller.out);
router.delete("/withdraw", requiredTokenCheck, controller.withdraw);

module.exports = router;
