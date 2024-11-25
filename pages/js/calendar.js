var calendar = new DayPilot.Calendar("dp");

calendar.timeFormat = "Clock24Hours"
calendar.businessBeginsHour = 0;
calendar.businessEndsHour = 24;
calendar.rowHeaderWidthAutoFitShrink = true;
calendar.rowHeaderWidthAutoFit = true;
calendar.heightSpec = "BusinessHoursNoScroll";

calendar.viewType = "Days"
calendar.days = 7;
calendar.hourWidth = 60;
calendar.cellDuration = 60;
calendar.startDate = getMonday(new Date());
calendar.headerDateFormat="dddd, dd.MM.yyyy"
calendar.locale="pl-pl"


const calendarBack = document.getElementById("calendar-back");
const calendarNext = document.getElementById("calendar-next");

function getMonday(date) {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is Sunday

    console.log(new Date(date.setDate(diff)), true);

    return new DayPilot.Date(new Date(date.setDate(diff)), true);
}

calendarBack.addEventListener("click", () => {
    calendar.startDate = calendar.startDate.addDays(-7);
    calendar.update();
    updateWorkTime();
})

calendarNext.addEventListener("click", () => {
    calendar.startDate = calendar.startDate.addDays(7);
    calendar.update();
    updateWorkTime();
});


const modalCreate = new bootstrap.Modal(document.getElementById("modalCreate"));
const modalCreateDescription = document.getElementById("create-description");
const modalCreateDate = document.getElementById("create-date");
const modalCreateTimeStart = document.getElementById("create-time-start");
const modalCreateTimeEnd = document.getElementById("create-time-end");
const modalCreatePostButton = document.getElementById("create-data");
const modalCreateProjectDiv = document.getElementById("create-project-div");
const modalCreateProject = document.getElementById("create-project-type");
const modalCreateRemote = document.getElementById("create-remote-work");
const modalCreateVacation = document.getElementById("create-vacation");
const modalCreateVacationDiv = document.getElementById("create-vacation-div");
const modalCreateVacationType = document.getElementById("create-vacation-type");
const modalCreateDateVacation = document.getElementById("create-date-vacation");

modalCreateVacationDiv.style.visibility = "hidden";
modalCreateVacationDiv.style.display = "none";

const modalUpdate = new bootstrap.Modal(document.getElementById("modalUpdate"));
const modalUpdateDescription = document.getElementById("update-description");
const modalUpdateDate = document.getElementById("update-date");
const modalUpdateTimeStart = document.getElementById("update-time-start");
const modalUpdateTimeEnd = document.getElementById("update-time-end");
const modalUpdatePostButton = document.getElementById("update-data");
const modalUpdateProject = document.getElementById("update-project-type");
const modalUpdateProjectDiv = document.getElementById("update-project-type-div");
const modalUpdateRemote = document.getElementById("update-remote-work");
const modalUpdateId = document.getElementById("update-id");
const modalUpdateVacation = document.getElementById("update-vacation");
const modalUpdateVacationDiv = document.getElementById("update-vacation-div");
const modalUpdateVacationType = document.getElementById("update-vacation-type");
const modalUpdateVacationDate = document.getElementById("update-vacation-date");

modalUpdateVacationDiv.style.visibility = "hidden";
modalUpdateVacationDiv.style.display = "none";

const modalUpdateTimeError = document.getElementById("time-alert");
const modalCreateTimeError = document.getElementById("time-alert-c");


modalCreateTimeError.style.visibility = "hidden";
modalUpdateTimeError.style.visibility = "hidden";

const modalDeletePostButton = document.getElementById("delete-data");

const workTime = document.getElementById("hour-counter");
const vacationTime = document.getElementById("vacation-counter");

const getColorById = (id) => {
    const item = projects.find(item => item.id === id);
    return item ? item.color : null;
};

const getProjectById = (id) => {
    const item = projects.find(item => item.id === id);
    return item ? item : null;
}

const getProjectByName = (name) => {
    const item = projects.find(item => item.name === name);
    return item ? item : null;
}

