const { getCalendarDates, getProjectTypes, getAllVacations, getVacationTypes, createVacationDays, getVacationDaysByUserId, getAllVacationDays } = require('../database');
const {isAdmin, verifyUser, getUsers, isFullTime} = require('../utils');

module.exports = (app) => {
    app.get('/app/calendar', async (req, res) => {
        var user;
    
        if(!req.cookies.auth) {
            return res.status(401).redirect('/login');
        }
    
        user = await verifyUser(req.cookies.auth);
    
    
        if(user.message !== undefined || user.error !== undefined) {
            return res.status(401).redirect('/login')        
        }
    
        var admin = await isAdmin(user, req.cookies.auth);
        var dates = await getCalendarDates(user.id);
        var projects = await getProjectTypes();
        var vacations = await getVacationTypes();
        var vacationDays = await getVacationDaysByUserId(user.id);

        if(vacationDays.length === 0) {
            await createVacationDays(user.id, 0);
            vacationDays = await getVacationDaysByUserId(user.id);
        }

        res.render('calendar', {
            dates: dates,
            projects: projects, 
            user: user,
            vacations: vacations,
            isAdmin: admin,
            vacationDays: vacationDays,
        });
    })

    app.get('/app/calendar/report', async (req, res) => {
        let user;
    
        if(!req.cookies.auth) {
            return res.status(401).redirect('/login');
        }
    
        user = await verifyUser(req.cookies.auth);
    
    
        if(user.message !== undefined || user.error !== undefined) {
            return res.status(401).redirect('/login')        
        }

        var admin = await isAdmin(user, req.cookies.auth);

        if(!admin) {
            return res.status(401).redirect('/login')
        }
    

        let userList = await getUsers();
    
        for(let i = 0; i < userList.length; i++) {
            userList[i].isFullTime = await isFullTime(userList[i].id);
        }

        res.render('report', {
            user: user,
            isAdmin: admin,
            userList: userList,
        });
    })

    app.get('/app/calendar/vacation', async (req, res) => {
        let user;
    
        if(!req.cookies.auth) {
            return res.status(401).redirect('/login');
        }
    
        user = await verifyUser(req.cookies.auth);
    
    
        if(user.message !== undefined || user.error !== undefined) {
            return res.status(401).redirect('/login')        
        }

        var admin = await isAdmin(user, req.cookies.auth);

        if(!admin) {
            return res.status(401).redirect('/login')
        }


        let vacations = await getAllVacations();
        let projects = await getProjectTypes();
        let vacationTypes = await getVacationTypes();
        let users = await getUsers();

        res.render("vacation", {
            user: user,
            isAdmin: admin,
            vacations: vacations,
            vacationTypes: vacationTypes,
            projects: projects,
            users: users,
        })
    })

    app.get('/app/calendar/vacation-type', async (req, res) => {
        let user;
    
        if(!req.cookies.auth) {
            return res.status(401).redirect('/login');
        }
    
        user = await verifyUser(req.cookies.auth);
    
    
        if(user.message !== undefined || user.error !== undefined) {
            return res.status(401).redirect('/login')        
        }

        var admin = await isAdmin(user, req.cookies.auth);

        if(!admin) {
            return res.status(401).redirect('/login')
        }

        let users = await getUsers();
        let vacationDays = await getAllVacationDays();

        res.render("vacationDays", {
            user: user,
            isAdmin: admin,
            vacationDays: vacationDays,
            users: users,
        })
    })
}