const {setupVKAPI} = require("./src/vk/api");
const dotenv = require("dotenv");
const {parseTokenURL} = require("./src/vk/parsetoken");
const {initDownloadDtaProcess, downloadFriendsData} = require("./src/vk/download");
const {Logger} = require("@ling.black/log");

// Setting up
dotenv.config();

const {token, userId} = parseTokenURL(process.env.token_url);
setupVKAPI(token);

(async () => {
    await initDownloadDtaProcess();
    await downloadFriendsData({
        deep: process.env.friends_scanning_recursive_deep,
        maxFriendsCount: process.env.friends_count_ignore,
        delayPerRequest: process.env.delay_per_request,
        myId: userId,
    });
})();