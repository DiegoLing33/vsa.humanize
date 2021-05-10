const fs = require("fs/promises");
const {getFriends} = require("./api");
const {readAllArray} = require("../utils/io");
const {Logger} = require("@ling.black/log");
const {makeDirIfCan, sleep} = require("../utils/io");

const PREFIX = new Date().getTime();
const wd = "./vkdata";

const wdIds = wd + "/ids";
const wdInterests = wd + "/interests";
const wdNames = wd + "/names";
const wdLastNames = wd + "/lastnames";
const wdMusic = wd + "/music";
const wdBooks = wd + "/books";
const wdMovies = wd + "/movies";
const wdErrors = wd + "/errors";

const userIds = [];
const ignoreIds = [];
const errors = [];

const interests = {};
const music = {};
const movies = {};
const books = {};
const names = {male: {}, female: {}};
const lastnames = {male: {}, female: {}};

async function detectUsedIds() {
    const data = await readAllArray(wdIds);
    ignoreIds.push(...data);

    Logger.log("Found and will ignore " + ignoreIds.length + " ids...");
}

async function initDownloadDtaProcess() {
    await makeDirIfCan(wd);
    await makeDirIfCan(wdIds);
    await makeDirIfCan(wdInterests);
    await makeDirIfCan(wdMusic);
    await makeDirIfCan(wdBooks);
    await makeDirIfCan(wdMovies);
    await makeDirIfCan(wdNames);
    await makeDirIfCan(wdLastNames);
    await makeDirIfCan(wdErrors);

    await detectUsedIds();
}

async function downloadFriendsData({deep, myId, maxFriendsCount, delayPerRequest}) {
    const friends = await getFriends(myId);
    if (friends.response && friends.response.items && friends.response.count < maxFriendsCount) {
        Logger.log("Found new", friends.response.count, "friends of user ", myId, ". Exploring...");
        for await (const fr of friends.response.items) {
            const friendId = fr.id;
            Logger.log("Friend Id:", friendId);
            if (!userIds.includes(friendId) && !ignoreIds.includes(friendId)) {
                userIds.push(friendId);
                if (fr.interests) processValue(fr.interests, interests);
                if (fr.music) processValue(fr.music, music);
                if (fr.movies) processValue(fr.movies, movies);
                if (fr.books) processValue(fr.books, books);
                if (fr.last_name && fr.first_name && fr.sex) {
                    Logger.log("User:", fr.first_name, fr.last_name);
                    if(fr.sex === 1){
                        processValue(fr.first_name, names.female);
                        processValue(fr.last_name, lastnames.female);
                    }
                    if(fr.sex === 2){
                        processValue(fr.first_name, names.male);
                        processValue(fr.last_name, lastnames.male);
                    }
                }

                console.clear();
                Logger.log('---------------------------------');
                Logger.log("[For all time] Users count: " + (userIds.length + ignoreIds.length));
                Logger.log('---------------------------------');
                Logger.log("[For session] Unique interests:", Object.keys(interests).length);
                Logger.log("[For session] Unique music:", Object.keys(music).length);
                Logger.log("[For session] Unique books:", Object.keys(books).length);
                Logger.log("[For session] Unique movies:", Object.keys(movies).length);
                Logger.log("[For session] Unique names:", Object.keys(names.male).length + Object.keys(names.female).length);
                Logger.log("[For session] Unique lastnames:", Object.keys(lastnames.male).length + Object.keys(lastnames.female).length);
            } else {
                Logger.log("Ignoring Friend Id", friendId);
            }

            if (deep > 0) {
                await downloadFriendsData({
                    deep: deep - 1,
                    maxFriendsCount,
                    delayPerRequest,
                    myId: friendId,
                });
            }
        }
        // Friend end - lets save data
        await saveContent(wdIds, userIds);
        await saveContent(wdInterests, interests);
        await saveContent(wdMusic, music);
        await saveContent(wdBooks, books);
        await saveContent(wdMovies, movies);
        await saveContent(wdNames, names);
        await saveContent(wdLastNames, lastnames);
        await sleep(delayPerRequest);
    } else {
        if (friends.response && friends.response.items && friends.response.count < maxFriendsCount) {
            errors.push('too many friends')
        } else {
            errors.push(friends);
        }
        await saveContent(wdErrors, errors);
    }
}

async function saveContent(p, content) {
    await fs.writeFile(p + "/" + PREFIX + ".json", JSON.stringify(content, null, 2));
}

function processData(data) {
    return data.split(",").map((v) => v.trim()).map((v) => (v.substr(0, 1).toUpperCase() + v.substr(1)))
}

function processValue(data, out) {
    const __src = processData(data);
    for (const s of __src) {
        if (out[s] === undefined) out[s] = 0;
        out[s] = out[s] + 1;
    }
}

module.exports = {
    initDownloadDtaProcess,
    downloadFriendsData
};