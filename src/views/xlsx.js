const { getAllCalendarDatesByDate, getAllCalendarDates } = require('../database');
const {isAdmin, verifyUser} = require('../utils');

module.exports = (app) => {
    app.get('/app/utils/xlsx', async (req, res) => {
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


        res.render('xlsx', {
            user: user,
            isAdmin: admin
        });

    })

}