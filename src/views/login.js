const { CONFIG } = require('../config');
const { verifyUser } = require('../utils');

module.exports = (app) => {
    app.get('/login', (req, res) => {
        var url = `${CONFIG.GITLAB_URL}/oauth/authorize?client_id=${CONFIG.APP_ID}&redirect_uri=${CONFIG.LOGIN_DOMAIN}&response_type=code&scope=openid read_user profile read_api`

        res.render("login", {
            login_url: url,
        })
    })

    app.get('/', async (req, res) => {
        var user;

        if(!req.cookies.auth) {
            return res.status(401).redirect('/login');
        }

        user = await verifyUser(req.cookies.auth);


        if(user.message !== undefined || user.error !== undefined) {
            return res.status(401).redirect('/login')        
        }

        res.redirect('/app/calendar');
    })
}