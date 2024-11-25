const file = document.getElementById("formFile");
const tableDisplay = document.getElementById("table")
const mainViewButton = document.getElementById("returnButton");


const sheetName = "Attend. Logs";


var xmlFile = "";
var xmlJson = "";
var dateNames;


function removePolishLetters(text)
{
  var fromChar = [/ą/ig, /ę/ig, /ó/ig, /ś/ig, /ł/ig, /ż/ig, /ź/ig, /ć/ig, /ń/ig];
  var toChar = ['a', 'e', 'o', 's', 'l', 'z', 'z', 'c', 'n'];
  for ( var i in fromChar ) {
    text = text.replace(fromChar[i], toChar[i]);
  }

  return text.toString();
}

var workTimes = {
    date: undefined,
    begin: undefined,
    // user: {id, [day, workTimeString]}
    users: [

    ]
};

var calendarEvents = {

};

var workbook;

file.addEventListener('change', (e) => {
    var reader = new FileReader();
    reader.onload = function() {
        xmlFile = reader.result;

        workTimes = {
            date: undefined,
            begin: undefined,

            users: [

            ]
        }

        calendarEvents = {

        }
        loadEditor();
    }

    reader.readAsBinaryString(file.files[0]);
})

function loadWorkTimes() {
    workTimes.date = xmlJson[0].__EMPTY_1;

    let dates = xmlJson[0].__EMPTY_1.split(" ~ ");

    let beginDate = dates[0].split('.');
    let endDate = dates[1].split('.');


    workTimes.begin = new Date(`${beginDate[1]}.${beginDate[0]}.${beginDate[2]}`);
    workTimes.end = new Date(`${endDate[1]}.${endDate[0]}.${endDate[2]}`);

    workTimes.end.setHours(23);
    workTimes.end.setMinutes(59);



    dateNames = Object.entries(xmlJson[1]);
    // 0 - name
    // 1 - num

    console.log(JSON.stringify(xmlJson));

    for(let i = 1; i < xmlJson.length;) {

        
        let offset;
        let anyAttend;
 
        let userData;
        let userAttend;


        let warning = "";
        let warningDays = "";


        if (xmlJson[i]["Attend. Logs"] === "ID :") {
            offset = 2;
            userData = i;
            userAttend = i + 1;
            anyAttend = xmlJson[userAttend] && Object.keys(xmlJson[userAttend]).some(key => key.startsWith("__EMPTY_"));
        } else if (xmlJson[i + 1] && xmlJson[i + 1]["Attend. Logs"] === "ID :") {
            offset = 3;
            userData = i + 1;
            userAttend = i + 2;
            anyAttend = xmlJson[userAttend] && Object.keys(xmlJson[userAttend]).some(key => key.startsWith("__EMPTY_"));
        } else {
            i++;  // Skip unrecognized rows
            continue;
        }


        if(xmlJson[userData].__EMPTY_8 === "BARTLOMIEJ SKWA") {
            console.log({
                "i": i,
                "offset": offset,
                "userData": userData,
                "userAttend": userAttend,
            })
        }

        let user = {
            id: xmlJson[userData].__EMPTY_1,
            name: xmlJson[userData].__EMPTY_8,
            dept: xmlJson[userData].__EMPTY_16,
            warn: "",
        
            activity: [

            ],

            calendar: [

            ],

            summary: {
                activity: 0,
                calendar: 0
            }
        }

        if(anyAttend == false) {
            workTimes.users.push(user);
            i+=offset;
            continue;
        }

        for(let day = 0; day < dateNames.length; day++) {
            let dateStr = dateNames[day][0];
            if(xmlJson[userAttend][dateStr] === undefined) {
                continue;
            }

            let cardUsage = xmlJson[userAttend][dateStr];

            if(typeof cardUsage === 'number') {
                cardUsage = "";
            }

            cardUsage = cardUsage.split('\n');

            cardUsage = cardUsage.filter(element => element != "");


            if(cardUsage.length == 0) {
                continue;
            }

            let wrongUsage = false;
            if(cardUsage.length !== undefined && cardUsage.length % 2 !== 0 && cardUsage.length !== 0) {
                warning = "Nieodpowiednie użycie karty w dniach: ";
                warningDays += dateNames[day][1] + ", ";
                wrongUsage = true;
            }


            user.activity.push({
                "day": dateNames[day][1],
                "usage": cardUsage,
                "wrongUsage":  wrongUsage,
            })

        }

        warningDays = warningDays.replace(/, +$/, '');


        if(warning != "") {
            user.warn = warning + warningDays;
        }
        
        workTimes.users.push(user);
        i+=offset;
    }


}

