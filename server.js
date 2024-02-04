const dotenv = require('dotenv').config({ path: 'config.env' });
const app = require('./app');

const PORT = process.env.PORT || 3000;

//listen on the specified port
app.listen(PORT, (err) => {
    if (err) {
        throw err;
    }
    console.log(`Server listening on port ${PORT}`);
})