const updateWorkTime = () => {


    let sumMilliseconds = 0;
    var ev = calendar.events.list;

    var monthName = new Date(calendar.startDate).toLocaleString('pl-PL', { month: 'long'})

    if(ev === undefined) {
        workTime.innerHTML = `Czas pracy: <br> (${monthName} - ${calendar.startDate.getYear()}) <br> 0h 0m`
        return;

    }

    for (let i = 0; i < ev.length; i++) {
        let start = ev[i].start.getTime();
        let end = ev[i].end.getTime();

        if(new Date(start).getMonth() === calendar.startDate.getMonth() && new Date(start).getFullYear() === calendar.startDate.getYear() && ev[i].p_vacation == 0) {
            sumMilliseconds += end - start;
        }
    }
    
    let sumMinutes = Math.floor(sumMilliseconds / (1000 * 60));
    let sumHours = Math.floor(sumMinutes / 60);
    sumMinutes = sumMinutes % 60;


    sumHours += Math.floor(sumMinutes / 60);
    sumMinutes = sumMinutes % 60;
    sumMinutes = Math.abs(sumMinutes);

    workTime.innerHTML = `Czas pracy: <br> (${monthName} - ${calendar.startDate.getYear()}) <br>${sumHours}h ${sumMinutes}m`
}

for(let i = 0; i < dates.length; i++) {
    let start = new DayPilot.Date(new Date(dates[i].start), true);
    let end = new DayPilot.Date(new Date(dates[i].end), true);
    let id = dates[i].id;
    let description = dates[i].description;
    let project = dates[i].project;
    let remote = dates[i].remote;
    let vacation = dates[i].vacation;
    let color = getColorById(project);

    let e = new DayPilot.Event({
        start: start,
        end: end,
        id: id,
        text: description,
        fontColor: "white",
        backColor: color,
        barColor: remote ? "#b13535" : "#0d3091",
        p_project: project,
        p_remote: remote,
        p_vacation: vacation,
        p_oldStart: start.getTime(),
        p_oldEnd: end.getTime(),
    });
    calendar.events.add(e);
}

const suggestionsList = document.getElementById("suggestions-list");

async function showTodaysCommits() {
    let date = new Date(modalCreateDate.value);

    var request = await fetch("/api/v1/calendar/getCommits?timestamp=" + date.getTime());
    var commits = await request.json();
    
    suggestionsList.innerHTML = '';

    if (commits.length) {
        commits.forEach(commit => {
            const suggestionItem = document.createElement("li");
            suggestionItem.classList.add("dropdown-item");
            suggestionItem.classList.add("autocompletion-item");
            suggestionItem.textContent = commit.message.trim() || commit.title;
            suggestionItem.textContent += `\t[${commit.repository}]`
            suggestionsList.appendChild(suggestionItem);
      
            suggestionItem.addEventListener('click', () => {
                suggestionsList.classList.add("show");
                modalCreateDescription.value += commit.message;
            })
        });
    } else {

    }
}
modalCreateDescription.addEventListener("focus", async () => {await showTodaysCommits()});