async function loadEvents() {

    let input = {
        from: workTimes.begin.getTime(),
        to: workTimes.end.getTime(),
    }

    input = JSON.stringify(input);

    let request = await fetch("/api/v1/xlsx/getEventsByMonth", {
        method: "POST",
        body: input,

        headers: {
            "Content-Type": "application/json"
        }
    })


    calendarEvents = await request.json();



    for (let i = 0; i < workTimes.users.length; i++) {
        workTimes.users[i].name = removePolishLetters(workTimes.users[i].name).toUpperCase();
        for (let j = 0; j < calendarEvents.length; j++) {
            calendarEvents[j].fullname = removePolishLetters(calendarEvents[j].fullname).toUpperCase();

            if (calendarEvents[j].fullname.includes(workTimes.users[i].name)) {
                workTimes.users[i].calendar.push(calendarEvents[j]);
            }
        }
    }
    


}

function loadUserView(id) {
    tableDisplay.innerHTML = `
        <thead>
            <th scope="col" class="text-center">imię i nazwisko</th>
            <th scope="col" class="text-center">dzień</th>
            <th scope="col" class="text-center">czas pracy (karta)</th>
            <th scope="col" class="text-center">czas pracy (SEPE)</th>
            <th scope="col" class="text-center">typ pracy (SEPE)</th>
            <th scope="col" class="text-center">UWAGA</th>
        </thead>
    `

    let user = workTimes.users[id];
    for(let i = 0; i < dateNames.length; i++) {
        let sumDayCalendar = 0;
        let sumDayActivity = 0;
        let isRemote = false;



        for(let j = 0; j < user.calendar.length; j++) {
            let calendar = user.calendar[j]
            let day = new Date(calendar.start).getDate();

            if(day === dateNames[i][1]) {
                sumDayCalendar += calendar.end - calendar.start;
                console.log(calendar.remote);
                if(calendar.remote === 1) {
                    isRemote = true;
                }
            }
        }

        for(let j = 0; j < user.activity.length; j++) {
            var activity = user.activity[j];
            var day = activity.day;
            var warn = "";


            if(day === dateNames[i][1]) {
                let times = activity.usage;
                let countTo = times.length;
    
                if(countTo % 2 !== 0) {
                    countTo--;
                    warn = "Nieodpowiednie użycie karty"
                }
    
                for(let time = 0; time < countTo; time += 2) {
                    let start = new Date("01/01/1970 " + times[time]);
                    let end = new Date("01/01/1970 " + times[time+1]);
    
                    sumDayActivity += end.getTime() - start.getTime();
                }
            }
        }

        let calendarMinutes = sumDayCalendar / 1000 / 60;
        let activityMinutes = sumDayActivity / 1000 / 60;

        let calendarHours = Math.floor(calendarMinutes / 60);            
        let activityHours = Math.floor(activityMinutes / 60);  
        
        calendarMinutes -= calendarHours * 60;
        activityMinutes -= activityHours * 60;

        if(warn === undefined || warn === "undefined") {
            warn = "";
        }

        let sepeBadTiming;

        if(sumDayActivity < sumDayCalendar) {
            sepeBadTiming = 'style="background-color: #FF000035"'
        } else {
            sepeBadTiming = "";
        }



        if(activityMinutes == calendarMinutes && calendarHours == activityHours) {
            sepeBadTiming = "";
        }


        if(isRemote) {
            sepeBadTiming = "";
            isRemote = "praca zdalna/wyjazd";
        } else {
            isRemote = "praca w firmie";
        }

        if(calendarHours == 0 && calendarMinutes == 0) {
            isRemote = "Brak informacji";
        }


        tableDisplay.innerHTML += `
        <tr>
            <td class="align-middle text-center">${user.name}</td>
            <th scope="row" class="align-middle text-center">${dateNames[i][1]}</th>
            <td class="align-middle text-center">${activityHours}h ${activityMinutes}min</td>
            <td class="align-middle text-center" ${sepeBadTiming}>${calendarHours}h ${calendarMinutes}min</td>
            <td class="align-middle text-center">${isRemote}</td>
            <td class="align-middle text-center">${warn}</td>

        
        </tr>`
    }


    mainViewButton.style.display = "block";
}

