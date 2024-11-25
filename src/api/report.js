const { db, getUserCalendarDatesByDate, getProjectTypes, getAllCalendarDatesByDate } = require("../database");
const { getUser, isFullTime, getUsers, verifyUser, isAdmin } = require("../utils");


module.exports = (app) => {
    app.get('/api/v1/report/:id/:month/:year', async (req, res) => {

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
        
        let user_id = req.params['id'];
        

        let month = parseInt(req.params['month']);
        let year = parseInt(req.params['year']);

        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59, 999);

        const startTimestamp = startDate.getTime();
        const endTimestamp = endDate.getTime();

        var events;
        var users;
        if(user_id !== "all") {
            users = [await getUser(user_id)];
            events = await getUserCalendarDatesByDate(user_id, startTimestamp, endTimestamp);
        } else {
            users = await getUsers();
            events = await getAllCalendarDatesByDate(startTimestamp, endTimestamp);
        }

        for(let i = 0; i < users.length; i++) {
            users[i].fullTime = await isFullTime(users[i].id);
        }

        const projects = await getProjectTypes();

        res.render("reportPrint", {
            user_id: user_id,
            users: users,
            events: events,
            projects: projects,
            month: month,
            year: year
        })
    });
}