const updateEventPosition = async (args) => {    

    let currentDate = {
        start: new Date(new DayPilot.Date(args.newStart, true)),
        end: new Date(new DayPilot.Date(args.newEnd, true))
    }

    let oldDate = {
        start: new Date(args.e.data.p_oldStart),
        end: new Date(args.e.data.p_oldEnd),
    }

    let start = currentDate.start.getTime();
    let end = currentDate.end.getTime();






    let events = calendar.events.list;

        
    let description = args.e.data.text;
    let project = args.e.data.p_project;
    let remote = args.e.data.p_remote;
    let vacation = args.e.data.p_vacation;
    let vacationType = args.e.data.p_vacationType;
    let id = args.e.data.id;

    let now = new Date();
    if( oldDate.start.getMonth() != now.getMonth() ||
        oldDate.end.getMonth() != now.getMonth()  ||

        oldDate.start.getFullYear() != now.getFullYear() ||
        oldDate.end.getFullYear() != now.getFullYear()
        || vacation == 1 || project == getProjectByName("URLOP_POTWIERDZONY").id || project == getProjectByName("URLOP_POTWIERDZONY").id
    ) {

        var e = calendar.events.find(Number(id));
        e.data.text = description;
        e.data.backColor = getColorById(Number(project));
        e.data.barColor = remote ? "#b13535" : "#0d3091";
        e.data.p_project = project;
        e.data.p_remote = remote;
        e.data.p_vacation = vacation;
        e.data.p_vacationType = vacationType;
        e.data.start = new DayPilot.Date(args.e.data.p_oldStart, true);
        e.data.end = new DayPilot.Date(args.e.data.p_oldEnd, true);
        calendar.events.update(e);
        return;
    }
    
    if( currentDate.start.getMonth() != now.getMonth() ||
        currentDate.end.getMonth() != now.getMonth()  ||

        currentDate.start.getFullYear() != now.getFullYear() ||
        currentDate.end.getFullYear() != now.getFullYear()) {

        var e = calendar.events.find(Number(id));
        e.data.text = description;
        e.data.backColor = getColorById(Number(project));
        e.data.barColor = remote ? "#b13535" : "#0d3091";
        e.data.p_project = project;
        e.data.p_remote = remote;
        e.data.p_vacation = vacation;
        e.data.p_vacationType = vacationType;
        e.data.start = new DayPilot.Date(args.e.data.p_oldStart, true);
        e.data.end = new DayPilot.Date(args.e.data.p_oldEnd, true);
        calendar.events.update(e);
        return;
    }

    for(let i = 0; i < events.length; i++) {
        if(events[i].id === id) {
            continue;
        }
    
        if(DayPilot.Util.overlaps(events[i].start, events[i].end, args.newStart, args.newEnd)) {                        
            var e = calendar.events.find(Number(id));
            e.data.text = description;
            e.data.backColor = getColorById(Number(project));
            e.data.barColor = remote ? "#b13535" : "#0d3091";
            e.data.p_project = project;
            e.data.p_remote = remote;
            e.data.p_vacation = vacation;
            e.data.p_vacationType = vacationType;
            e.data.start = new DayPilot.Date(args.e.data.p_oldStart, true);
            e.data.end = new DayPilot.Date(args.e.data.p_oldEnd, true);

            calendar.events.update(e);
            return;
        }
    }

    args.e.data.p_oldStart = new DayPilot.Date(args.newStart, true).getTime();
    args.e.data.p_oldEnd = new DayPilot.Date(args.newEnd, true).getTime();



    let request = await fetch("/api/v1/calendar/update", {
        headers: {
            "Content-Type": "application/json"
        },
        method: "POST",
        body: JSON.stringify({
            description: description,
            id: id,
            start: start,
            end: end,
            project: project,
            remote: remote,
            vacation: vacation,
            vacation_type: vacationType,
        })
    })

    updateWorkTime();
}

calendar.onEventMoved = updateEventPosition;
calendar.onEventResized = updateEventPosition;

modalUpdateVacation.addEventListener('click', () => {
    if(modalUpdateVacation.checked) {
        modalUpdateVacationDiv.style.visibility = "visible";
        modalUpdateVacationDiv.style.display = "block";

        modalUpdateProjectDiv.style.visibility = "hidden";
        modalUpdateProjectDiv.style.display = "none";

        modalUpdateDescription.disabled = true;
        modalUpdateProject.disabled = true;
        modalUpdateRemote.disabled = true;
        modalUpdateTimeStart.disabled = true;
        modalUpdateTimeEnd.disabled = true;
    } else {
        modalUpdateVacationDiv.style.visibility = "hidden";
        modalUpdateVacationDiv.style.display = "none";

        modalUpdateProjectDiv.style.visibility = "visible";
        modalUpdateProjectDiv.style.display = "block";
        modalUpdateDescription.disabled = false;
        modalUpdateProject.disabled = false;
        modalUpdateRemote.disabled = false;
        modalUpdateTimeStart.disabled = false;
        modalUpdateTimeEnd.disabled = false;
    }
})

modalCreateVacation.addEventListener('click', () => {
    if(modalCreateVacation.checked) {
        modalCreateVacationDiv.style.visibility = "visible";
        modalCreateVacationDiv.style.display = "block";
        modalCreateVacationType.disabled = false;

        modalCreateProjectDiv.style.visibility = "hidden";
        modalCreateProjectDiv.style.display = "none";
        modalCreateProject.disabled = true;
        
        modalCreateDescription.disabled = true;
        modalCreateRemote.disabled = true;
        modalCreateTimeStart.disabled = true;
        modalCreateTimeEnd.disabled = true;
    } else {
        modalCreateVacationDiv.style.visibility = "hidden";
        modalCreateVacationDiv.style.display = "none";
        modalCreateVacationType.disabled = true;

        modalCreateProjectDiv.style.visibility = "visible";
        modalCreateProjectDiv.style.display = "block";
        modalCreateProject.disabled = false;

        modalCreateDescription.disabled = false;
        modalCreateRemote.disabled = false;
        modalCreateTimeStart.disabled = false;
        modalCreateTimeEnd.disabled = false;
    }
})

