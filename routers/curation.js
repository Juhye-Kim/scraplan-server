const router = require("express").Router();

const controller = require("../controllers/curation");
const requiredTokenCheck = require("../middlewares/requiredTokenCheck");

router.post("/", requiredTokenCheck, controller.post);
router.put("/", requiredTokenCheck, controller.put);
router.delete("/", requiredTokenCheck, controller.delete);

module.exports = router;
