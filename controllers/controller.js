const axios = require("axios");
//import custom utility functions
const {
  average,
  validatePassword,
  validateEmail,
  validateName,
  getCurrentDate,
  getCurrentTime,
  formatDatabaseDate,
  countTodaysSnapshots,
  todaysSnapshotMessage,
} = require("../util/helper_functions");

exports.getIndex = (req, res) => {
  //store if the user is logged in & pass to the template (for dynamic navbar links)
  const { isLoggedIn } = req.session;
  res.render("index", { currentPage: "home", isLoggedIn });
};

exports.getLogin = (req, res) => {
  const { isLoggedIn } = req.session;
  //check if a user was just registered, if so display success message
  const successMessage = req.query.success
    ? "Registration successful. You can now log in."
    : null;

  res.render("login", {
    currentPage: "login",
    isLoggedIn,
    error: false,
    successMessage,
  });
};

exports.postLogin = async (req, res) => {
  const { isLoggedIn } = req.session;
  let { email, password } = req.body;

  try {
    //API endpoint for post
    const endpoint = "http://localhost:3001/user/login";
    //values to be posted
    const vals = { email, password };
    //post the form data to the api post route
    const response = await axios.post(endpoint, vals, {
      validateStatus: (status) => {
        return status < 500;
      },
    });
    //check if email and password are a match
    if (response.status == 200) {
      //success, set up session and redirect
      //get the user data returned from the api
      const userData = response.data.result;
      //set up a session for authentication
      const session = req.session;
      session.isLoggedIn = true;
      session.userid = userData[0].user_id;
      session.firstName = userData[0].first_name;
      session.lastName = userData[0].last_name;
      //if the user was redirected from another protected page, get the url
      const orig_route = session.route;

      //if there was no url (i.e. they accessed /login directly), redirect to user home
      if (!orig_route) {
        res.redirect("/user/home");
      } else {
        //redirect to the url they were trying to access
        res.redirect(`${orig_route}`);
      }
    } else {
      //invalid login credentials, handle error message to user
      //console.log(response.data.message);
      res.render("login", {
        currentPage: "login",
        isLoggedIn,
        error: "Incorrect email or password",
        successMessage: null,
      });
    }
  } catch (err) {
    //server error
    console.log(err);
  }
};

exports.getRegister = (req, res) => {
  const { isLoggedIn } = req.session;
  res.render("register", { currentPage: "register", isLoggedIn, error: false });
};

exports.postRegister = async (req, res) => {
  const { isLoggedIn } = req.session;

  //destructure the values from the form in the request body
  let { firstname, surname, email, password } = req.body;

  //sanitise user input, remove any leading or trailing whitespace, force to be lowercase
  firstname = firstname.trim().toLowerCase();
  surname = surname.trim().toLowerCase();
  email = email.trim().toLowerCase();

  //capitalise first letter of firstname and surname
  firstname = firstname.charAt(0).toUpperCase() + firstname.slice(1);
  surname = surname.charAt(0).toUpperCase() + surname.slice(1);
  
  //store the values for the axios post
  const vals = { firstname, surname, email, password };

  //perform validation checks on data, render an error message for each scenario
  if (!validateName(firstname) || !validateName(surname)) {
    //names do not meet business rules, render error on registration page
    return res.render("register", {
      currentPage: "register",
      isLoggedIn,
      error:
        "First and last name must be between 2-50 characters and contain no special characters",
    });
  }

  if (!validateEmail(email)) {
    //email does not meet business rules, render error on registration page
    return res.render("register", {
      currentPage: "register",
      isLoggedIn,
      error: "Invalid email address",
    });
  }

  if (!validatePassword(password)) {
    //password does not meet business rules, render error on reigstration page
    return res.render("register", {
      currentPage: "register",
      isLoggedIn,
      error:
        "Password must be at least 8 characters long and contain a capital letter",
    });
  }

  //we have passed all validation checks on user inputs, proceed to attempt registration with API call
  try {
    const endpoint = "http://localhost:3001/user/register";
    const response = await axios.post(endpoint, vals, {
      validateStatus: (status) => {
        return status < 500;
      },
    });
    if (response.status == 201) {
      //user created successfully, redirect to login
      res.redirect("/login?success=1");
    } else {
      //email already exists, render error on registration page
      res.render("register", {
        currentPage: "register",
        isLoggedIn,
        error: "Email already exists",
      });
    }
  } catch (err) {
    //API Server error, log out
    console.log(err);
  }
};

