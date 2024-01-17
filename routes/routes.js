const express = require('express');
const path = require('path');
const db = require('../util/dbconn');
const bcrypt = require('bcrypt');

const router = express.Router();

router.get('/', (req, res) => {
    res.render('index', { currentPage: 'home' });
});

router.get('/login', (req, res) => {
    res.render('login', { currentPage: 'login' });
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    
    const vals = [email, password];
    const selectSQL = `SELECT * FROM user WHERE email_address = ?`;

    try {
        const [userData, fieldData] = await db.query(selectSQL, vals);
        if(userData.length>=1){
            console.log('user exists');
            console.log(userData[0].email_address);

            //get the stored hashed password
            const hashedPassword = userData[0].password.toString();

            //check if the plain text password matches the hashed password
            const passwordMatch = await comparePassword(password, hashedPassword);
            if(passwordMatch) {
                //email and password match
                //TODO - log session and redirect to user home
            }
        } else {
            console.log('user does not exist');
        }
    } catch(err) {
        throw err;
    }
    //TODO
    //salt and hash password
    //check if email and password exists in user table, if so can log in, if not display error message
    //redirect/store cookie?
});

router.get('/register', (req, res) => {
    res.render('register', { currentPage: 'register' });
});

router.post('/register', async (req, res) => {
    let { firstname, surname, email, password } = req.body;
    console.log(`${firstname} ${surname} ${email} ${password}`);

    //sanitise user input
    firstname = firstname.trim();
    surname = surname.trim();
    email = email.trim();

    //log out for testing
    console.log(validatePassword(password));
    console.log(validateEmail(email));
    console.log(validateName(firstname));
    console.log(validateName(surname));

    //perform validation checks on data
    if (validateName(firstname) && validateName(surname) && validateEmail(email) && validatePassword(password)) {

        //check if user already exists
        const vals = [email];
        const selectSQL = `SELECT user_id FROM user WHERE email_address = ?`;

        try {
            const [userDetails, fielddata] = await db.query(selectSQL, vals);
            if (userDetails.length >= 1) {
                console.log('User exists, cant complete registration');
                //TODO stop registration and inform the user
            } else {
                console.log('User does not exist');
                //continue registration - we have validated the data and checked the email doesnt already exist

                //salt and hash password
                const hashed = await hashPassword(password);
                console.log(`hashed password ${hashed}`);

                const valsToInsert = [firstname, surname, email, hashed];
                const insertSQL = `INSERT INTO user (first_name, last_name, email_address, password) VALUES (?, ?, ?, ?)`;

                //insert user to database
                const [rows, fielddata] = await db.query(insertSQL, valsToInsert);
                console.log('success');

                //TODO
                //insert session
                //redirect to user home?

            }
        } catch (err) {
            if (err) console.log(err);
        }
    } else {
        //invalid data - did not pass validation functions
        console.log('invalid data entered!!');
    }
});

router.get('/user/home', (req, res) => {

    res.render('userhome', { currentPage: 'userhome' });

});

router.get('/user/snapshot', (req, res) => {
    res.render('snapshot', { currentPage: 'snapshot' });
});

router.get('/user/analytics', (req, res) => {
    res.send('Placeholder for Analytics')
});

router.get('*', (req, res) => {
    res.status(404).send('<h1>404: Page Not Found</h1>');
})

function validatePassword(password) {
    const capitalRegex = /[A-Z]/;
    if (password.length >= 8 && capitalRegex.test(password)) {
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
    if (emailRegex.test(email)) {
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

    if (name.length >= minLength && name.length <= maxLength && nameRegex.test(name)) {
        return true;
    } else {
        return false;
    }
}

async function hashPassword(password) {
    try {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        return hashedPassword;
    } catch (err) {
        throw err;
    }
}

async function comparePassword(password, hashedPassword) {
    try {
        const match = await bcrypt.compare(password, hashedPassword);
        return match;
    } catch(err){
        throw err;
    }
}

module.exports = router;