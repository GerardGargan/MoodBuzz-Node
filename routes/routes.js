const express = require('express');
const controller = require('./../controllers/controller');
const { isAuth, isLoggedIn } = require('../middleware/middleware');
const router = express.Router();

router.get('/', controller.getIndex);
router.get('/login', isLoggedIn, controller.getLogin);
router.get('/register', isLoggedIn, controller.getRegister);
router.get('/user/home', isAuth, controller.getUserHomePage);
router.get('/user/snapshot', isAuth, controller.getNewSnapshotPage);
router.get('/user/snapshot/view/:id', isAuth, controller.getViewSnapshot);
router.get('/user/snapshot/del/:id', isAuth, controller.deleteSnapshot);
router.get('/user/logout', controller.getLogout);
router.get('/user/snapshot/edit/:id', isAuth, controller.getEdit);
router.post('/register', isLoggedIn, controller.postRegister);
router.post('/login', isLoggedIn, controller.postLogin);
router.post('/user/snapshot', isAuth, controller.processNewSnapshot);
router.post('/user/snapshot/update/:id', isAuth, controller.postEditUpdate);
router.get('*', controller.getNotFound);

module.exports = router;