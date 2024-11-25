const { default: db, createCalendarEvent, updateCalendarEvent, removeCalendarEvent, getProjectTypes, setVacationConfirmation, getEventById, setVacationDays, getVacationDaysByUserId, removeVacation } = require('../database');
const {isAdmin, verifyUser, getUserCommitsByDate} = require('../utils');

module.exports = (app) => {
    app.post("/api/v1/calendar/update", async (req, res) => {
        var user;
        
        if(!req.cookies.auth) {
            return res.status(401).redirect('/login');
        }
    
        user = await verifyUser(req.cookies.auth);
    
    
        if(user.message !== undefined || user.error !== undefined) {
            return res.status(401).redirect('/login')        
        }
    
        var body = req.body;
        console.log(body);
        
        if(body.vacation == true || body.vacation == 1) {
            if(body.start > body.end) {
                console.log("invalid data sent (start>end)");
                return res.send("fail");
            }
        }
    
        if(body.description.length === 0) {
            console.log("invalid description! (len: 0)");
            return res.send("fail");
        }

        
        let projects = await getProjectTypes();

        let vacation_confirmed = projects.find(item => item.name === "URLOP_POTWIERDZONY");
        let vacation_toConfirm = projects.find(item => item.name === "URLOP_NIEPOTWIERDZONY")

        if(body.project === vacation_confirmed.id || (body.vacation == true && body.project != vacation_toConfirm.id)) {
            console.log("invalid project");
            return res.send(JSON.stringify({
                status: false,
                id: 0
            }));
        }

        let event = await getEventById(req.body.id);
        
        if(event.length) {
            event = event[0];
        } 

        console.log(event.project);
        if(event.project === vacation_confirmed.id) {
            return res.send(JSON.stringify({
                status: false,
                id: 0
            }));
        }



        if(body.vacation == true) {
            console.log(user.id);
            let days = await getVacationDaysByUserId(user.id);

            if(days.length !== undefined && days.length <= 0) {
                return res.send({
                    status: false,
                    id: 0
                })
            }
            let oldPosition = await getEventById(body.id);

            if(oldPosition.length !== undefined && oldPosition.length !== 0) {
                oldPosition = oldPosition[0];
            }
            
            let diffValue = Math.abs(Math.floor((oldPosition.start - oldPosition.end) / (1000 * 60 * 60 * 24)));
            let duration = Math.abs(Math.floor((body.start - body.end) / (1000 * 60 * 60 * 24)));



            console.log("-----------")
            console.log(duration);
            console.log(diffValue);

            let afterModifications = days[0].days - duration + diffValue;

            if(afterModifications < 0) {
                return res.send(JSON.stringify({
                    status: false,
                    id: 0
                }))

            }

            await setVacationDays(user.id, afterModifications);
        }
    
        await updateCalendarEvent(body.start, body.end, body.description, body.project, body.remote, body.vacation, body.vacation_type, body.id, user.id);
        res.send("ok")
    })
    
    app.post("/api/v1/calendar/create", async (req, res) => {
        var user;
        
        if(!req.cookies.auth) {
            return res.status(401).redirect('/login');
        }
    
        user = await verifyUser(req.cookies.auth);
    
    
        if(user.message !== undefined || user.error !== undefined) {
            return res.status(401).redirect('/login')        
        }
    

        var body = req.body;

        
        if(body.vacation == true || body.vacation == 1) {
            if(body.start > body.end) {
                console.log("invalid data sent (start>end)");
                return res.send(JSON.stringify({
                    status: false,
                    id: 0
                }));
            }
        }


        let projects = await getProjectTypes();

        let vacation_confirmed = projects.find(item => item.name === "URLOP_POTWIERDZONY");
        let vacation_toConfirm = projects.find(item => item.name === "URLOP_NIEPOTWIERDZONY")


        if(body.project === vacation_confirmed.id || (body.vacation == true && body.project != vacation_toConfirm.id)) {
            console.log("invalid project");
            return res.send(JSON.stringify({
                status: false,
                id: 0
            }));
        }


        if(body.vacation == true || body.vacation == 1) {
            let days = await getVacationDaysByUserId(user.id);

            if(days.length !== undefined && days.length <= 0) {
                res.send({
                    status: false,
                    id: 0
                })
            }

            let duration = Math.abs(Math.floor((body.start - body.end) / (1000 * 60 * 60 * 24)));

            let afterModifications = days[0].days - duration;

            if(afterModifications < 0) {
                return res.send(JSON.stringify({
                    status: false,
                    id: 0
                }))

            }

            await setVacationDays(user.id, afterModifications);

        }
        
        const out = await createCalendarEvent(user.id, body.start, body.end, body.description, body.project, body.remote, body.vacation, body.vacation_type);
        res.send(JSON.stringify(out));
    });
    
    app.post("/api/v1/calendar/delete", async (req, res) => {
        var user;
        
        
        
        if(!req.cookies.auth) {
            return res.status(401).redirect('/login');
        }
    
        user = await verifyUser(req.cookies.auth);
    
    
        if(user.message !== undefined || user.error !== undefined) {
            return res.status(401).redirect('/login')        
        }

        let projects = await getProjectTypes();
        let vacation_confirmed = projects.find(item => item.name === "URLOP_POTWIERDZONY");

        let event = await getEventById(req.body.id);
        event = event[0];
        console.log(event.project);
        if(event.project === vacation_confirmed.id) {
            return res.send("fail");
        }

        if(event.vacation === true || event.vacation === 1) {
            let days = await getVacationDaysByUserId(user.id);

            if(days.length !== undefined && days.length <= 0) {
                res.send({
                    status: false,
                    id: 0
                })
            }

            let duration = Math.abs(Math.floor((event.start - event.end) / (1000 * 60 * 60 * 24)));

            console.log(days);
            console.log(duration);

            let afterModifications = days[0].days + duration;

            if(afterModifications < 0) {
                return res.send(JSON.stringify({
                    status: false,
                    id: 0
                }))
            }

            await setVacationDays(user.id, afterModifications);
        }
    
        await removeCalendarEvent(req.body.id, user.id);
    
        res.send("ok");
    });

    app.get("/api/v1/calendar/getCommits", async (req, res) => {
        var user;
        
        if(!req.cookies.auth) {
            return res.status(401).redirect('/login');
        }

        user = await verifyUser(req.cookies.auth);    

        if(user.message !== undefined || user.error !== undefined) {
            return res.status(401).redirect('/login')        
        }
        
        
        var timestamp = req.query.timestamp;

        var commits = await getUserCommitsByDate(user.id, Number(timestamp));

        console.log(commits);

        res.send(JSON.stringify(commits));
    });

    app.post("/api/v1/calendar/vacation/setConfirmation", async (req, res) => {
        var user;

        if(!req.cookies.auth) {
            return res.status(401).redirect('/login');
        }
    
        user = await verifyUser(req.cookies.auth);
    
    
        if(user.message !== undefined || user.error !== undefined) {
            return res.status(401).redirect('/login')        
        }

        if(!isAdmin(user)) {
            return res.status(401).redirect('/login')        
        }
        

        await setVacationConfirmation(req.body.id, req.body.confirmation, user.name);
        res.send("ok");
    })

    app.post("/api/v1/calendar/vacation/remove", async (req, res) => {
        var user;

        if(!req.cookies.auth) {
            return res.status(401).redirect('/login');
        }
    
        user = await verifyUser(req.cookies.auth);
    
    
        if(user.message !== undefined || user.error !== undefined) {
            return res.status(401).redirect('/login')        
        }

        if(!isAdmin(user)) {
            return res.status(401).redirect('/login')        
        }
        
        let event = await getEventById(req.body.id);
        event = event[0];

        let days = await getVacationDaysByUserId(event.user_id);


        if(days.length !== undefined && days.length <= 0) {
            return res.send({
                status: false,
                id: 0
            })
        }

        let duration = Math.abs(Math.floor((event.start - event.end) / (1000 * 60 * 60 * 24)));

        console.log(days);
        console.log(duration);

        let afterModifications = days[0].days + duration;

        if(afterModifications < 0) {
            return res.send(JSON.stringify({
                status: false,
                id: 0
            }))
        }

        await setVacationDays(event.user_id, afterModifications);

        await removeVacation(req.body.id);
        res.send("ok");
    })

    app.post("/api/v1/calendar/vacation/setDays", async (req, res) => {
        var user;

        if(!req.cookies.auth) {
            return res.status(401).redirect('/login');
        }
    
        user = await verifyUser(req.cookies.auth);
    
    
        if(user.message !== undefined || user.error !== undefined) {
            return res.status(401).redirect('/login')        
        }

        if(!isAdmin(user)) {
            return res.status(401).redirect('/login')        
        }
        
        let days = Number(req.body.days);

        if(!Number.isInteger(days) || days < 0) {
            return res.send("fail");
        }

        await setVacationDays(req.body.id, req.body.days);        
        res.send("ok");
    });
}