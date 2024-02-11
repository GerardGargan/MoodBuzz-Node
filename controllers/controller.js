const db = require("./../util/dbconn");
const bcrypt = require("bcrypt");
const axios = require("axios");

exports.getIndex = (req, res) => {
  //store if the user is logged in & pass to the template (for dynamic navbar links)
  const { isLoggedIn } = req.session;
  res.render("index", { currentPage: "home", isLoggedIn });
};

exports.getLogin = (req, res) => {
  const { isLoggedIn } = req.session;

  //check if user is already logged in, if so redirect to user home page
  if (isLoggedIn) {
    res.redirect("/user/home");
  } else {
    //user is not logged in, render login page
    res.render("login", { currentPage: "login", isLoggedIn });
  }
};

exports.postLogin = async (req, res) => {
  const { isLoggedIn } = req.session;
  const { email, password } = req.body;
  //perform check to ensure user isnt already logged in
  if (isLoggedIn) {
    //if logged in, redirect - dont allow the registration to contune
    res.redirect("/user/home");
  } else {

    try {
      const endpoint = 'http://localhost:3001/user/login';
      const vals = { email, password };
      //post the form data to the api post route
      const response = await axios.post(endpoint, vals, {validateStatus: (status) => {return status < 500}});
      //if email and password are a match
      if(response.status == 200) {
        //success, set up session and redirect
        //get the user data returned from the api
          const userData = response.data.result;
          //set up a session
          const session = req.session;
          session.isLoggedIn = true;
          session.userid = userData[0].user_id;
          session.firstName = userData[0].first_name;
          session.lastName = userData[0].last_name;

          //redirect to user homepage
          res.redirect("/user/home");

      } else {
        //invalid login credentials, handle error message to user
        console.log(response.data.message);
      }
    } catch (err){
      //server error
      console.log(err);
    }
  }
};

exports.getRegister = (req, res) => {
  const { isLoggedIn } = req.session;

  //check if user is already logged in, if so redirect to user home page
  if (isLoggedIn) {
    res.redirect("/user/home");
  } else {
    //user is not logged in, render register page
    res.render("register", { currentPage: "register", isLoggedIn });
  }
};

exports.postRegister = async (req, res) => {
  const { isLoggedIn } = req.session;

  //check if user is already logged in, if so redirect to user home page
  if (isLoggedIn) {
    res.redirect("/user/home");
  } else {
    //user isnt logged in, safe to continue registration

    let vals = { firstname, surname, email, password } = req.body;
    console.log(`${firstname} ${surname} ${email} ${password}`);

    //sanitise user input
    firstname = firstname.trim();
    surname = surname.trim();
    email = email.trim();

    //perform validation checks on data
    if (
      validateName(firstname) &&
      validateName(surname) &&
      validateEmail(email) &&
      validatePassword(password)
    ) {

      try {
        const endpoint = 'http://localhost:3001/user/register';
        const response = await axios.post(endpoint, vals, {validateStatus: (status) => {return status < 500}});
        if(response.status == 201) {
          //user created successfully, redirect to login
          res.redirect('/login');
        } else {
          //user email already exists, handle error message
          console.log('email already exists, cant complete registration')
          res.redirect('/register');
        }

      } catch (err) {
        console.log(err);
      }
    } else {
      //invalid data - did not pass validation functions, handle error
      console.log("invalid data entered!!");
    }
  }
};

