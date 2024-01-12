const express = require('express');
const path = require('path');
const db = require('../util/dbconn');

const router = express.Router();

router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname,'..','html','index.html'));    
});

router.get('/login', (req,res) => {
    res.sendFile(path.join(__dirname,'..','html','login.html'));
});

router.get('/register', (req,res) => {
    res.sendFile(path.join(__dirname,'..','html','register.html'));
});

router.get('/user/snapshot', (req,res) => {
    res.render('snapshot');
});

router.get('/user/home', (req, res) => {
    res.send('<h1>User home page</h1>')
});

router.get('/user/analytics', (req,res) => {
    res.send('<h1>Analytics page</h1>');
});

router.get('/query', async(req, res) => {

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

router.get('*', (req,res) => {
    res.status(404).send('<h1>404: Page Not Found</h1>');
})

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