calendar.onEventClicked = (args) => {

    var data = args.e.data;

    var dateStart = new Date(new DayPilot.Date(data.start, true));
    var dateEnd = new Date(new DayPilot.Date(data.end, true));
    var date = new Date(dateStart.getTime() - (dateStart.getTimezoneOffset() * 60 * 1000));
    date = date.toISOString();

    

    modalUpdateDate.value = date.split('T')[0];
    
    modalUpdateTimeStart.value = date.split('T')[1].substring(0, 5);
    modalUpdateId.value = data.id;

    date = new Date(dateEnd.getTime() - (dateEnd.getTimezoneOffset() * 60 * 1000));
    date = date.toISOString();
    modalUpdateTimeEnd.value = date.split('T')[1].substring(0, 5);


    let vacationDate = new Date(dateEnd.getTime() - (dateEnd.getTimezoneOffset() * 60 * 1000));
    vacationDate = vacationDate.toISOString();

    modalUpdateDescription.value = data.text;
    modalUpdateProject.value = data.p_project;
    modalUpdateRemote.checked = data.p_remote == 1;
    modalUpdateVacation.checked = data.p_vacation == 1;
    modalUpdateVacationDate.value = vacationDate.split('T')[0];

    if(data.p_vacation == 1) {
        modalUpdateVacationDiv.style.visibility = "visible";
        modalUpdateVacationDiv.style.display = "block";

        modalUpdateProjectDiv.style.visibility = "hidden";
        modalUpdateProjectDiv.style.display = "none";

        modalUpdateDescription.disabled = true;
        modalUpdateProject.disabled = true;
        modalUpdateRemote.disabled = true;
        modalUpdateTimeStart.disabled = true;
        modalUpdateTimeEnd.disabled = true;
    } else {
        modalUpdateVacationDiv.style.visibility = "hidden";
        modalUpdateVacationDiv.style.display = "none";


        modalUpdateProjectDiv.style.visibility = "visible";
        modalUpdateProjectDiv.style.display = "block";

        modalUpdateDescription.disabled = false;
        modalUpdateProject.disabled = false;
        modalUpdateRemote.disabled = false;
        modalUpdateTimeStart.disabled = false;
        modalUpdateTimeEnd.disabled = false;
    }

    modalUpdate.show();
}

calendar.onTimeRangeSelected = (args) => {

    calendar.clearSelection();

    var dateStart = new Date(new DayPilot.Date(args.start, true));
    var dateEnd = new Date(new DayPilot.Date(args.end, true));
    var date = new Date(dateStart.getTime() - (dateStart.getTimezoneOffset() * 60 * 1000));
    date = date.toISOString();

    

    modalCreateDate.value = date.split('T')[0];
    modalCreateDateVacation.value = date.split('T')[0];

    modalCreateTimeStart.value = date.split('T')[1].substring(0, 5);

    date = new Date(dateEnd.getTime() - (dateEnd.getTimezoneOffset() * 60 * 1000));
    date = date.toISOString();
    modalCreateTimeEnd.value = date.split('T')[1].substring(0, 5);



    let events = calendar.events.list;

    let now = new Date();
    if( dateStart.getMonth() != now.getMonth() ||
        dateEnd.getMonth() != now.getMonth()  ||
        dateStart.getFullYear() != now.getFullYear() ||
        dateEnd.getFullYear() != now.getFullYear()) {
            return;
    }


    if(events !== undefined) {
        for(let i = 0; i < events.length; i++) {
            if(DayPilot.Util.overlaps(events[i].start, events[i].end, args.start, args.end)) {            
                return;
            }
        }
    }







    modalCreateDescription.value = "";
    modalCreate.show();
}


