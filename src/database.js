const mysql = require('mysql');
const util = require('util');

const db = mysql.createConnection({
    host: process.env.MYSQL_ADDR,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DB,
    charset: 'utf8mb4', // for emoji support,
})

db.connect();

var resultQuery = util.promisify(db.query).bind(db);


db.query('SELECT 1 + 1 AS solution', (err, rows, fields) => {  
    console.log('connected to database!')
})

async function getVacationTypes() {
    var out = await resultQuery("SELECT id, name FROM vacation");
    return out;
}

async function getAllVacations() {

    var now = new Date().getTime();
    var out = await resultQuery("SELECT id, user_id, start, end, description, project, remote, vacation, vacation_type FROM calendar WHERE vacation = 1 AND end > ?", [now]);
    return out;
}

async function getVacationsByUserId(id) {
    var now = new Date().getTime();
    var out = await resultQuery("SELECT id, user_id, start, end, description, project, remote, vacation, vacation_type FROM calendar WHERE vacation = 1 AND end > ? AND user_id=?", [now, id]);
    return out;
}

async function setVacationConfirmation(id, confirmation, name) {
    let projects = await getProjectTypes();
    let vacations = await getVacationTypes();

    let event = await getEventById(id);

    let vacation_confirmed = projects.find(item => item.name === "URLOP_POTWIERDZONY").id;
    let vacation_toConfirm = projects.find(item => item.name === "URLOP_NIEPOTWIERDZONY").id;

    let vacation;
    let description;

    console.log(event);

    console.log(vacations);

    let vacationName = vacations.find((v) => v.id == event[0].vacation_type);

    console.log(vacationName);

    if(confirmation === true) {
        vacation = vacation_confirmed;
        description = vacationName.name + ", Zatwierdzony (" + name + ")";
        
    } else {
        description = vacationName.name + ", Niezatwierdzony";
        vacation = vacation_toConfirm;
    }
    await resultQuery("UPDATE calendar SET project=?, description=? WHERE id=?", [vacation, description, id]);
    return;
}

async function removeVacation(id) {
    try {
        await resultQuery("DELETE FROM calendar WHERE vacation=1 AND id=?", [id])
    } catch(error) {
        console.log(error)
        return false;
    }
}

async function getCalendarDates(id) {
    var out = await resultQuery("SELECT id, start, end, description, project, remote, vacation, vacation_type FROM calendar WHERE user_id = ?", [id]);
    return out;
}

async function getAllCalendarDates() {
    var out = await resultQuery("SELECT * FROM calendar");
    return out;
}


async function getUserCalendarDatesByDate(user_id, start, end) {
    try {
        var out = await resultQuery("SELECT id, user_id, start, end, description, project, remote FROM calendar WHERE user_id = ? AND start >= ? AND end <= ? AND vacation = 0", [user_id, start, end]);
        return out;
    } catch (Error) {
        console.log(Error);
    }
}

async function getEventById(id) {
    try {
        var out = await resultQuery("SELECT * FROM calendar WHERE id=?", [id]);
        return out;
    } catch (Error) {
        console.log(Error);
    }
}

async function getAllCalendarDatesByDate(start, end) {
    try {
        var out = await resultQuery("SELECT id, user_id, start, end, description, project, remote FROM calendar WHERE start >= ? AND end <= ? AND vacation = 0", [start, end]);
        return out;
    } catch (Error) {
        console.log(Error);
    }
}

async function updateCalendarEvent(start, end, description, project, remote, vacation, vacationType, id, user_id) {

    if(Number(vacation) == 1) {
        let projects = await getProjectTypes();
        let vacations = await getVacationTypes();

        description = vacations.find((v) => v.id == vacationType).name + ", Niezatwierdzony";
        project = projects.find((project) => project.name === "URLOP_NIEPOTWIERDZONY").id;
    }

    await resultQuery("UPDATE calendar SET start=?, end=?, description=?, project=?, remote=?, vacation=?, vacation_type=? WHERE id=? AND user_id=?", [start, end, description, project, remote, vacation, vacationType, id, user_id]);
}

