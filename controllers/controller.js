const { get } = require('http');
const db = require('./../util/dbconn');
const bcrypt = require('bcrypt');
const { group } = require('console');
const util = require('util');

exports.getIndex = (req, res) => {
    //store if the user is logged in & pass to the template (for dynamic navbar links)
    const { isLoggedIn } = req.session;
    res.render('index', { currentPage: 'home', isLoggedIn });
};

exports.getLogin = (req, res) => {

    const { isLoggedIn } = req.session;

    //check if user is already logged in, if so redirect to user home page
    if (isLoggedIn) {
        res.redirect('/user/home');
    } else {
        //user is not logged in, render login page
        res.render('login', { currentPage: 'login', isLoggedIn });
    }
};

exports.postLogin = async (req, res) => {
    const { isLoggedIn } = req.session;

    //perform check to ensure user isnt already logged in
    if (isLoggedIn) {
        //if logged in, redirect - dont allow the registration to contune
        res.redirect('/user/home');
    } else {
        //user isnt logged in

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
                    console.log('Email and Password match - ok to log in!');
                    //set up the session
                    const session = req.session;
                    session.isLoggedIn = true;
                    session.userid = userData[0].user_id;
                    session.firstName = userData[0].first_name;
                    session.lastName = userData[0].last_name;
                    console.log(session);
                    //redirect to user homepage
                    res.redirect('/user/home');
                } else {
                    console.log('Password does not match')
                }
            } else {
                console.log('user does not exist');
            }
        } catch (err) {
            throw err;
        }
    }
};

exports.getRegister = (req, res) => {
    const { isLoggedIn } = req.session;

    //check if user is already logged in, if so redirect to user home page
    if (isLoggedIn) {
        res.redirect('/user/home');
    } else {
        //user is not logged in, render register page
        res.render('register', { currentPage: 'register', isLoggedIn });
    }
};

exports.postRegister = async (req, res) => {
    const { isLoggedIn } = req.session;

    //check if user is already logged in, if so redirect to user home page
    if (isLoggedIn) {
        res.redirect('/user/home');
    } else {
        //user isnt logged in, safe to continue registration

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
                    console.log('User does not already exist');
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
                    //insert success message
                    //redirect to user home?
                    res.redirect('/login');

                }
            } catch (err) {
                if (err) console.log(err);
            }
        } else {
            //invalid data - did not pass validation functions
            console.log('invalid data entered!!');
        }
    }
};

exports.getUserHomePage = async (req, res) => {
    const { isLoggedIn, userid, firstName } = req.session;

    //check if user is logged in
    if (isLoggedIn) {
        //this query retrieves the data from snapshots, and the emotions/levels recorded on those snapshots
        const selectSnapshots = `SELECT snapshot.snapshot_id, date, time, emotion, emotion.emotion_id, rating FROM snapshot INNER JOIN snapshot_emotion ON snapshot.snapshot_id = snapshot_emotion.snapshot_id INNER JOIN emotion ON snapshot_emotion.emotion_id = emotion.emotion_id WHERE user_id = ?`;
        //this query selects the emotions for our table headers
        const selectEmotions = `SELECT emotion FROM emotion`;

        const vals = [getCurrentDate(), userid];
        const selectTodaysSnapshots = `SELECT COUNT(snapshot_id) AS count FROM snapshot WHERE date = ? AND user_id = ?`;

        //set up an empty array (for parsing data into an appropriate data structure to pass to the ejs template)
        const groupedData = {};

        try {

            //run the queries
            const [emotions, fieldData] = await db.query(selectEmotions);
            const [data, fielddata] = await db.query(selectSnapshots, [userid]);
            const [todaysSnapshots, fieldData2] = await db.query(selectTodaysSnapshots, vals);

            //initialise counter
            let numberOfSnapshots = 0;
            //loop through each row, we need to create an array of snapshot objects, that each contain an array of emotions with ratings
            data.forEach(row => {
                //destructure into variables
                const { snapshot_id, date, time, emotion, emotion_id, rating } = row;

                //check if the snapshot object already exists in the array, if not create the object
                if (!groupedData[snapshot_id]) {
                    groupedData[snapshot_id] = {
                        snapshot_id,
                        date: formatDatabaseDate(date),
                        time,
                        emotions: [],
                    }
                    //increase the counter to keep track of how many snapshots there are in the array
                    numberOfSnapshots += 1;
                }
                //add the emotion into the emotions array (within the snapshot object), along with the id and rating
                groupedData[snapshot_id].emotions.push({ emotion_id: emotion_id, emotion: emotion, rating: rating });
            });

            //transform to an array so we can sort the values
            var groupedDataArray = Object.values(groupedData);

            //sort the snapshots based on the id, in descending order - so that the most recent is displayed first.
            const groupedDataSorted = groupedDataArray.sort((a, b) => {
                return b.snapshot_id - a.snapshot_id;
            });

            //set up todays message
            let todaysSnapMessage = null;
            //check if there have been snapshots today and display an appropriate message
            if (todaysSnapshots[0].count > 0) {
                todaysSnapMessage = { message: `You have recorded ${todaysSnapshots[0].count} snapshots today! Well done!` };
            } else {
                todaysSnapMessage = { message: `You have not recorded any snapshots yet today` };
            }

            //render the page and data
            res.render('userhome', {groupedDataSorted, emotions, numberOfSnapshots, todaysSnapMessage, firstName });
        } catch (err) {
            throw err;
        }
    } else {
        //user not logged in - redirect to login page
        res.redirect('/login');
    }

};