exports.getUserHomePage = async (req, res) => {
  const { userid, firstName, lastName } = req.session;
  //check if a deletion occured - will be in the url query - so we can display a success message to the user
  const deletedMessage = req.query.deleted ? "Snapshot deleted" : null;

  try {
    //query database, retrieve snapshots for the current user
    const endpointSnapshots = `http://localhost:3001/snapshot/user/${userid}`;
    const snapshotRequest = await axios.get(endpointSnapshots, {
      validateStatus: (status) => {
        return status < 500;
      },
    });
    //store the result
    const snapshots = snapshotRequest.data.result;

    //get the number of snapshots returned
    const numberOfSnapshots = snapshots.length;

    //count the number of snapshots recorded today
    const countToday = countTodaysSnapshots(snapshots);
    //pass this in to custom function to get todays message to display to the user
    const todaysSnapMessage = todaysSnapshotMessage(countToday);

    const currentDateTime = `${formatDatabaseDate(
      getCurrentDate()
    )} ${getCurrentTime()}`;

    //render the page
    res.render("userhome", {
      groupedDataSorted: snapshots,
      numberOfSnapshots,
      todaysSnapMessage,
      firstName,
      lastName,
      currentDateTime,
      deletedMessage,
    });
  } catch (err) {
    //log out API server error
    console.log(err);
  }
};

exports.getNewSnapshotPage = async (req, res) => {
  //destructure values from session
  const { firstName, userid, lastName } = req.session;

  //sent API request to get all emotions and triggers for rendering on the page
  try {
    const endpointEmotions = `http://localhost:3001/emotions`;
    const emotions = await axios.get(endpointEmotions, {
      validateStatus: (status) => {
        return status < 500;
      },
    });
    //store the result coming from the API
    const groupedData = emotions.data.result;

    //get the triggers from the API endpoint
    const endpointTriggers = `http://localhost:3001/triggers`;
    const triggers = await axios.get(endpointTriggers, {
      validateStatus: (status) => {
        return status < 500;
      },
    });
    //store the result
    const triggerData = triggers.data.result;

    //get current date (formatted) and format date time
    const currentDate = formatDatabaseDate(getCurrentDate());
    const dateTime = `${currentDate} ${getCurrentTime()}`;
    //render the snapshot page
    res.render("snapshot", {
      groupedData,
      triggerData,
      lastName,
      firstName,
      dateTime,
    });
  } catch (err) {
    //API error, status 500
    console.log(err);
  }
};

exports.processNewSnapshot = async (req, res) => {
  //get the userid from the session
  const { userid } = req.session;

  //Extract data from the request body
  const formData = req.body;

  //post the form data to the API endpoint, userid sent in the headers of the post request
  try {
    const endpoint = "http://localhost:3001/snapshot";
    const response = await axios.post(endpoint, formData, {
      validateStatus: (status) => {
        return status < 500;
      },
      headers: { userid: `${userid}` },
    });
    //get the snapshot id
    const snapshotId = response.data.id;
    //render the view snapshot page with the id of the snapshot and a success message
    res.redirect(`/user/snapshot/view/${snapshotId}?success=1`);
  } catch (err) {
    //Server error, status 500 - log out
    console.log(err);
  }
};

exports.getViewSnapshot = async (req, res) => {
  //destructure user info from session
  const { userid, firstName, lastName } = req.session;
  //get the snapshot id from the params
  const { id } = req.params;

  //check if a snapshot was successfully just added, if so display a success message
  const newSnapshotMessage = req.query.success
    ? "Snapshot successfully recorded"
    : null;
  //check if a snapshot was successfully just edited, if so display a success message
  const editSnapshotMessage = req.query.edit ? "Snapshot updated" : null;

  //send a get request to get the snapshot data
  try {
    const response = await axios.get(`http://localhost:3001/snapshot/${id}`, {
      validateStatus: (status) => {
        return status < 500;
      },
      headers: { userid: `${userid}` },
    });

    //check if a 200 status was recieved (snapshot exists and belongs to user)
    if (response.status == 200) {
      //successfully retrieved a snapshot, render it to the client

      res.render("viewsnapshot", {
        snapshot: response.data.result,
        firstName,
        lastName,
        error: false,
        newSnapshotMessage,
        editSnapshotMessage,
      });
    } else {
      //pass error message back to the view snapshot page
      res.render("viewsnapshot", {
        snapshot: null,
        firstName,
        lastName,
        error: "Snapshot does not exist or does not belong to current user",
        newSnapshotMessage,
        editSnapshotMessage,
      });
    }
  } catch {
    //server error status 500 - log out
    console.log("error in catch");
  }
};

