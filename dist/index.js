"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.run = void 0;
const core_1 = require("@actions/core");
const cosmic_1 = require("@anandchowdhary/cosmic");
const integrations_1 = require("@stethoscope-js/integrations");
const dot_object_1 = __importDefault(require("dot-object"));
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const recursive_readdir_1 = __importDefault(require("recursive-readdir"));
const dot = new dot_object_1.default("/");
cosmic_1.cosmicSync("stethoscope");
const items = Object.keys(cosmic_1.config("integrations") || {});
const run = async () => {
    if (!items)
        return console.log("Config not found", items);
    console.log("Enabled integrations", items);
    for await (const ClassName of [
        integrations_1.Spotify,
        integrations_1.Rescuetime,
        integrations_1.LastFm,
        integrations_1.PocketCasts,
        integrations_1.Wakatime,
        integrations_1.Clockify,
        integrations_1.GoogleFit,
        integrations_1.OuraRing,
        integrations_1.Goodreads,
        integrations_1.Twitter,
    ]) {
        const integration = new ClassName();
        if (items.includes(integration.name) &&
            cosmic_1.config("integrations")[integration.name].frequency === "daily") {
            console.log("Updating", integration.name);
            await integration.update();
        }
        else {
            console.log("Skipping", integration.name);
            console.log("  >  Included in integrations?", items.includes(integration.name));
            console.log("  >  Frequency?", (cosmic_1.config("integrations")[integration.name] || {}).frequency);
        }
        if (items.includes(integration.name)) {
            console.log("Generating summary", integration.name);
            await integration.summary();
        }
    }
    console.log("Generating API endpoints");
    const categories = await fs_extra_1.readdir(path_1.join(".", "data"));
    for await (const category of categories) {
        if ((await fs_extra_1.pathExists(path_1.join(".", "data", category, "summary"))) &&
            (await fs_extra_1.lstat(path_1.join(".", "data", category, "summary"))).isDirectory()) {
            const files = (await recursive_readdir_1.default(path_1.join(".", "data", category, "summary")))
                .map((path) => path.split(`${path_1.join(".", "data", category, "summary")}/`)[1])
                .sort((a, b) => a.localeCompare(b, "en", {
                numeric: true,
                sensitivity: "base",
            }));
            const data = {};
            files.forEach((file) => {
                const path = file.split("/").map((v) => `_check_${v}`);
                const prefix = path.join("/") === "" ? "root" : path.join("/");
                data[prefix] = true;
            });
            const items = recursivelyArrange(recursivelyClean2(recursivelyClean1(JSON.parse(JSON.stringify(dot.object(data)).replace(/_check_/g, "")))));
            await fs_extra_1.ensureFile(path_1.join(".", "data", category, "api.json"));
            await fs_extra_1.writeFile(path_1.join(".", "data", category, "api.json"), JSON.stringify(items, null, 2));
        }
    }
    console.log("Finished generating API endpoints");
};
exports.run = run;
function recursivelyClean1(items) {
    if (typeof items === "object" && !Array.isArray(items)) {
        Object.keys(items).forEach((key) => {
            if (items[key] === true) {
                items[key.replace(".json", "")] = key;
                delete items[key];
            }
            else {
                items[key] = recursivelyClean1(items[key]);
            }
        });
    }
    return items;
}
function recursivelyClean2(items) {
    if (typeof items === "object") {
        Object.keys(items).forEach((key) => {
            if (typeof items[key] === "object") {
                let allStrings = true;
                Object.values(items[key]).forEach((value) => {
                    if (typeof value !== "string")
                        allStrings = false;
                });
                if (!allStrings) {
                    items[key] = recursivelyClean2(items[key]);
                }
                else {
                    items[key] = Object.values(items[key]);
                }
            }
        });
    }
    return items;
}
function recursivelyArrange(items) {
    if (Array.isArray(items)) {
        items = items.sort((a, b) => a.localeCompare(b, "en", {
            numeric: true,
            sensitivity: "base",
        }));
    }
    else if (typeof items === "object") {
        Object.keys(items).forEach((key) => {
            items[key] = recursivelyArrange(items[key]);
        });
    }
    return items;
}
exports.run()
    .then(() => { })
    .catch((error) => {
    console.error("ERROR", error);
    core_1.setFailed(error.message);
});
//# sourceMappingURL=index.js.map