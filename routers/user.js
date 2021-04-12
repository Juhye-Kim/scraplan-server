const router = require("express").Router();

const controller = require("../controllers/user");
const requiredTokenCheck = require("../middlewares/requiredTokenCheck");
const optionalTokenCheck = require("../middlewares/optionalTokenCheck");

router.get("/info/:email", optionalTokenCheck, controller.info);
router.patch("/edit-info", requiredTokenCheck, controller.editInfo);

module.exports = router;
