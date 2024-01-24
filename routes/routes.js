const express = require('express');
const controller = require('./../controllers/controller');

const router = express.Router();

router.get('/', controller.getIndex);

router.get('/login', controller.getLogin);

router.post('/login', controller.postLogin);

router.get('/register', controller.getRegister);

router.post('/register', controller.postRegister);

router.get('/user/home', controller.getUserHomePage);

router.get('/user/snapshot', controller.getNewSnapshotPage);

router.get('/new/snapshot', controller.processNewSnapshot);

router.get('*', controller.getNotFound);

module.exports = router;