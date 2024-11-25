const { getProjectTypes } = require('../database');
const {isAdmin, verifyUser} = require('../utils');

module.exports = (app) => {
    app.get('/app/project', async (req, res) => {
        var user;
    
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
    
        var projects = await getProjectTypes();

        res.render('project', {
            user: user,
            isAdmin: admin,
            projects: projects,
        });
    }) 
}