async function createCalendarEvent(user_id, start, end, description, project, remote, vacation, vacationType) {
    try {
        if(Number(vacation) == 1) {
            let projects = await getProjectTypes();
            let vacations = await getVacationTypes();

            description = vacations.find((v) => v.id == vacationType).name + ", Niezatwierdzony";
            project = projects.find((project) => project.name === "URLOP_NIEPOTWIERDZONY").id;
        
        }

        const result = await resultQuery("INSERT INTO calendar(`user_id`, `start`, `end`, `description`, `project`, `remote`, `vacation`, `vacation_type`) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", [user_id, start, end, description, project, remote, vacation, vacationType]);
        return {
            success: true,
            id: result.insertId
        };
    } catch (Error) {
        return {
            success: false,
            id: 0,
        }
    }

}

async function removeCalendarEvent(id, user_id) {
    await resultQuery("DELETE FROM calendar WHERE id=? AND user_id=?", [id, user_id]);
}

async function getProjectTypes() {
    var out = await resultQuery("SELECT * FROM project ORDER BY id DESC");
    return out;
}

async function updateProjectType(id, name, color) {
    await resultQuery("UPDATE project SET name=?, color=? WHERE id=?", [name, color, id]);
}

async function createProjectType(name, color) {
    const result = await resultQuery("INSERT INTO project(`name`, `color`) VALUES (?, ?)", [name, color]);
    return result.insertId;
}

async function deleteProjectType(id) {
    try {
        await resultQuery("DELETE FROM project WHERE id=?", [id]);
        return true;
    } catch (error) {
        return false;
    }
}

async function getChatUserByGit(id) {
    try {
        const result = await resultQuery("SELECT git_id, chat_id, email, username FROM chat_users WHERE git_id = ?", [id]);
        return result;
    } catch(error) {
        console.log(error);
    }
}

async function getLinkedUsers() {
    try {
        const result = await resultQuery("SELECT git_id, chat_id, email, username FROM chat_users");
        return result;
    } catch(error) {
        console.log(error);
    }
}

async function addChatUser(gitId, chatId, email, username) {
    try {
        await resultQuery("INSERT INTO chat_users(`git_id`, `chat_id`, `email`, `username`) VALUES (?, ?, ?, ?)", [gitId, chatId, email, username]);
        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
}

async function updateChatUser(gitId, chatId, email, username) {
    try {
        await resultQuery("UPDATE chat_users SET chat_id=?, email=?, username=? WHERE git_id=?", [chatId, email, username, gitId]);
    } catch (error) {
        console.log(error);
        return false;
    }
}

async function getUserEmoji(user_id) {
    try {
        const result = await resultQuery("SELECT emoji FROM emoji WHERE user_id=?", [user_id]);
        return result;
    } catch (error) {
        console.log(error);
        return false;
    }
}

async function getVacationDaysByUserId(user_id) {
    try {
        const result = await resultQuery("SELECT user_id, days FROM vacation_counter WHERE user_id=?", [user_id]);
        return result;
    } catch (error) {
        console.log(error);
        return undefined;
    }
}

async function getAllVacationDays() {
    try {
        const result = await resultQuery("SELECT id, user_id, days FROM vacation_counter");
        return result;
    } catch (error) {
        console.log(error);
        return undefined;
    }
    
}

async function setVacationDays(id, time) {
    try {
        await resultQuery("UPDATE vacation_counter SET days=? WHERE user_id=?", [time, id]);
        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
}

async function createVacationDays(user_id, time) {
    try {
        await resultQuery("INSERT INTO vacation_counter(`user_id`, `days`) VALUES (?, ?)", [user_id, time]);
        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
}

module.exports = {
    db,
    getVacationTypes,
    getAllVacations,
    getVacationsByUserId,
    setVacationConfirmation,
    getCalendarDates,
    getAllCalendarDates,
    getEventById,
    getUserCalendarDatesByDate,
    getAllCalendarDatesByDate,
    updateCalendarEvent,
    createCalendarEvent,
    removeCalendarEvent,
    removeVacation,

    getProjectTypes,
    updateProjectType,
    createProjectType,
    deleteProjectType,

    getChatUserByGit,
    getLinkedUsers,
    addChatUser,
    updateChatUser,
    getUserEmoji,

    getVacationDaysByUserId,
    getAllVacationDays,
    setVacationDays,
    createVacationDays,
}