function loadMainView() {
    tableDisplay.innerHTML = `
            <thead>
                <th scope="col" class="text-center">#</th>
                <th scope="col" class="text-center">imię i nazwisko</th>
                <th scope="col" class="text-center">czas pracy (karta)</th>
                <th scope="col" class="text-center">czas pracy (SEPE)</th>
                <th scope="col" class="text-center">UWAGA</th>
                <th scope="col" class="text-center">OSIĄGNIĘCIA</th>
            </thead>
        `; 
        

        let leastWorkingWorker = Infinity;
        let leastWorkingWorkerId = Infinity;
        let mostWorkingWorker = -1;
        let mostWorkingWorkerId = -1;
        let wrongCardUsages = [];


        for (let i = 0; i < workTimes.users.length; i++) {
            let user = workTimes.users[i];
        
            let calendarHours = user.summary.calendar / 1000;
            let activityHours = user.summary.activity / 1000;
        
            let largestWorkingTime = Math.max(calendarHours, activityHours);
        
            if(largestWorkingTime === 0) {
                continue;
            }

            if (largestWorkingTime > mostWorkingWorker) {
                mostWorkingWorker = largestWorkingTime;
                mostWorkingWorkerId = i;
            }
            if (largestWorkingTime < leastWorkingWorker) {
                leastWorkingWorker = largestWorkingTime;
                leastWorkingWorkerId = i;
            }
        
            let activityErrSum = user.activity.reduce((count, act) => count + (act.wrongUsage ? 1 : 0), 0);
            wrongCardUsages.push({ id: i, errors: activityErrSum });
        }


        console.log(wrongCardUsages);
        wrongCardUsages.sort((a, b) => b.errors - a.errors);
        const top3WrongCardUsages = wrongCardUsages.slice(0, 3);

        console.log(top3WrongCardUsages)


        for(let i = 0; i < workTimes.users.length; i++) {
            let sumCalendarHours = workTimes.users[i].summary.calendar / 1000;
            let sumActivityHours = workTimes.users[i].summary.activity / 1000;

            let sumRemoteCalendar = workTimes.users[i].summary.remoteTime / 1000;

            let calendarMinutes = sumCalendarHours / 60;
            let activityMinutes = sumActivityHours / 60;

            let calendarHours = Math.floor(calendarMinutes / 60);            
            let activityHours = Math.floor(activityMinutes / 60);  
            
            calendarMinutes -= calendarHours * 60;
            activityMinutes -= activityHours * 60;
        
            let sepeBadTiming = sumCalendarHours > (sumActivityHours - sumRemoteCalendar);
        
            if(sepeBadTiming) {
                sepeBadTiming = 'style="background-color: #FF000035"'
            } else {   
                sepeBadTiming = "";
            }

            let awards = "";
            
            if(mostWorkingWorkerId === i) {
                awards += "💪"
            }

            if(leastWorkingWorkerId === i) {
                awards += "🦥"
            }

            if(top3WrongCardUsages[0].id === i) {
                awards += "🥇";
            }


            if(top3WrongCardUsages[1].id === i) {
                awards += "🥈";
            }

            
            if(top3WrongCardUsages[2].id === i) {
                awards += "🥉";
            }
            tableDisplay.innerHTML += `
                <tr data-id="${i}" class="show-user">
                    <th scope="row" class="align-middle text-center">${workTimes.users[i].id}</th>
                    <td class="align-middle text-center">${workTimes.users[i].name}</td>
                    <td class="align-middle text-center">${activityHours}h ${activityMinutes}min</td>
                    <td class="align-middle text-center" ${sepeBadTiming}>${calendarHours}h ${calendarMinutes}min</td>
                    <th class="align-middle text-center">${workTimes.users[i].warn}</th>
                    <td class="align-middle text-center" style="font-size: 20px">${awards}</td>
                </tr>
            `
        }

        let userButtons = document.getElementsByClassName("show-user");
        for(let b = 0; b < userButtons.length; b++) {
            userButtons[b].addEventListener('click', (e) => {
                let id = e.currentTarget.getAttribute("data-id");
                loadUserView(id);
            })
        }
}

mainViewButton.addEventListener('click', () => {
    mainViewButton.style.display = "none";
    loadMainView();
}) 

async function loadEditor() {
    workbook = XLSX.read(xmlFile, {type: "binary"});

    var XL_row_object = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
    var rowTable = XLSX.utils.sheet_to_html(workbook.Sheets[sheetName]);

    xmlJson = XL_row_object;

    loadWorkTimes();
    await loadEvents();
    for(let i = 0; i < workTimes.users.length; i++) {
        let sumCalendar = 0;
        let sumActivity = 0;
        let sumRemote = 0;
        let isRemote = false;
        for(let j = 0; j < workTimes.users[i].calendar.length; j++) {
            let calendar = workTimes.users[i].calendar[j];
            sumCalendar += calendar.end - calendar.start;

            if(calendar.remote === 1) {
                isRemote = true;
                sumRemote += calendar.end - calendar.start;
            }
        }


        for(let j = 0; j < workTimes.users[i].activity.length; j++) {
            let activity = workTimes.users[i].activity[j];
            let times = activity.usage;

            let countTo = times.length;

            if(countTo % 2 !== 0) {
                countTo--;
            }

            for(let time = 0; time < countTo; time += 2) {
                let start = new Date("01/01/1970 " + times[time]);
                let end = new Date("01/01/1970 " + times[time+1]);

                sumActivity += end.getTime() - start.getTime();
            }
        }
        
        workTimes.users[i].summary.calendar = sumCalendar;
        workTimes.users[i].summary.activity = sumActivity;
        workTimes.users[i].summary.remoteTime = sumRemote;
        workTimes.users[i].summary.remote = isRemote;
    }




    loadMainView();
}