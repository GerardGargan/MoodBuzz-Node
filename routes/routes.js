const express = require('express');
const path = require('path');
const db = require('../util/dbconn');
const bcrypt = require('bcrypt');
const util = require('util');

const router = express.Router();

router.get('/', (req, res) => {
    res.render('index', { currentPage: 'home' });
});

router.get('/login', (req, res) => {
    res.render('login', { currentPage: 'login' });
});

router.post('/login', async (req, res) => {
    //destructure the values into variables
    const { email, password } = req.body;
    
    //set up in an array for the query function
    const vals = [email, password];
    const selectSQL = `SELECT * FROM user WHERE email_address = ?`;

    try {
        const [userData, fieldData] = await db.query(selectSQL, vals);
        if(userData.length>=1){
            console.log('user exists');
            //access the first element of the array to get the user details (we should only ever return one element)
            console.log(userData[0].email_address);

            //get the stored hashed password
            const hashedPassword = userData[0].password.toString();

            //check if the plain text password matches the hashed password
            const passwordMatch = await comparePassword(password, hashedPassword);
            if(passwordMatch) {
                //email and password matches - successful log in
                //TODO - store session and redirect to user home page
            }
        } else {
            console.log('user does not exist');
        }
    } catch(err) {
        throw err;
    }
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

    /* log out for testing
    console.log(validatePassword(password));
    console.log(validateEmail(email));
    console.log(validateName(firstname));
    console.log(validateName(surname));
    */

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

router.get('/test', async (req, res) => {

    const selectRatings = `SELECT emotion.emotion_id, emotion, rating, short_desc, long_desc FROM emotion INNER JOIN emotion_rating ON emotion.emotion_id = emotion_rating.emotion_id INNER JOIN rating ON emotion_rating.rating_id = rating.rating_id`;
    try {
        const [data2, fielddata2] = await db.query(selectRatings);
        console.log(data2)
        const groupedData = [];

        data2.forEach(row => {
            const {emotion_id, emotion, rating, short_desc, long_desc} = row;
            if(!groupedData[emotion_id]) {
                groupedData[emotion_id] = {
                    emotion_id,
                    emotion,
                    rating: []
                }
            }

            groupedData[emotion_id].rating.push({rating: rating, shortdesc: short_desc, longdesc: long_desc});
        });

        console.log(JSON.stringify(groupedData));
    } catch(err) {
        throw err;
    }
});

router.get('*', (req, res) => {
    res.status(404).send('<h1>404: Page Not Found</h1>');
})

function validatePassword(password) {
    const capitalRegex = /[A-Z]/;
    if (password.length >= 8 && capitalRegex.test(password)) {
        return true;
    } else {
        return false;
    }

    
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