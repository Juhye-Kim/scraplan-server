const router = require("express").Router();

const controller = require("../controllers/curation-request");
const requiredTokenCheck = require("../middlewares/requiredTokenCheck");

router.post("/", requiredTokenCheck, controller.post);
router.patch("/", requiredTokenCheck, controller.patch);

module.exports = router;
