const router = require("express").Router();

const controller = require("../controllers/curation-card");
const requiredTokenCheck = require("../middlewares/requiredTokenCheck");

router.post("/", requiredTokenCheck, controller.post);
router.patch("/", requiredTokenCheck, controller.patch);
router.delete("/", requiredTokenCheck, controller.delete);

module.exports = router;
