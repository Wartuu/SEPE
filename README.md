# Sepe V2

## .env variables

- PORT (string)
- PAGES (string, use "pages")
- PERSONAL_TOKEN (GITLAB personal token)
- APP_SECRET (GITLAB application secret)
- APP_ID (GITLAB application id)
- LOGIN_DOMAIN (url for gitlab app redirect, example: "http://127.0.0.1:8080/api/v1/oauth")
- CHAT_TOKEN (Rocket.chat token)
- CHAT_USERID (Rocket.chat userid)
- CHAT_SENDTIME (Time for sending the message, example: "15:00")
- CHAT_WEBHOOK (Rocket.chat webhook url)
- GITLAB_URL (gitlab custom url, example: "https://git.mythrium.xyz")
- ADMIN_GROUP_ID (id of admin group in gitlab)

## scripts

- migrate.js
  takes the old version of table (SEPE V1) and migrates all data
  to new db layout!

## language

- currently only Polish language is supported

## licensing

- project is licensed under [MIT License](LICENSE)