exports.deleteSnapshot = async (req, res) => {
  //get the snapshot id from the parameters
  const { id } = req.params;
  //get session details
  const { userid, firstName, lastName } = req.session;

  //sent a delete request to the API endpoint
  try {
    const response = await axios.delete(
      `http://localhost:3001/snapshot/${id}`,
      {
        validateStatus: (status) => {
          return status < 500;
        },
        headers: {
          userid: userid,
        },
      }
    );

    if (response.status == 200) {
      //successful deletion, redirect
      console.log(`snapshot ${id} deleted`);
      res.redirect("/user/home?deleted=1");
    } else {
      //invalid id or does not belong to user, render error message
      res.render("viewsnapshot", {
        snapshot: null,
        firstName,
        lastName,
        error: response.data.message,
        newSnapshotMessage: null,
        editSnapshotMessage: null,
      });
    }
  } catch (err) {
    //server error, log out error
    console.log(response.data.message);
  }
};

exports.getLogout = (req, res) => {
  //destroy the session and redirect to home page
  req.session.destroy(() => {
    res.redirect("/");
  });
};

exports.getEdit = async (req, res) => {
  //get the id of the snapshot
  const { id } = req.params;
  //get the user info from the session
  const { userid, firstName, lastName } = req.session;

  //send get request to API endpoint for the snapshot
  try {
    const response = await axios.get(`http://localhost:3001/snapshot/${id}`, {
      validateStatus: (status) => {
        return status < 500;
      },
      headers: { userid: `${userid}` },
    });

    if (response.status == 200) {
      //success, snapshot exists and belongs to user - render snapshot
      res.render("editsnapshot", {
        snapshot: response.data.result,
        firstName,
        lastName,
        error: false,
      });
    } else {
      //unsuccessful, snapshot doesnt exist or doesnt belong to user - display error message
      res.render("editsnapshot", {
        snapshot: null,
        firstName,
        lastName,
        error: "Snapshot doesnt exist or doesnt belong to current user",
      });
    }
  } catch (err) {
    //API server error
    console.log(err);
  }
};

exports.postEditUpdate = async (req, res) => {
  //get user info from the session
  const { firstName, lastName, userid } = req.session;
  //get the id of the snapshot being edited
  const { id } = req.params;

  //get the data from the form
  const formData = req.body;

  //API endpoint for editing
  const endpoint = `http://localhost:3001/snapshot/edit/${id}`;
  try {
    //send patch request to API with formData
    const response = await axios.patch(endpoint, formData, {
      validateStatus: (status) => {
        return status < 500;
      },
      headers: { userid: `${userid}` },
    });

    if (response.status == 201) {
      //successful update, redirect to view the updated snapshot
      res.redirect(`/user/snapshot/view/${id}?edit=1`);
    } else {
      //snapshot doesnt exist or doesnt belong to current logged in user, display error
      res.render("editsnapshot", {
        snapshot: null,
        firstName,
        lastName,
        error: "Snapshot doesnt exist or doesnt belong to current user",
      });
    }
  } catch (err) {
    //server error, handle
    console.log(err.message);
  }
};

