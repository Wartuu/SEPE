const express = require('express');
const cookieParser = require("cookie-parser");

const { CONFIG } = require('./config');
const { getUsers, getUserRepositories, getUserTodayCommits, getChatUsers, getChatUserByEmail } = require('./utils');
const { startDailyChatNotification, dailyChatNotification } = require('./events');
const app = express();

// express configuration
app.use(express.static(CONFIG.PAGES));
app.use(cookieParser());
app.use(express.json());
app.set('view engine', 'ejs');

// routes [API]
require('./api/oauth')(app);
require('./api/calendar')(app);
require('./api/project')(app);
require('./api/report')(app);
require('./api/xlsx')(app);

// routes [views]
require('./views/calendar')(app);
require('./views/project')(app);
require('./views/login')(app);
require('./views/xlsx')(app);

startDailyChatNotification('15:00');

// app.get('/test', async (req, res) => {
//     await dailyChatNotification();
// })

app.get('*', function(req, res) {
    res.redirect("/");
})

app.listen(CONFIG.PORT, () => {
    console.log("listening at http://127.0.0.1:" + CONFIG.PORT);
})

