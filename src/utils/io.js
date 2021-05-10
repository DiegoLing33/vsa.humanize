const fs = require("fs/promises");
const fsOld = require("fs");
const {Logger} = require("@ling.black/log");

function isDir(path) {
    return fsOld.existsSync(path);
}

function isFile(path) {
    return fsOld.existsSync(path);
}

async function makeDirIfCan(path) {
    Logger.log("Trying to create path: " + path);
    if (!isDir(path)) {
        await fs.mkdir(path);
    }
}

async function readAllArray(path){
    Logger.log("Discovering path:", path, "...")
    const list = await fs.readdir(path);
    let data = [];
    for(const f of list){
        Logger.log("File:", f);
        const results = JSON.parse(String(await fs.readFile(path + "/" + f)));
        data.push(...results);
    }
    return data;
}

async function sleep(timeout) {
    return new Promise(resolve => {
        setTimeout(() => resolve(), timeout);
    });
}

module.exports = {
    isDir, isFile, makeDirIfCan, readAllArray, sleep,
}