exports.getNewSnapshotPage = async (req, res) => {

    const { isLoggedIn, firstName, userid, lastName } = req.session;

    //check if user is logged in
    if (isLoggedIn) {

        const groupedData = await fetchEmotionData();

        const selectTriggers = `SELECT trigger_id, trigger_name, icon FROM triggers`;
        //run the query to get the triggers
        const [triggerData, fieldData] = await db.query(selectTriggers);

        //console.log(JSON.stringify(groupedData));
        //console.log(triggerData);
        const currentDate = formatDatabaseDate(getCurrentDate())
        const dateTime = `${currentDate} ${getCurrentTime()}`;

        res.render('snapshot', { groupedData, triggerData, lastName, firstName, dateTime });

    } else {
        //user isnt logged in - redirect to login page
        res.redirect('/login');
    }
};

exports.processNewSnapshot = async (req, res) => {

    const { isLoggedIn, firstName, userid } = req.session;

    //check user is logged in
    if (isLoggedIn) {
        //Extract data from the URL (assuming they are in the query parameters)
        const formData = req.query;
        const { notes } = req.query;

        //Process the form data and prepare it for database insertion
        const emotionsToInsert = [];

        try {
            //insert snapshot record first
            const snapshotInsert = `INSERT INTO snapshot (user_id, date, time, note) VALUES (?, ?, ?, ?)`;
            const date = getCurrentDate();
            const time = getCurrentTime();
            const snapshotVals = [userid, date, time, notes];
            const triggersToInsert = Array.isArray(req.query.trigger) ? req.query.trigger : (req.query.trigger ? [req.query.trigger] : []);
            //Ensures triggers are stored in an array so we can later iterate through - as if only one trigger is submitted it does not create an array, it is stored as a string. We have avoided this behaviour.
            //We have also done a check to ensure we dont create an array with one object of undefined - if no triggers are selected
            const [snapInsert, fieldData] = await db.query(snapshotInsert, snapshotVals);
            //store the id of the snapshot - needs to be inserted on each many to many record we insert on the many to many table
            const snapshotId = snapInsert.insertId;
            //loop through emotions and values in the url query and insert into array
            for (const id in formData) {
                if (Object.hasOwnProperty.call(formData, id) && id != 'notes' && id != 'trigger') {
                    const value = formData[id];
                    // push the data into the array as an object with the snapshot id, emotion id and the value submitted
                    emotionsToInsert.push({ snapshotId, id, value });
                }
            }
            //console.log(emotionsToInsert);

            //now insert each emotion record in the many to many table snapshot_emotion
            if (emotionsToInsert.length > 0) { //check first if we have any records to insert
                const emotionQuery = 'INSERT INTO snapshot_emotion (snapshot_id, emotion_id, rating) VALUES ?';
                const [rows, fielddata] = await db.query(emotionQuery, [emotionsToInsert.map(record => [record.snapshotId, record.id, record.value])]);
            }

            //now insert each trigger in the many to many table snapshot_trigger
            if (triggersToInsert.length > 0) {
                console.log(triggersToInsert.length);
                console.log(triggersToInsert);
                const triggerQuery = `INSERT INTO snapshot_trigger (snapshot_id, trigger_id) VALUES (?, ?)`;
                triggersToInsert.forEach(async trig => {
                    const vals = [snapshotId, trig];
                    const [data, fielddata] = await db.query(triggerQuery, vals);
                });
            }

            res.redirect(`/user/snapshot/view/${snapshotId}`);
        } catch (err) {
            throw err;
        }
    } else {
        //user not logged in - redirect to login page
        res.redirect('/login');
    }
};

