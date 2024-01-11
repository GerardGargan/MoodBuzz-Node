const express = require('express');
const path = require('path');
const db = require('../util/dbconn');

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const query1 = 'SELECT * FROM emotion';
        const query2 = 'SELECT * FROM triggers';

        const result1 = await executeQuery(query1);
        const result2 = await executeQuery(query2);

        const combinedResults = {result1, result2};

        res.send(combinedResults);

    } catch(error) {
        console.log(error);
    }

    
});

function executeQuery(query) {
    return new Promise((resolve, reject) => {
        db.query(query, (err, rows) => {
            if(err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

module.exports = router;