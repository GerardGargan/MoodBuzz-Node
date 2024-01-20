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
        if (userData.length >= 1) {
            console.log('user exists');
            //access the first element of the array to get the user details (we should only ever return one element)
            console.log(userData[0].email_address);

            //get the stored hashed password
            const hashedPassword = userData[0].password.toString();

            //check if the plain text password matches the hashed password
            const passwordMatch = await comparePassword(password, hashedPassword);
            if (passwordMatch) {
                //email and password matches - successful log in
                //TODO - store session and redirect to user home page
            }
        } else {
            console.log('user does not exist');
        }
    } catch (err) {
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
    const selectTriggers = `SELECT trigger_id, trigger_name, icon FROM triggers`;
    try {
        //run query to get the emotions and ratings data
        const [data, fielddata2] = await db.query(selectRatings);
        console.log(data)
        const groupedData = [];
        //parse data into an appropriate structure to pass to the template
        data.forEach(row => {
            //if it doesnt already exist, create the emotion object
            const { emotion_id, emotion, rating, short_desc, long_desc } = row;
            if (!groupedData[emotion_id]) {
                groupedData[emotion_id] = {
                    emotion_id,
                    emotion,
                    rating: []
                }
            }
            //push each rating data into the rating array in the emotion object
            groupedData[emotion_id].rating.push({ rating: rating, shortdesc: short_desc, longdesc: long_desc });
        });

        //run the query to get the triggers
        const [triggerData, fieldData] = await db.query(selectTriggers);

        //console.log(JSON.stringify(groupedData));
        console.log(triggerData);
        res.render('test', { groupedData, triggerData });
    } catch (err) {
        throw err;
    }
});

router.get('/newsnap', async (req, res) => {

    //Extract data from the URL (assuming they are in the query parameters)
    const formData = req.query;
    const { notes } = req.query;
    const user_id = 4; //hardcode for now

    //Process the form data and prepare it for database insertion
    const emotionsToInsert = [];

       try {
        //insert snapshot record first
        const snapshotInsert = `INSERT INTO snapshot (user_id, date, time, note) VALUES (?, ?, ?, ?)`;
        const date = getCurrentDate();
        const time = getCurrentTime();
        const snapshotVals = [user_id, date, time, notes];
        const [snapInsert, fieldData] = await db.query(snapshotInsert, snapshotVals);
        //store the id of the snapshot - needs to be inserted on each many to many record we insert on the many to many table
        const snapshotId = snapInsert.insertId;
        console.log(snapshotId);

        //loop through keys in the url query and insert into array
        for (const id in formData) {
            if (Object.hasOwnProperty.call(formData, id) && id != 'notes' && !id.includes('trig')) {
                const value = formData[id];
                // Assuming "id" is the column name for the emotion ID in the database
                // Assuming "value" is the column name for the emotion value in the database
                emotionsToInsert.push({ snapshotId, id, value });
            }
        }
        console.log(emotionsToInsert);

        //now insert each emotion record in the many to many table
        if (emotionsToInsert.length > 0) {
            const query = 'INSERT INTO snapshot_emotion (snapshot_id, emotion_id, rating) VALUES ?';
            console.log([emotionsToInsert.map(record => [record.snapshotId, record.id, record.value])]);
            const[rows,fielddata] = await db.query(query, [emotionsToInsert.map(record => [record.snapshotId, record.id, record.value])]);
        }
    } catch (err) {
        throw err;
    }
});

router.get('*', (req, res) => {
    //render page not found
    res.status(404).send('<h1>404: Page Not Found</h1>');
})

function validatePassword(password) {
    //regex to check if a password contains a capital letter
    const capitalRegex = /[A-Z]/;
    //check the password is at least 8 characters long and has a capital letter
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
    } catch (err) {
        throw err;
    }
}

function getCurrentDate() {
    let currentDate = new Date();

    let year = currentDate.getFullYear();
    let month = currentDate.getMonth() + 1; //zero indexed
    let date = currentDate.getDate();

    let formattedDate = `${year}/${month}/${date}`;

    return `${formattedDate}`;
}

function getCurrentTime() {
    let currentDate = new Date();

    let hours = currentDate.getHours();
    let minutes = currentDate.getMinutes();
    let seconds = currentDate.getSeconds();

    let formattedTime = `${hours}:${minutes}:${seconds}`;
    return formattedTime;
}

module.exports = router;