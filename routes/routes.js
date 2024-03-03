const express = require("express");
const controller = require("./../controllers/controller");
//require middleware
const { isAuth, isLoggedIn } = require("../middleware/middleware");
//create router object
const router = express.Router();

//set up routes, with middleware and controller
router.get("/", controller.getIndex);
router.get("/login", isLoggedIn, controller.getLogin);
router.get("/register", isLoggedIn, controller.getRegister);
router.get("/user/home", isAuth, controller.getUserHomePage);
router.get("/user/snapshot", isAuth, controller.getNewSnapshotPage);
router.get("/user/snapshot/view/:id", isAuth, controller.getViewSnapshot);
router.get("/user/snapshot/del/:id", isAuth, controller.deleteSnapshot);
router.get("/user/logout", controller.getLogout);
router.get("/user/snapshot/edit/:id", isAuth, controller.getEdit);
router.get("/user/analytics", isAuth, controller.getAnalytics);

router.post("/register", isLoggedIn, controller.postRegister);
router.post("/login", isLoggedIn, controller.postLogin);
router.post("/user/snapshot", isAuth, controller.processNewSnapshot);
router.post("/user/snapshot/update/:id", isAuth, controller.postEditUpdate);

//render not found page, no route exists
router.get("*", controller.getNotFound);

//export router
module.exports = router;
