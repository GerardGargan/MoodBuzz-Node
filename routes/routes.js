const express = require('express');
const path = require('path');
const db = require('../util/dbconn');
const util = require('util');

const router = express.Router();

router.get('/', (req, res) => {
    res.render('index', { currentPage: 'home' });    
});

router.get('/login', (req,res) => {
    res.render('login', {currentPage: 'login' });
});

router.post('/login', (req, res) => {
    const { email, password } = req.body;
    console.log(email);
    console.log(password);
    //TODO
    //salt and hash password
    //check if email and password exists in user table, if so can log in, if not display error message
    //redirect/store cookie?
});

router.get('/register', (req,res) => {
    res.render('register', { currentPage: 'register' });
});

router.post('/register', (req, res) => {
    const { firstname, surname, email, password } = req.body;
    console.log(`${firstname} ${surname} ${email} ${password}`);
    //validate password
    console.log(validatePassword(password));
    // check that fields are not blank
    // check that email contains necessary data - @, etc..
    // check the password meets min requirements
    // salt and hash password
    // check that the email doesnt already exist
    // sanitise for sql injection attack
    // if all tests pass, write user to database

    //how?
    //use a promise function? Check each one then use .then to chain to next one?
});

router.get('/user/home', (req, res) => {
        
    res.render('userhome', { currentPage: 'userhome' });
    
});

router.get('/user/snapshot', (req,res) => {
    res.render('snapshot', { currentPage: 'snapshot' });
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

function validatePassword(password){
    const capitalRegex = /[A-Z]/;
    if(password.length >= 8 && capitalRegex.test(password)){
        return true;
    } 
    
    return false;
}

module.exports = router;