exports.getViewSnapshot = async (req, res) => {

    const { isLoggedIn, userid, firstName, lastName } = req.session;
    const { id } = req.params;
    console.log(id);

    //check if user is logged in
    if (isLoggedIn) {
        const queryEmotions = `SELECT snapshot.snapshot_id, snapshot.user_id, note, date, time, snapshot_emotion_id, emotion, emotion.emotion_id, snapshot_emotion.rating FROM snapshot INNER JOIN snapshot_emotion ON snapshot.snapshot_id = snapshot_emotion.snapshot_id INNER JOIN emotion ON snapshot_emotion.emotion_id = emotion.emotion_id
        WHERE snapshot.snapshot_id = ? AND user_id = ?`;

        const vals = [id, userid];
        const [rows, fielddata] = await db.query(queryEmotions, vals);
        //console.log(rows);

        const groupedData = {};

        rows.forEach(row => {
            const { snapshot_id, user_id, note, date, time, snapshot_emotion_id, rating, emotion, emotion_id } = row;
            if (!groupedData[snapshot_id]) {
                groupedData[snapshot_id] = {
                    snapshot_id,
                    user_id,
                    note,
                    date: formatDatabaseDate(date),
                    time,
                    emotions: [],
                }
            }
            groupedData[snapshot_id].emotions.push({ emotion: emotion, emotion_id: emotion_id, snapshot_emotion_id: snapshot_emotion_id, rating: rating, ratings: {} });
        });

        //get rating data for each emotion and insert it into the groupedData object, under each emotion as an array of ratings
        for (const emotion of groupedData[id].emotions) {
            const vals = [emotion.emotion_id];
            const query = `SELECT rating, emotion.emotion_id, short_desc, long_desc FROM emotion INNER JOIN emotion_rating ON emotion.emotion_id = emotion_rating.emotion_id INNER JOIN rating ON emotion_rating.rating_id = rating.rating_id WHERE emotion.emotion_id = ?`;
            const [rows, fielddata] = await db.query(query, vals);
            rows.forEach(row => {
                emotion.ratings[row.rating] = {rating: row.rating, short_desc: row.short_desc, long_desc: row.long_desc};
            });
        }

        //get the triggers for the snapshot
        const triggerQuery = `SELECT trigger_name, icon, triggers.trigger_id, snapshot_trigger_id FROM snapshot_trigger INNER JOIN triggers ON snapshot_trigger.trigger_id = triggers.trigger_id WHERE snapshot_id = ?`;
        const [trigrows, field] = await db.query(triggerQuery, [id]);
        console.log(trigrows);

        
        /*
        groupedData[id].emotions.forEach(emotion => {
            console.log(emotion.ratings);
            //emotion.ratings.forEach(rating => {
                //console.log(`${emotion.emotion_id} ${rating.rating} ${rating.short_desc}`);
              //  console.log(rating);
           // })
        })
        */
        

        res.render('viewsnapshot', {snapshot: groupedData[id], triggers: trigrows, firstName, lastName});

    } else {
        //users not logged in - redirect
        res.redirect('/login');
    }
};

