//Function to get the average of an array of numbers, average is returned to 1 decimal place
function average(numbers) {
  let total = 0;
  let count = 0;
  numbers.forEach((number) => {
    total += number;
    count++;
  });
  return (total / count).toFixed(1);
}

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
  //check if name is within the allowed range (2-50) and doesnt contain any special characters or numbers

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
  snapshots.forEach((snapshot) => {
    let date = snapshot.date;
    if (date == currentDate) {
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

module.exports = {
  average,
  validatePassword,
  validateEmail,
  validateName,
  getCurrentDate,
  getCurrentTime,
  formatDatabaseDate,
  countTodaysSnapshots,
  todaysSnapshotMessage,
};
