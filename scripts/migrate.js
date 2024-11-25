const e = require('express');
const mysql = require('mysql');
const { exit } = require('process');
const util = require('util');

const migrationDB = mysql.createConnection({
    host: process.env.MYSQL_ADDR,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DB + "-migration",
})
var migrationQuery = util.promisify(migrationDB.query).bind(migrationDB);


const db = mysql.createConnection({
    host: process.env.MYSQL_ADDR,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DB,
})

var resultQuery = util.promisify(db.query).bind(db);

var migrateProjects = [
    {
        "id": 1,
        "name": "example",
        "color": "#2121FF"
    },

    // add here project types used in old version of SEPE

]

migrationDB.connect();
db.connect();

var migrationData;

async function getMigrationData() {
    migrationData = await migrationQuery("SELECT * FROM calendars");
}



async function startMigration() {
    await getMigrationData();
    console.log("fetched migration data: " + migrationData.length + " rows");
    console.log("begin migration to db: " + process.env.MYSQL_DB + " [projects]");
    for(let i = 0; i < migrateProjects.length; i++) {
        await resultQuery("INSERT INTO project(`id`, `name`, `color`) VALUES (?, ?, ?)", [migrateProjects[i].id, migrateProjects[i].name, migrateProjects[i].color]);
    }

    console.log("begin migration to db: " + process.env.MYSQL_DB + " [events]");
    for(let i = 0; i < migrationData.length; i++) {
        let json = JSON.parse(migrationData[i].json);
        let user_id = migrationData[i].user;
        for(let j = 0; j < json.length; j++) {
            let description = json[j].text;
            let project = json[j].evType;
            let start = new Date(json[j].start_date).getTime();
            let end = new Date(json[j].end_date).getTime();

            if(project === '' || project === null || project === undefined) {
                project = 999;
            }

            await resultQuery("INSERT INTO calendar(`user_id`, `start`, `end`, `description`, `project`, `remote`, `vacation`, `vacation_type`) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", [user_id, start, end, description, project, 0, 0, null]);
        
        }
        console.log(i+1 + "/" + migrationData.length)
    }

    exit(0);
}

startMigration();