exports.deleteSnapshot = async (req, res) => {
    //get the snapshot id from the parameters
    const { id } = req.params;
    //get session details
    const { isLoggedIn, userid, firstName, lastName } = req.session;

    //check user is logged in
    if(isLoggedIn){
        //check the snapshot exists AND that it belongs to the current user logged in - query the database
        const snapshotQuery = `SELECT * FROM snapshot WHERE snapshot_id = ? AND user_id = ?`;
        const [snapshotRows, fieldData] = await db.query(snapshotQuery, [id, userid]);

        //check that a snapshot has been returned
        if(snapshotRows.length>0) {
            //snapshot exists, perform deletion
            const deleteTriggersQuery = `DELETE FROM snapshot_trigger WHERE snapshot_id = ?`;
            const deleteEmotionsLogged = `DELETE FROM snapshot_emotion WHERE snapshot_id = ?`;
            const deleteSnapshotQuery = `DELETE FROM snapshot WHERE snapshot_id = ?`;

            try{
            const [delTrig, fielddata] = await db.query(deleteTriggersQuery ,[id]);
            const [delEmo, fielddata2] = await db.query(deleteEmotionsLogged, [id]);
            const [delSap, fielddata3] = await db.query(deleteSnapshotQuery, [id]);
            } catch(err) {
                throw err;
            }
            console.log('Deletion successful');
            res.redirect('/user/home');

        } else {
            //snapshot doesnt exist or belongs to another user
            console.log('Snapshot doesnt exist or belongs to another user');
        }
    } else {
        //user not logged in - redirect to login
        res.redirect('/login');
    }
    
};

exports.getLogout = (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
};

exports.getEdit = async (req, res) => {
    const { id } = req.params;
    const { userid, isLoggedIn, firstName, lastName } = req.session;
    
    //check if user is logged in
    if(isLoggedIn) {
        //logged in, continue
        const queryEmotions = `SELECT snapshot.snapshot_id, snapshot.user_id, note, date, time, snapshot_emotion_id, emotion, emotion.emotion_id, snapshot_emotion.rating FROM snapshot INNER JOIN snapshot_emotion ON snapshot.snapshot_id = snapshot_emotion.snapshot_id INNER JOIN emotion ON snapshot_emotion.emotion_id = emotion.emotion_id
        WHERE snapshot.snapshot_id = ? AND user_id = ?`;

        const vals = [id, userid];
        const [rows, fielddata] = await db.query(queryEmotions, vals);
        //console.log(rows);

        const groupedData = {};

        rows.forEach(row => {
            const { snapshot_id, user_id, note, date, time, snapshot_emotion_id, rating, emotion, emotion_id } = row;
            if (!groupedData[snapshot_id]) {
                groupedData[snapshot_id] = {
                    snapshot_id,
                    user_id,
                    note,
                    date: formatDatabaseDate(date),
                    time,
                    emotions: {},
                }
            }
            groupedData[snapshot_id].emotions[emotion_id] = { emotion: emotion, emotion_id: emotion_id, snapshot_emotion_id: snapshot_emotion_id, rating: rating, ratings: {} };
        });

        //get rating data for each emotion and insert it into the groupedData object, under each emotion as an array of ratings
        for (const emotion of Object.values(groupedData[id].emotions)) {
            const vals = [emotion.emotion_id];
            const query = `SELECT rating, emotion.emotion_id, short_desc, long_desc FROM emotion INNER JOIN emotion_rating ON emotion.emotion_id = emotion_rating.emotion_id INNER JOIN rating ON emotion_rating.rating_id = rating.rating_id WHERE emotion.emotion_id = ?`;
            const [rows, fielddata] = await db.query(query, vals);
            rows.forEach(row => {
                emotion.ratings[row.rating] = {rating: row.rating, short_desc: row.short_desc, long_desc: row.long_desc};
            });
        }

        //get the triggers for the snapshot
        const triggerQuery = `SELECT trigger_name, icon, triggers.trigger_id, snapshot_trigger_id, CASE WHEN snapshot_trigger.snapshot_trigger_id IS NOT NULL THEN true ELSE false END AS selected FROM triggers LEFT JOIN snapshot_trigger ON triggers.trigger_id = snapshot_trigger.trigger_id AND snapshot_trigger.snapshot_id = ?`;
        const [trigrows, field] = await db.query(triggerQuery, [id]);
        console.log(trigrows);

        
        
       //console.log(JSON.stringify(groupedData));
        
       res.render('editsnapshot', {snapshot: groupedData[id], triggers: trigrows, firstName, lastName});
    } else {
        //not logged in, redirect to login
        res.redirect('/login');
    }
};