modalCreatePostButton.addEventListener("click", async (v) => {
    let description = modalCreateDescription.value;
    let dateBase = new Date(modalCreateDate.value);
    let dateStart = new Date(dateBase.toISOString().split('T')[0] + "T" + modalCreateTimeStart.value + ":00.000");
    let dateEnd = new Date(dateBase.toISOString().split('T')[0] + "T" + modalCreateTimeEnd.value + ":00.000");
    let vacation = modalCreateVacation.checked ? 1 : 0;
    let vacationType = modalCreateVacationType.value;
    let project = modalCreateProject.value;
    let remote = modalCreateRemote.checked ? 1 : 0;



    let dpDateStart = new DayPilot.Date(dateStart, true);
    let dpDateEnd = new DayPilot.Date(dateEnd, true);

    let now = new Date();

    if(vacation == 0) {
        if( dateStart.getMonth() != now.getMonth() ||
        dateEnd.getMonth() != now.getMonth()  ||
        dateStart.getFullYear() != now.getFullYear() ||
        dateEnd.getFullYear() != now.getFullYear()) {
            modalCreateTimeError.innerHTML = "możesz dodawać wydarzenia tylko do obecnego miesiąca!";
            modalCreateTimeError.style.visibility = "visible";
            return;
        }
    }

    if(project == getProjectByName("URLOP_POTWIERDZONY").id) {
        modalCreateTimeError.innerHTML = "możesz zaakceptować sam sobie urlopu!";
        modalCreateTimeError.style.visibility = "visible";
        return;
    }

    if(vacation == 1 || project == getProjectByName("URLOP_NIEPOTWIERDZONY").id) {
        dateStart.setMinutes(0)
        dateStart.setHours(0);


        let vacationDateEnd = new Date(modalCreateDateVacation.value);
        dateEnd = vacationDateEnd;

        dateEnd.setHours(23)
        dateEnd.setMinutes(59);

        console.log(vacationDateEnd);

        dpDateStart = new DayPilot.Date(dateStart, true);
        dpDateEnd = new DayPilot.Date(dateEnd, true);
    
        let vacationName = vacations.find((v) => v.id === Number(vacationType));
        description = vacationName.name + ", Niezatwierdzony";
        project = getProjectByName("URLOP_NIEPOTWIERDZONY").id;
        vacation = 1;
        remote = 0;

        const daysBetween = Math.floor((dateEnd - dateStart) / (1000 * 60 * 60 * 24)) + 1;


        
        console.log(daysBetween);
        console.log(
            {
                "timespan": daysBetween,
                "available": vacationDays[0].days,
                "after": vacationDays[0].days-daysBetween,
            }
        );

        if(vacationDays[0].days-daysBetween < 0) {
            modalCreateTimeError.innerHTML = "nie masz aż tylu dni urlopu do dyspozycji!";
            modalCreateTimeError.style.visibility = "visible";
            return;
        } else {
            vacationDays[0].days -= daysBetween;
            vacationTime.innerHTML = "Wymiar urlopu: <br> " + vacationDays[0].days + " dni";
        }
    }

    if(description.length <= 0) {
        modalCreateTimeError.innerHTML = "opis nie może być pusty!";
        modalCreateTimeError.style.visibility = "visible";
        return;
    }




    let events = calendar.events.list;

    if(events !== undefined) {
        for(let i = 0; i < events.length; i++) {
            if(DayPilot.Util.overlaps(events[i].start, events[i].end, dpDateStart, dpDateEnd)) {            
                modalCreateTimeError.innerHTML = "Wydarzenia nie mogą się nakładać!";
                modalCreateTimeError.style.visibility = "visible";
                return;        
            }
        }
    }

    if(vacation == 0) {
        vacationType = null;
    }


    const out = {
        start: dateStart.getTime(),
        end: dateEnd.getTime(),
        description: description,
        project: project,
        remote: remote,
        vacation: vacation,
        vacation_type: vacationType,
    }

    console.log(out);


    if(vacation == 0) {
        if(dateStart.getTime() > dateEnd.getTime() ) {
            modalCreateTimeError.innerHTML = "czas początkowy musi być wcześniej niż końcowy!";
            modalCreateTimeError.style.visibility = "visible";
            return;
        }
    }

    var request = await fetch("/api/v1/calendar/create", {
        headers: {
            "Content-Type": "application/json"
        },
        method: "POST",
        body: JSON.stringify(out)
    })

    var response = await request.json();

    console.log(response);

    if(response.success == true) {
        let ds = new DayPilot.Date(dateStart, true);
        let de = new DayPilot.Date(dateEnd, true);
        let color = getColorById(Number(project));



        var e = new DayPilot.Event({
            start: ds,
            end: de,
            id: response.id, 
            text: description,
            fontColor: "white",
            backColor: color,
            barColor: remote ? "#b13535" : "#0d3091",
            p_project: project,
            P_remote: remote,
            p_vacation: vacation,
            p_vacationType: vacationType,
            p_oldStart: ds.getTime(),
            p_oldEnd: de.getTime(),
        });
    
        calendar.events.add(e);
        modalCreate.hide();
    }

    modalCreateTimeError.style.visibility = "hidden";

    updateWorkTime();
    
});