exports.getUserHomePage = async (req, res) => {
  const { isLoggedIn, userid, firstName } = req.session;

  //check if user is logged in
  if (isLoggedIn) {

    try {
      //query database, retrieve snapshots for the current user
      const endpointSnapshots = `http://localhost:3001/snapshot/user/${userid}`;
      const snapshotRequest = await axios.get(endpointSnapshots, {validateStatus: (status) => {return status < 500}});
      const snapshots = snapshotRequest.data.result;
      //get emotions data from the database
      const endpointEmotions = `http://localhost:3001/emotions`;
      const emotionsRequest = await axios.get(endpointEmotions, {validateStatus: (status) => {return status < 500}});
      const emotions = emotionsRequest.data.result;

      //get the number of snapshots returned
      const numberOfSnapshots = snapshots.length;

      //count the number of snapshots recorded today
      const countToday = countTodaysSnapshots(snapshots);
      //pass this in to get todays message to display to the user
      const todaysSnapMessage = todaysSnapshotMessage(countToday);

      res.render("userhome", {
        groupedDataSorted: snapshots,
        emotions: emotions,
        numberOfSnapshots,
        todaysSnapMessage,
        firstName,
      });
    }
    catch (err) {
      //handle error
      console.log(err);
    }
  } else {
    //user not logged in - redirect to login page,
    res.redirect("/login");
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
    const currentDate = formatDatabaseDate(getCurrentDate());
    const dateTime = `${currentDate} ${getCurrentTime()}`;

    res.render("snapshot", {
      groupedData,
      triggerData,
      lastName,
      firstName,
      dateTime,
    });
  } else {
    //user isnt logged in - redirect to login page
    res.redirect("/login");
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
      const triggersToInsert = Array.isArray(req.query.trigger)
        ? req.query.trigger
        : req.query.trigger
        ? [req.query.trigger]
        : [];
      //Ensures triggers are stored in an array so we can later iterate through - as if only one trigger is submitted it does not create an array, it is stored as a string. We have avoided this behaviour.
      //We have also done a check to ensure we dont create an array with one object of undefined - if no triggers are selected
      const [snapInsert, fieldData] = await db.query(
        snapshotInsert,
        snapshotVals
      );
      //store the id of the snapshot - needs to be inserted on each many to many record we insert on the many to many table
      const snapshotId = snapInsert.insertId;
      //loop through emotions and values in the url query and insert into array
      for (const id in formData) {
        if (
          Object.hasOwnProperty.call(formData, id) &&
          id != "notes" &&
          id != "trigger"
        ) {
          const value = formData[id];
          // push the data into the array as an object with the snapshot id, emotion id and the value submitted
          emotionsToInsert.push({ snapshotId, id, value });
        }
      }
      //console.log(emotionsToInsert);

      //now insert each emotion record in the many to many table snapshot_emotion
      if (emotionsToInsert.length > 0) {
        //check first if we have any records to insert
        const emotionQuery =
          "INSERT INTO snapshot_emotion (snapshot_id, emotion_id, rating) VALUES ?";
        const [rows, fielddata] = await db.query(emotionQuery, [
          emotionsToInsert.map((record) => [
            record.snapshotId,
            record.id,
            record.value,
          ]),
        ]);
      }

      //now insert each trigger in the many to many table snapshot_trigger
      if (triggersToInsert.length > 0) {
        console.log(triggersToInsert.length);
        console.log(triggersToInsert);
        const triggerQuery = `INSERT INTO snapshot_trigger (snapshot_id, trigger_id) VALUES (?, ?)`;
        triggersToInsert.forEach(async (trig) => {
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
    res.redirect("/login");
  }
};

exports.getViewSnapshot = async (req, res) => {
  const { isLoggedIn, userid, firstName, lastName } = req.session;
  const { id } = req.params;
  console.log(id);

  //check if user is logged in
  if (isLoggedIn) {
    try {
      const response = await axios.get(`http://localhost:3001/snapshot/${id}`, {
        validateStatus: (status) => {
          return status < 500;
        },
        headers: { userid: `${userid}` },
      });

      if (response.status == 200) {
        //successfully retrieved a snapshot, render

        res.render("viewsnapshot", {
          snapshot: response.data.result,
          firstName,
          lastName,
        });
      } else {
        console.log("Snapshot doesnt exist");
      }
    } catch {
      console.log("error in catch");
    }
  } else {
    //users not logged in - redirect
    res.redirect("/login");
  }
};

exports.deleteSnapshot = async (req, res) => {
  //get the snapshot id from the parameters
  const { id } = req.params;
  //get session details
  const { isLoggedIn, userid, firstName, lastName } = req.session;

  //check user is logged in
  if (isLoggedIn) {
    
    try {
      const response = await axios.delete(`http://localhost:3001/snapshot/${id}`, {
        validateStatus: (status) => {
          return status < 500;
        },
        headers: {
          userid: userid
        }
      });

      if(response.status == 200) {
        //successful deletion, redirect
        console.log(`snapshot ${id} deleted`);
        res.redirect('/user/home');
      } else {
        //invalid id or does not belong to user, log out message
        console.log(response.data.message);
        //redirect to user home
        res.redirect('/user/home');
      }

    } 
    catch(err) {
      //server error, log out error
      console.log(response.data.message);
    }

  } else {
    //user not logged in - redirect to login
    res.redirect("/login");
  }
};

exports.getLogout = (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
};

exports.getEdit = async (req, res) => {
  const { id } = req.params;
  const { userid, isLoggedIn, firstName, lastName } = req.session;

  //check if user is logged in
  if (isLoggedIn) {
    try {
      const response = await axios.get(`http://localhost:3001/snapshot/${id}`, {
        validateStatus: (status) => {
          return status < 500;
        },
        headers: { userid: `${userid}` },
      });

      if (response.status == 200) {
        //success, render snapshot
        res.render("editsnapshot", { snapshot: response.data.result, firstName, lastName });
        
      } else {
        //unsuccessful, snapshot doesnt exist or doesnt belong to user
        console.log(
          "unsuccessful, snapshot doesnt exist or doesnt belong to user"
        );
      }
    } catch (err) {
      console.log(err);
    }
  } else {
    //not logged in, redirect to login
    res.redirect("/login");
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
      const snapshotUpdate = `UPDATE snapshot SET note = ? WHERE snapshot_id = ? AND user_id = ?`;
      const date = getCurrentDate();
      const time = getCurrentTime();
      const snapshotVals = [notes, id, userid];
      const triggersToInsert = Array.isArray(req.query.trigger)
        ? req.query.trigger
        : req.query.trigger
        ? [req.query.trigger]
        : [];
      //Ensures triggers are stored in an array so we can later iterate through - as if only one trigger is submitted it does not create an array, it is stored as a string. We have avoided this behaviour.
      //We have also done a check to ensure we dont create an array with one object of undefined - if no triggers are selected
      const [snapUpdate, fieldData] = await db.query(
        snapshotUpdate,
        snapshotVals
      );

      //delete all existing triggers, we will reinsert the triggers submitted to ensure we dont retain any that may have been deselected
      const clearTriggers = `DELETE FROM snapshot_trigger WHERE snapshot_id = ?`;
      const [delTrig, fieldData2] = await db.query(clearTriggers, [id]);

      //now insert each trigger in the many to many table snapshot_trigger that was submitted in the form
      if (triggersToInsert.length > 0) {
        console.log(triggersToInsert.length);
        console.log(triggersToInsert);
        const triggerQuery = `INSERT INTO snapshot_trigger (snapshot_id, trigger_id) VALUES (?, ?)`;
        triggersToInsert.forEach(async (trig) => {
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
    res.redirect("/login");
  }
};

exports.getNotFound = (req, res) => {
  //render page not found
  res.status(404).send("<h1>404: Page Not Found</h1>");
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

  if (
    name.length >= minLength &&
    name.length <= maxLength &&
    nameRegex.test(name)
  ) {
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

function countTodaysSnapshots(snapshots) {
  let countToday = 0;
      let currentDate = formatDatabaseDate(getCurrentDate());
      snapshots.forEach(snapshot => {
        let date = snapshot.date;
        if(date == currentDate) {
          countToday += 1;
        }
      });
      return countToday;
}

function todaysSnapshotMessage(number_of_snapshots) {
  let todaysSnapMessage = null;
      //check if there have been snapshots today and display an appropriate message
      if (number_of_snapshots > 0) {
        todaysSnapMessage = {
          message: `You have recorded ${number_of_snapshots} snapshots today! Well done!`,
        };
      } else {
        todaysSnapMessage = {
          message: `You have not recorded any snapshots yet today`,
        };
      }
      return todaysSnapMessage;
}

async function fetchEmotionData() {
  const selectRatings = `SELECT emotion.emotion_id, emotion, rating, short_desc, long_desc FROM emotion INNER JOIN emotion_rating ON emotion.emotion_id = emotion_rating.emotion_id INNER JOIN rating ON emotion_rating.rating_id = rating.rating_id`;

  try {
    //run query to get the emotions and ratings data
    const [data, fielddata2] = await db.query(selectRatings);
    //console.log(data)
    const groupedData = {};
    //parse data into an appropriate structure to pass to the template
    data.forEach((row) => {
      //if it doesnt already exist, create the emotion object
      const { emotion_id, emotion, rating, short_desc, long_desc } = row;
      if (!groupedData[emotion_id]) {
        groupedData[emotion_id] = {
          emotion_id,
          emotion,
          rating: [],
        };
      }
      //push each rating data into the rating array in the emotion object
      groupedData[emotion_id].rating.push({
        rating: rating,
        shortdesc: short_desc,
        longdesc: long_desc,
      });
    });
    //console.log(groupedData);
    return groupedData;
  } catch (err) {
    throw err;
  }
}