exports.getAnalytics = async (req, res) => {
  //get the userid from the session
  const { userid, firstName, lastName } = req.session;
  let { emotion } = req.query;

  try {
    //API endpoint for data retrieval for snapshots by month {month: count}
    const endpointMonthly = `http://localhost:3001/snapshot/analytics/snapshotspermonth/${userid}`;
    const responseMonthly = await axios.get(endpointMonthly, {
      validateStatus: (status) => {
        return status < 500;
      },
    });
    //store the result
    const monthlyData = responseMonthly.data.result;

    //get the maximum count that was returned from the dataset (used for setting max y-axis value on chart)
    const maxYAxisValueMonthly = Math.max(...Object.values(monthlyData));

    //set up empty arrays to hold dates and counts (chart.js requires arrays for y-axis and xlabels)
    const dates = [];
    const monthlyCounts = [];

    //loop through the result set and populate the arrays
    for (const [date, count] of Object.entries(monthlyData)) {
      dates.push(date);
      monthlyCounts.push(count);
    }

    //API endpoint for getting snapshots by weekday
    const endpointWeekday = `http://localhost:3001/snapshot/analytics/snapshotsperday/${userid}`;
    const responseWeekday = await axios.get(endpointWeekday, {
      validateStatus: (status) => {
        return status < 500;
      },
    });

    //access the data returned
    const weekdayData = responseWeekday.data.result;

    //set up arrays to hold weekdays and counts
    const weekdays = Object.keys(weekdayData);
    const weekdaycounts = Object.values(weekdayData);
    //get max value for setting max y-axis
    const maxWeekdayValue = Math.max(...weekdaycounts);

    //now get all snapshots, so we can chart average emotion levels on a radar chart
    const endpointAllSnapshots = `http://localhost:3001/snapshot/user/${userid}`;
    const requestSnapshots = await axios.get(endpointAllSnapshots, {
      validateStatus: (status) => {
        return status < 500;
      },
    });
    //store the result
    const snapshotData = requestSnapshots.data.result;
    //set up an empty object so we can parse data into a suitable structure
    const groupedEmotionsData = {};

    //loop through each snapshot, then each emotion. Check if it exists already, if not add it to the object
    snapshotData.forEach((snapshot) => {
      //loop through each emotion inside each snapshot
      snapshot.emotions.forEach((emotion) => {
        //check if the emotion exists in our grouped object
        if (!groupedEmotionsData[emotion.emotion]) {
          //it doesnt exist, create the emotion with an empty array
          groupedEmotionsData[emotion.emotion] = [];
        }

        //add the rating to the array for the current emotion
        groupedEmotionsData[emotion.emotion].push(emotion.rating);
      });
    });
    //now that we have a data structure containing each emotion, and an array of ratings for each -
    //loop through the data structure and work out the average rating for each emotion.
    Object.keys(groupedEmotionsData).forEach((emotion) => {
      //calculate the average for each emotion and store it against the emotion, replacing the array
      groupedEmotionsData[emotion] = average(groupedEmotionsData[emotion]);
    });

    //get an array of the emotions (keys) for chart js labels
    const emotionLabels = Object.keys(groupedEmotionsData);
    //get an array of the average ratings (values) for chart js values
    const emotionAverages = Object.values(groupedEmotionsData);
    //get the max value for max axis
    const maxEmotionValue = Math.max(...emotionAverages);

    //now obtain all triggers and their counts for this user, for working out most common triggers
    const endpoint = `http://localhost:3001/triggers/analytics/${userid}`;
    const triggersResponse = await axios.get(endpoint, {
      validateStatus: (status) => {
        return status < 500;
      },
    });

    //store the data in a variable
    const triggerCounts = triggersResponse.data.result;

    //convert to an array of key value pairs (to allow sorting, wanting to show highest to lowest on graph)
    const triggerCountsArray = Object.entries(triggerCounts);

    //sort from highest to lowest
    triggerCountsArray.sort((a, b) => b[1] - a[1]);
    //set up empty arrays to hold the triggers and values (for graph js)
    const triggers = [];
    const triggerVals = [];

    //loop through and populate the arrays
    triggerCountsArray.forEach((trigger) => {
      //add the trigger name
      triggers.push(trigger[0]);
      //add the trigger value
      triggerVals.push(`${[trigger[1]]}`);
    });

    //get the max value to use for the maximum y axis on the chart
    const maxTriggerCount = Math.max(...triggerVals);

    //get a list of emotions and ids for the dropdown filter on the emotion chart
    const emotionEndpoint = `http://localhost:3001/emotions`;
    const emoRequest = await axios.get(emotionEndpoint, {
      validateStatus: (status) => {
        return status < 500;
      },
    });
    //store the result
    const emotions = emoRequest.data.result;

    //check if a user has made a selection on the dropdown (will be in the url query string)
    if (!emotion) {
      //if there is no emotion in the query string, default it to the first emotion from our emotions table
      emotion = Object.values(emotions)[0].emotion_id;
    }

    //now get specific emotion snapshot data by sending its id in the params of the api endpoint
    const emotionSnapshotEndpoint = `http://localhost:3001/snapshot/analytics/emotion/${emotion}`;
    const emotionSnapshotResponse = await axios.get(emotionSnapshotEndpoint, {
      validateStatus: (status) => {
        return status < 500;
      },
      headers: { userid: `${userid}` },
    });

    //store the result set
    const emotionResult = emotionSnapshotResponse.data.result;

    //create empty arrays to hold emotion date/time and ratings
    const emoDateTimes = [];
    const emoRatings = [];
    //get the name of the emotion (for the chart title)
    const emotionName =
      emotionResult.length > 0 ? emotionResult[0].emotion : null;

    //loop through each row and populate the arrays with data
    emotionResult.forEach((record) => {
      //format the date and time
      const dateTime = `${formatDatabaseDate(record.date)} ${record.time}`;
      emoDateTimes.push(dateTime);
      emoRatings.push(record.rating);
    });

    //render the analytics template with the data
    res.render("analytics", {
      dates,
      monthlyCounts,
      maxYAxisValueMonthly,
      weekdays,
      weekdaycounts,
      maxWeekdayValue,
      emotionLabels,
      emotionAverages,
      maxEmotionValue,
      triggers,
      triggerVals,
      maxTriggerCount,
      firstName,
      lastName,
      emotions,
      emotionSelected: emotion,
      emoDateTimes,
      emoRatings,
      emotionName,
    });
  } catch (err) {
    //API server error 500
    console.log(err);
  }
};

exports.getNotFound = (req, res) => {
  //render page not found
  res.status(404).send(`<h1>404: Page Not Found</h1> <img src="/images/Kevin_McCallister.webp" style="height: 400px">`);
};
