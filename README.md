## MoodBuzz Emotion Recording Web App
### Queens University Belfast Web Project CSC7084

This project has been developed to satisfy the requirements of the web development module at QUB.
The assignement involved building a web app that allows users to register, login and record/track their emotions over time.
Users must be able to edit aspects of the snapshots, be able to view snapshots and have some sort of analytics/graphs.

The app uses HTML, CSS, Javascript with some bootstrap and custom CSS for the front end.
For the back end, we are using Node.js, express and mysql.

The web app has been designed to be easily expanded to add new emotions and contextual triggers.
None of these have been hardcoded, all of these form items are rendered from the database.

We have not built out a UI/Form to insert new emotions or triggers as it was not in the scope of the assignment however it would be easy to expand on this.
Currently to add new emotions or contextual trigger options, you can manually create a record in the database and they will be rendered on the forms and tables.