modalUpdatePostButton.addEventListener("click", async (v) => {
    let description = modalUpdateDescription.value;
    let dateBase = new Date(modalUpdateDate.value);
    let dateStart = new Date(dateBase.toISOString().split('T')[0] + "T" + modalUpdateTimeStart.value + ":00.000");
    let dateEnd = new Date(dateBase.toISOString().split('T')[0] + "T" + modalUpdateTimeEnd.value + ":00.000");
    let id = modalUpdateId.value;

        
    let project = modalUpdateProject.value;
    let remote = modalUpdateRemote.checked ? 1 : 0;
    let vacation = modalUpdateVacation?.checked ? 1 : 0;
    let vacationType = modalUpdateVacationType.value;

    let dpDateStart = new DayPilot.Date(dateStart, true);
    let dpDateEnd = new DayPilot.Date(dateEnd, true);
    
    let now = new Date();

    let e = calendar.events.find(Number(id));
    let oldDate = {
        start: new Date(e.data.p_oldStart),
        end: new Date(e.data.p_oldEnd),
    }

    if(!vacation) {
        if( oldDate.start.getMonth() != now.getMonth() ||
        oldDate.end.getMonth() != now.getMonth()  ||

        oldDate.start.getFullYear() != now.getFullYear() ||
        oldDate.end.getFullYear() != now.getFullYear()) {

            modalUpdateTimeError.innerHTML = "możesz aktualizować wydarzenia tylko z obecnego miesiąca";
            modalUpdateTimeError.style.visibility = "visible";
            return;
        }

        if( dateStart.getMonth() != now.getMonth() ||
            dateEnd.getMonth() != now.getMonth()  ||
            dateStart.getFullYear() != now.getFullYear() ||
            dateEnd.getFullYear() != now.getFullYear()) {
                modalUpdateTimeError.innerHTML = "możesz aktualizować wydarzenia tylko z obecnego miesiąca";
                modalUpdateTimeError.style.visibility = "visible";
                return;
        }

        vacationType = null;
    }

    if(e.data.p_project == getProjectByName("URLOP_POTWIERDZONY").id) {
        modalUpdateTimeError.innerHTML = "skontaktuj się z administratorem, nie można zmienić zatwierdzonego urlopu!";
        modalUpdateTimeError.style.visibility = "visible";
        return;
    }

    if(project == getProjectByName("URLOP_POTWIERDZONY").id) {
        modalCreateTimeError.innerHTML = "nie możesz zaakceptować sam sobie urlopu!";
        modalCreateTimeError.style.visibility = "visible";
        return;
    }

    if(vacation == 1 || project == getProjectByName("URLOP_NIEPOTWIERDZONY").id) {
        dateStart.setHours(0)
        dateStart.setMinutes(0);



        let vacationDateEnd = new Date(modalUpdateVacationDate.value);
        dateEnd = vacationDateEnd;

        dateEnd.setHours(23);
        dateEnd.setMinutes(59);

        dpDateStart = new DayPilot.Date(dateStart, true);
        dpDateEnd = new DayPilot.Date(dateEnd, true);

        let diffValue = Math.abs(Math.floor((oldDate.end - oldDate.start) / (1000 * 60 * 60 * 24)) + 1);

        const daysBetween = Math.floor((dateEnd - dateStart) / (1000 * 60 * 60 * 24)) + 1;

        console.log(daysBetween);
        console.log(
            {
                "timespan": daysBetween,
                "available": vacationDays[0].days,
                "after": vacationDays[0].days-daysBetween + diffValue,
                "diff": diffValue,
            }
        );

        if(vacationDays[0].days-daysBetween < 0) {
            modalUpdateTimeError.innerHTML = "nie masz aż tylu dni urlopu do dyspozycji!";
            modalUpdateTimeError.style.visibility = "visible";
            return;
        } else {
            vacationDays[0].days -= daysBetween;
            vacationDays[0].days += diffValue;
            vacationTime.innerHTML = "Wymiar urlopu: <br> " + vacationDays[0].days + " dni";
        }

        let vacationName = vacations.find((v) => v.id === Number(vacationType));
        description = vacationName.name + ", Niezatwierdzony";
        project = getProjectByName("URLOP_NIEPOTWIERDZONY").id;
        vacation = 1;
        remote = 0;
    }



    
    let events = calendar.events.list;
    for(let i = 0; i < events.length; i++) {
        if(events[i].id == id) {
            continue;
        }

        if(DayPilot.Util.overlaps(events[i].start, events[i].end, dpDateStart, dpDateEnd)) {            
            console.log("overlapped with (myid): " + id);
            console.log(events[i]);
            modalUpdateTimeError.innerHTML = "Wydarzenia nie mogą się nakładać!";
            modalUpdateTimeError.style.visibility = "visible";
            return;
        }
    }

    
    if(description.length === 0) {
        modalUpdateTimeError.innerHTML = "Opis nie może być pusty";
        modalUpdateTimeError.style.visibility = "visible";
        return;
    }

    if(dateStart.getTime() > dateEnd.getTime()) {
        modalCreateTimeError.innerHTML = "czas początkowy musi być wcześniej niż końcowy!";
        modalUpdateTimeError.style.visibility = "visible";
        return;
    }




    const out = {
        id: id,
        start: dateStart.getTime(),
        end: dateEnd.getTime(),
        description: description,
        project: project,
        remote: remote,
        vacation: vacation,
        vacation_type: vacationType,
    }

    var request = await fetch("/api/v1/calendar/update", {
        headers: {
            "Content-Type": "application/json"
        },
        method: "POST",
        body: JSON.stringify(out)
    })

    let color = getColorById(project);

    e.data.text = description;
    e.data.backColor = getColorById(Number(project));
    e.data.barColor = remote ? "#b13535" : "#0d3091";
    e.data.p_project = project;
    e.data.p_remote = remote;
    e.data.p_vacation = vacation;
    e.data.p_vacationType = vacationType;
    e.data.start = dpDateStart;
    e.data.end = dpDateEnd;
    e.data.p_oldStart = dpDateStart.getTime();
    e.data.p_oldEnd = dpDateEnd.getTime();


    calendar.events.update(e);

    modalUpdateTimeError.style.visibility = "hidden";
    modalUpdate.hide();

    updateWorkTime();
})

