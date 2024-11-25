const { getAllCalendarDatesByDate } = require("../database");
const { verifyUser, isAdmin, getUsers } = require("../utils");


module.exports = (app) => {
    app.post("/api/v1/xlsx/getEventsByMonth", async (req, res) => {
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


        let events = await getAllCalendarDatesByDate(req.body.from, req.body.to);

        let users = await getUsers();
        
        for(let i = 0; i < events.length; i++) {
            for(let j = 0; j < users.length; j++) {
                if(users[j].id === events[i].user_id) {
                    events[i].fullname = users[j].name;
                    break;
                }
            }
        }


        res.send(events);
    });
}