exports.getEditUpdate = async (req, res) => {
    const { isLoggedIn, firstName, userid } = req.session;
    const { id } = req.params;

    //check user is logged in
    if (isLoggedIn) {
        //Extract data from the URL (assuming they are in the query parameters)
        const formData = req.query;
        const { notes } = req.query;

        //update notes
        //update triggers (first delete existing)
        //ignore emotion data

        //Process the form data and prepare it for database insertion
        const emotionsToInsert = [];

        try {
            //insert snapshot record first
            const snapshotUpdate = `UPDATE snapshot SET note = ? WHERE snapshot_id = ?`;
            const date = getCurrentDate();
            const time = getCurrentTime();
            const snapshotVals = [notes, id];
            const triggersToInsert = Array.isArray(req.query.trigger) ? req.query.trigger : (req.query.trigger ? [req.query.trigger] : []);
            //Ensures triggers are stored in an array so we can later iterate through - as if only one trigger is submitted it does not create an array, it is stored as a string. We have avoided this behaviour.
            //We have also done a check to ensure we dont create an array with one object of undefined - if no triggers are selected
            const [snapUpdate, fieldData] = await db.query(snapshotUpdate, snapshotVals);
            
            //delete all existing triggers, we will reinsert the triggers submitted to ensure we dont retain any that may have been deselected
            const clearTriggers = `DELETE FROM snapshot_trigger WHERE snapshot_id = ?`;
            const [delTrig, fieldData2] = await db.query(clearTriggers, [id]);

           //now insert each trigger in the many to many table snapshot_trigger
            if (triggersToInsert.length > 0) {
                console.log(triggersToInsert.length);
                console.log(triggersToInsert);
                const triggerQuery = `INSERT INTO snapshot_trigger (snapshot_id, trigger_id) VALUES (?, ?)`;
                triggersToInsert.forEach(async trig => {
                    const vals = [id, trig];
                    const [data, fielddata] = await db.query(triggerQuery, vals);
                });
            }

            res.redirect(`/user/snapshot/view/${id}`);
        } catch (err) {
            throw err;
        }
    } else {
        //user not logged in - redirect to login page
        res.redirect('/login');
    }
};

exports.getNotFound = (req, res) => {
    //render page not found
    res.status(404).send('<h1>404: Page Not Found</h1>');
};


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
    /*must start with one or more characters that are not whitespace or @
    then must contain @ symbol
    Followed by one or more characters that are not whitespace or @
    must contain a . for domain seperator
    must end with one or more characters that are not whitespace or @ 
    */

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

//takes a plain text password, returns a salted and hashed password using bcrypt
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

//Get the current date YY/MM/DD in this format for the mysql database insertion
function getCurrentDate() {
    let currentDate = new Date();

    let year = currentDate.getFullYear();
    let month = currentDate.getMonth() + 1; //zero indexed
    let date = currentDate.getDate();

    let formattedDate = `${year}/${month}/${date}`;

    return `${formattedDate}`;
}

//Get the current time
function getCurrentTime() {
    let currentDate = new Date();

    let hours = currentDate.getHours();
    let minutes = currentDate.getMinutes();
    let seconds = currentDate.getSeconds();

    let formattedTime = `${hours}:${minutes}:${seconds}`;
    return formattedTime;
}

//parse the long version of the data from the database to the format DD/MM/YYYY
function formatDatabaseDate(date) {
    const databaseDate = new Date(date);
    const year = databaseDate.getFullYear();
    const month = databaseDate.getMonth() + 1; //zero indexed
    const day = databaseDate.getDate();

    return `${day}/${month}/${year}`;
}

async function fetchEmotionData() {
    const selectRatings = `SELECT emotion.emotion_id, emotion, rating, short_desc, long_desc FROM emotion INNER JOIN emotion_rating ON emotion.emotion_id = emotion_rating.emotion_id INNER JOIN rating ON emotion_rating.rating_id = rating.rating_id`;

    try {
        //run query to get the emotions and ratings data
        const [data, fielddata2] = await db.query(selectRatings);
        //console.log(data)
        const groupedData = {};
        //parse data into an appropriate structure to pass to the template
        data.forEach(row => {
            //if it doesnt already exist, create the emotion object
            const { emotion_id, emotion, rating, short_desc, long_desc } = row;
            if (!groupedData[emotion_id]) {
                groupedData[emotion_id] = {
                    emotion_id,
                    emotion,
                    rating: []
                };
            }
            //push each rating data into the rating array in the emotion object
            groupedData[emotion_id].rating.push({ rating: rating, shortdesc: short_desc, longdesc: long_desc });
        });
        //console.log(groupedData);
        return groupedData;
    } catch (err) {
        throw err;
    }
};

