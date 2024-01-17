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
    let { firstname, surname, email, password } = req.body;
    console.log(`${firstname} ${surname} ${email} ${password}`);
    const s = "string";
    
    //sanitise user input
    firstname = firstname.trim();
    surname = surname.trim();
    email = email.trim();

    //validate user input
    console.log(validatePassword(password));
    console.log(validateEmail(email));
    console.log(validateName(firstname));
    console.log(validateName(surname));

    // check that fields are not blank
    //trim any whitespace from the name, email
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

router.get('*', (req,res) => {
    res.status(404).send('<h1>404: Page Not Found</h1>');
})

function validatePassword(password){
    const capitalRegex = /[A-Z]/;
    if(password.length >= 8 && capitalRegex.test(password)){
        return true;
    } 
    
    return false;
}

function validateEmail(email) {
    //must start with one or more characters that are not whitespace or @
    //then must contain @ symbol
    //Followed by one or more characters that are not whitespace or @
    //must contain a . for domain seperator
    //must end with one or more characters that are not whitespace or @ 
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(emailRegex.test(email)){
        return true;
    } else {
        return false;
    }
}

function validateName(name) {
    const minLength = 2;
    const maxLength = 50;
    const nameRegex = /^[A-Za-z\s-]+$/;
    //check if name is within the allowed range and doesnt contain any special characters or numbers

    if(name.length>=minLength && name.length <= maxLength && nameRegex.test(name)){
        return true;
    } else {
        return false;
    }
}

module.exports = router;