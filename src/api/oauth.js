const { CONFIG } = require('../config');
const { linkRocketChat } = require('../utils');

module.exports = (app) => {
    app.get("/api/v1/oauth", async (req, res) => {

        const response = await fetch(CONFIG.GITLAB_URL + "/oauth/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: "sepe-v2 app",
                client_id: CONFIG.APP_ID,
                client_secret: CONFIG.APP_SECRET,
                code: req.query.code,
                grant_type: "authorization_code",
                redirect_uri: CONFIG.LOGIN_DOMAIN
            })
        });
    
        const data = await response.json();
        var access_token = data.access_token;
    
        const user = await fetch(CONFIG.GITLAB_URL + "/api/v4/user?access_token=" + access_token);
        var userData = await user.json();

        await linkRocketChat(userData.id, userData.email);

    
        console.log(userData);
        if(userData.username != undefined) {
            res.cookie('auth', access_token);
            res.redirect('/app/calendar')
        }
    })

}