const cron = require('node-cron');
const { getLinkedUsers, getVacationsByUserId } = require('./database');
const { CONFIG } = require('./config');


async function dailyChatNotification() {
    let today = new Date();
    if(today.getDay() == 6 || today.getDay() == 0) return;

    let users = await getLinkedUsers();

    const messageData = {
        alias: "SEPE",
        text: "Pamiętaj o uzupełnieniu danych w SEPE",
        channel: "",
        attachments: [
        ]
    };


    for(let i = 0; i < users.length; i++) {
        let now = new Date().getTime();
        let vacations = await getVacationsByUserId(users[i].git_id);

        console.log(vacations);

        let foundVacations = false;
        for(let i = 0; i < vacations.length; i++) {
            let startDate = vacations[i].start;
            let endDate = vacations[i].end;
            if(now >= startDate && now <= endDate) {
                foundVacations = true;
                break;
            }
        }

        if(foundVacations) {
            continue;
        }


        messageData.channel = "@" + users[i].username;

        await fetch(CONFIG.CHAT_WEBHOOK, {
            method: "POST",
            body: JSON.stringify(messageData),

            headers: {
                "Content-Type": "application/json"
            }
        })

    }
}

function startDailyChatNotification(time) {
    // dailyChatNotification() // DEBUG
    const timeParts = time.split(':');
    if (timeParts.length !== 2 || isNaN(timeParts[0]) || isNaN(timeParts[1])) {
        throw new Error("Invalid time format. Please use 'HH:mm'.");
    }

    const hours = parseInt(timeParts[0], 10);
    const minutes = parseInt(timeParts[1], 10);

    cron.schedule(`${minutes} ${hours} * * *`, () => {
        dailyChatNotification();
    });

    console.log(`Daily chat notification scheduled for ${time} (HH:mm)`);
}


module.exports = {
    startDailyChatNotification,
    dailyChatNotification,
}