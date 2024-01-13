const express = require('express');
const path = require('path');
const db = require('../util/dbconn');

const router = express.Router();

router.get('/', (req, res) => {
    res.render('index', { currentPage: 'home' });    
});

router.get('/login', (req,res) => {
    res.render('login', {currentPage: 'login' });
});

router.get('/register', (req,res) => {
    res.render('register', { currentPage: 'register' });
});

router.get('/user/snapshot', (req,res) => {
    res.render('snapshot', { currentPage: 'snapshot' });
});

router.get('/user/home', (req, res) => {
    res.render('userhome', { currentPage: 'userhome' })
});

router.get('/user/analytics', (req,res) => {
    res.send('Placeholder for Analytics')
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