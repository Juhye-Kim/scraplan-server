const router = require("express").Router();

const controller = require("../controllers/sign");
const tokenCheck = require("../middlewares/tokenCheck");

router.post("/up", controller.up);
router.patch("/in", controller.in);
router.patch("/out", tokenCheck, controller.out);
router.delete("/withdraw", tokenCheck, controller.withdraw);

module.exports = router;
