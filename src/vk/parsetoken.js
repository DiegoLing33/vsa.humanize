const {Logger} = require("@ling.black/log");

function parseTokenURL(url){
    const token = url.match(/access_token=([^&]+)&/)[1]
    const userId = url.match(/user_id=([^&]+)&/)[1]

    Logger.log("Access token: " + token);
    Logger.log("User ID: " + userId);

    return {token, userId};

}

module.exports = {
    parseTokenURL,
}