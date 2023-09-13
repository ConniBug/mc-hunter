const mc = require('minecraft-protocol');
const l = require("@connibug/js-logging");

module.exports.ping = async (host, port) => {
    return new Promise((resolve, reject) => {
        mc.ping({ host, port, closeTimeout: 5000, noPongTimeout: 5000,  }, (err, results) => {
            if (err) {
                if(err.code === undefined)
                    err.code = err.message;
                reject(err);
            } else {
                results.host = host;
                results.port = port;
                resolve(results);
            }
        });
    });
}
