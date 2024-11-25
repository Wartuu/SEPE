const PORT = process.env.PORT;
const PAGES = process.env.PAGES;
const APP_SECRET = process.env.APP_SECRET;
const APP_ID = process.env.APP_ID;

const CONFIG = {
    PORT: process.env.PORT,
    PAGES: process.env.PAGES,
    APP_SECRET: process.env.APP_SECRET,
    CHAT_TOKEN: process.env.CHAT_TOKEN,
    CHAT_USERID: process.env.CHAT_USERID,
    CHAT_WEBHOOK: process.env.CHAT_WEBHOOK,
    APP_ID: process.env.APP_ID,
    LOGIN_DOMAIN: process.env.LOGIN_DOMAIN,
    PERSONAL_TOKEN: process.env.PERSONAL_TOKEN,
    GITLAB_URL: process.env.GITLAB_URL,

    host: process.env.MYSQL_ADDR,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DB,
}

module.exports = {
    CONFIG
}