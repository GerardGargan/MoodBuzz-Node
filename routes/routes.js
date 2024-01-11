const express = require('express');
const path = require('path');
const db = require('../util/dbconn');

const router = express.Router();

router.get('/', (req, res) => {
    res.send('<h1>Hello World</h1>');
})

module.exports = router;