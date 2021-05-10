require("dotenv").config();

const fs = require("fs/promises");
const {readAllObject, makeDirIfCan} = require("./src/utils/io");
const {Logger} = require("@ling.black/log");

const rd = "./results";
const wd = "./vkdata";

const wdInterests = wd + "/interests";
const wdNames = wd + "/names";
const wdLastNames = wd + "/lastnames";
const wdMusic = wd + "/music";
const wdBooks = wd + "/books";
const wdMovies = wd + "/movies";
const wdErrors = wd + "/errors";

Logger.log("Welcome to analyzer");

(async () => {
    await makeDirIfCan(rd);

    await filterData("interests", wdInterests);
    await filterData("music", wdMusic);
    await filterData("books", wdBooks);
    await filterData("movies", wdMovies);

    await readAllNames(wdNames, "names");
    await readAllNames(wdLastNames, "lastnames");

})();

async function readAllNames(key, n){
    Logger.log("Reading names");
    const list = await fs.readdir(key);
    const names = {male: {}, female: {}};
    for(const f of list){
        const data = JSON.parse(String(await fs.readFile(key + "/" + f)));
        names.female = {...names.female, ...data.female};
        names.male = {...names.male, ...data.male};
    }
    Logger.log(key, "Female:", Object.keys(names.female).length);
    Logger.log(key, "Male:", Object.keys(names.male).length);

    const female = filterByTrash(names.female, n);
    const male = filterByTrash(names.male, n);
    Logger.log(key, "After filtering female:", female.length);
    Logger.log(key, "After filtering male:", male.length);

    await saveResult(n+"-female", female);
    await saveResult(n+"-male", male);
}

async function filterData(name, path){
    const interests = await readAllObject(path);
    Logger.log("Filtering " + name);
    Logger.log("Was count:", Object.keys(interests).length);
    const filt = filterByTrash(interests, name);
    Logger.log("New count:", filt.length);
    await saveResult(name, filt);
}

async function saveResult(name, data){
    await fs.writeFile(rd + "/"+name+".json", JSON.stringify(data, null, 2));
}

function filterByTrash(items, k){
    const value = [];
    for(const key of Object.keys(items)){
        const val = items[key];
        if(val >= process.env[k]){
            value.push([key, val]);
        }
    }
    return value.sort((a, b) => b[1] - a[1]);
}