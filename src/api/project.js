const { default: db, createProjectType, deleteProjectType, updateProjectType } = require('../database');
const {isAdmin, verifyUser} = require('../utils');

module.exports = (app) => {
    app.post('/api/v1/project/update', async (req, res) => {
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
    
        var body = req.body;
    
        if(body.name.length === 0) {
            return res.send("fail");
        }
    
        await updateProjectType(body.id, body.name, body.color);
        res.send("ok")
    })
    
    app.post('/api/v1/project/delete', async (req, res) => {
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
        
        var body = req.body;
    
        let result = await deleteProjectType(body.id);
        res.send(JSON.stringify({success: result}))
    })
    
    app.post('/api/v1/project/create', async (req, res) => {
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
    
        var body = req.body;
    
        if(body.name.length === 0 || body.color.length === 0) {
            return res.send("fail");
        }
    
    
        await createProjectType(body.name, body.color);
        res.send("ok")
    })
}