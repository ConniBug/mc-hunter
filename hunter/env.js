const l = require("@connibug/js-logging");
// l.setLogLevel("GENERIC")
l.setupFileLogging("./");

const fs = require('fs');

require('dotenv').config();
let error = false;
if(!process.env.DB_HOST) {
    l.error("DB_HOST not set");
    error = true;
}
if(!process.env.DB_PORT) {
    l.error("DB_PORT not set");
    error = true;
}
if(!process.env.DB_USER) {
    l.error("DB_USER not set");
    error = true;
}
if(!process.env.DB_PASS) {
    l.error("DB_PASS not set");
    error = true;
}
if(!process.env.DB_NAME) {
    l.error("DB_NAME not set");
    error = true;
}

module.exports.config = require("./config.json");
if(!module.exports.config.starting_ip) {
    l.error("starting_ip not set in config.json");
    error = true;
}
if(!module.exports.config.ending_ip) {
    l.error("ending_ip not set in config.json");
    error = true;
}
if(!module.exports.config.reservedSubnets) {
    l.error("reservedSubnets not set in config.json");
    error = true;
}
// Restore highest sequential IP from tmp storage
let starting_ip = "";
try {
    starting_ip = fs.readFileSync("/tmp/last_seq", "utf8");
} catch (err) {
    starting_ip = module.exports.config.starting_ip;
}
module.exports.config.starting_ip = starting_ip;

if(error)
    process.exit(1);
