const nodeFetch = require("node-fetch");

let token = "";

function setupVKAPI(t) {
    token = t;
}

const vkEndpoint = "http://api.vk.com/method/";


/**
 * Returns the friends
 * @param uid
 * @return {Promise<*>}
 */
async function getFriends(uid) {
    const ft = await nodeFetch(vkEndpoint + "friends.get?fields=sex,interests,books,music,movies&user_id=" + uid + "&count=5000&v=5.130&access_token=" + token);
    return await ft.json();
}

module.exports = {
    setupVKAPI, getFriends,
    vkEndpoint,
}