modalDeletePostButton.addEventListener("click", async (v) => {
    var id = modalUpdateId.value;

    var e = calendar.events.find(Number(id));


    let startDate = new Date(e.data.start);
    let endDate = new Date(e.data.end);

    let now = new Date();

    if(e.p_vacation == 0) {
        if( startDate.getMonth() != now.getMonth() ||
        endDate.getMonth() != now.getMonth()  ||
        startDate.getFullYear() != now.getFullYear() ||
        endDate.getFullYear() != now.getFullYear()) {
            return;
    }
    }





    var request = await fetch("/api/v1/calendar/delete", {
        headers: {
            "Content-Type": "application/json"
        },
        method: "POST",
        body: JSON.stringify({id: id})
    })

    let response = await request.text();

    if(response == "ok") {
        console.log(e);
        if(e.data.p_vacation == 1) {
            const daysBetween = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
            vacationDays[0].days += daysBetween;
            vacationTime.innerHTML = "Wymiar urlopu: <br> " + vacationDays[0].days + " dni";
        }

        calendar.events.remove(e);
        modalUpdate.hide(); 


    }

    updateWorkTime();
})


calendar.init();

document.addEventListener("DOMContentLoaded", function() {
    const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.setAttribute("data-bs-theme", isDarkMode ? "dark" : "light");
    calendar.theme = isDarkMode ? "inter_dark_theme" : null;
    calendar.update();
});

updateWorkTime();
window.scrollTo(0, screen.height/4);