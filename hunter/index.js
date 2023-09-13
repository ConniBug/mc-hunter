const motdParser = require('@sfirew/minecraft-motd-parser');
const fs = require('fs');

const l = require("@connibug/js-logging");
const config = require("./env.js").config;
const starting_ip = config.starting_ip;
const ending_ip = config.ending_ip;
const reservedSubnets = config.reservedSubnets;

let lastResolvedIP = "";
let highestSequentialIP = starting_ip;
console.log(`Starting IP: ${starting_ip}`);
starting_ip = starting_ip.split('.').map(Number);


// --- End Config ---

const pingServer = require("./ping.js").ping;
const db = require("./db.js");
update_ip = db.update_ip;

if(!config.discord.webhook_url) {
    l.verbose("No discord webhook url set, skipping discord webhook");
    return;
}
const Discord = require('discord.js');
const webhookClient = new Discord.WebhookClient({ url: config.discord.webhook_url });


function handlePingResults(results) {
    l.verbose(`Found server at ${results.host}:${results.port}`);
    l.verbose(`Version: ${results.version.name}`);
    l.verbose(`Players: ${results.players.online} / ${results.players.max}`);
    if(results.players.online > 0 && results.players.sample) {
        l.verbose("Players online:");
        for (const player of results.players.sample) {
            l.verbose(` - ${player.name} (${player.id})`);
        }
    }
    l.verbose(`Description: ${results.description.text}`);
    l.verbose(`Latency: ${results.latency}`);

    l.log(`FOUND - ${results.host}:${results.port} - ${results.version.name} - ${results.players.online} / ${results.players.max} - ${results.description.text} - ${results.latency}ms`);

    // decode base64 favicon
    let randID = Math.floor(Math.random() % 1000000000 + 1);
    if(results.favicon) {

        const base64Data = results.favicon.replace(/^data:image\/png;base64,/, "");
        fs.writeFileSync(`out-${randID}.png`, base64Data, 'base64');
    }

    // Call discord webhook
    let message = {
        username: config.discord.username,
        embeds: [{
            title: `${results.host}:${results.port}`,
            url: `https://mcsrvstat.us/server/${results.host}:${results.port}`,
            color: 0x00ff00,
            fields: [
                {
                    name: "Description",
                    value: motdParser.cleanCodes(results.description.text),
                    inline: true,
                },
                {
                    name: "Version",
                    value: motdParser.cleanCodes(results.version.name),
                    inline: true,
                },
                {
                    name: "Players",
                    value: `${results.players.online} / ${results.players.max}`,
                    inline: true,
                },
                {
                    name: "Latency",
                    value: `${results.latency}ms`,
                    inline: true,
                },
            ],
            timestamp: new Date(),
            footer: {
                text: "Minecraft Server Hunter",
            }
        }],
    };
    if(results.favicon) {
        message.embeds[0].thumbnail = {
            url: `attachment://out-${randID}.png`,
        };
        message.files = [{
            attachment: `out-${randID}.png`,
            name: `out-${randID}.png`,
        }];
    }

    // Upload to discord within embed
    webhookClient.send(message).catch((err) => {
        l.error(`Failed to send discord webhook: ${ err}`);
    });
}

let totalChecked = 0;
let totalFound = 0;
let totalDead = 0;

let lastMessage = 0;

async function handle_ip(ip, port = 25565) {
    ++totalChecked;
    // Filter out reserved IPs
    if (reservedSubnets.some((subnet) => ip.startsWith(subnet)))
        return;

    let results = null;
    try {
        let results = await pingServer(ip, port);
        try {
            handlePingResults(results);
            await update_ip(results.host, results.port, results.players.online, results.players.max, true, results.version.name, results.description.text, null);
            ++totalFound;
        } catch (err2) {
            console.error(err2);
        }
    } catch (err) {
        let expectedErrors =
            [ "ETIMEDOUT", "ECONNREFUSED", "ENOTFOUND", "EHOSTUNREACH", "EADDRNOTAVAIL", "ECONNRESET", "ENETUNREACH" ];
        if (!expectedErrors.includes(err.code))
            l.error(`Error while pinging ${ip}:${port}: ${err.code}`);
        await update_ip(ip, port, null, null,false, null, null, err.code);
        ++totalDead;
    }

    const history = [];
    function updateHighestSequentialIP(newIP) {
        const currentIPArray = highestSequentialIP.split('.').map(Number);
        const newIPArray = newIP.split('.').map(Number);

        // Check if the new IP is higher than the current highest sequential IP
        for (let i = 0; i < 4; i++) {
            if (newIPArray[i] > currentIPArray[i]) {
                // Update the highest sequential IP
                highestSequentialIP = newIP;
                // Remove IPs from the history between the old highest and new highest IPs
                const startIndex = currentIPArray.reduce((acc, val, index) => {
                    if (index === i) return acc;
                    return acc * 256 + val;
                }, 0);
                const endIndex = newIPArray.reduce((acc, val, index) => {
                    if (index === i) return acc;
                    return acc * 256 + val;
                }, 0);
                history.splice(startIndex, endIndex - startIndex);
                break;
            } else if (newIPArray[i] < currentIPArray[i]) {
                // This case handles IPs that are not sequentially higher
                history.push(newIP);
                break;
            }
        }
    }

    lastResolvedIP = ip;
    updateHighestSequentialIP(ip);
}

let lastCount = 0;
let avgDelta = 0;
function updateStatus() {
    if (new Date().getTime() - lastMessage > config.status_update_interval) {
        let delta = totalChecked - lastCount;
        delta = delta / (config.status_update_interval / 1000);
        avgDelta = avgDelta === 0 ? delta : (avgDelta + delta) / 2;
        lastCount = totalChecked;

        lastMessage = new Date().getTime();

        l.log(`Checked ${totalChecked} IPs, found ${totalFound} servers, total pending ${totalChecked - totalFound - totalDead}, ${Math.floor(avgDelta)}/s - [ ${highestSequentialIP} ] [ ${lastResolvedIP} ]`);
    }
}

// self calling function
(async () => {
    await db.setup();

    // Loop though every residential IP addressk
    for (let i = starting_ip[0]; i <= 255; ++i) {
        // xxx.

        // Check if reserved subnet
        if (reservedSubnets.some((subnet) => (i.toString() + ".").startsWith(subnet))) {
            console.log(`Skipping subnet ${i}.0.0.0`);
            continue;
        }
        for (let j = i == starting_ip[0] ? starting_ip[1] : 0; j <= 255; ++j) {
            // xxx.xxx.
            for (let k = i == starting_ip[0] && j == starting_ip[1] ? starting_ip[2] : 0; k <= 255; ++k) {
                // xxx.xxx.xxx.
                for (let d = i == starting_ip[0] && j == starting_ip[1] && k == starting_ip[2] ? starting_ip[3] : 0; d <= 255; ++d) {
                    // xxx.xxx.xxx.xxx

                    updateStatus();
                    while(totalChecked - totalFound - totalDead >= config.max_pending) {
                        updateStatus();
                        await new Promise(r => setTimeout(r, 100));
                    }

                    if(`${i}.${j}.${k}.${d}` === ending_ip) {
                        while(totalChecked - totalFound - totalDead > 0) {
                            updateStatus();
                            await new Promise(r => setTimeout(r, 100));
                        }
                        console.log("Reached final IP");
                        db.shutdown();
                        process.exit(0);
                    }

                    handle_ip(`${i}.${j}.${k}.${d}`);
                }
            }
        }
    }

    while(totalChecked - totalFound - totalDead > 0) {
        updateStatus();
        await new Promise(r => setTimeout(r, 100));
    }

    db.close((err) => {
        if (err) {
            return console.error(err.message);
        }
        console.log('Closed the database connection.');
    });
})();

// Save highest sequential IP every x seconds into tmp storage
setInterval(() => {
    l.verbose(`Saving highest sequential IP to /tmp/last_seq: ${highestSequentialIP}`);
    fs.writeFileSync("/tmp/last_seq", highestSequentialIP);
}, 1000 * 60 * 1);

process.on('SIGINT', function() {
    console.log("Caught interrupt signal");
    db.shutdown();

    l.verbose(`Saving highest sequential IP to /tmp/last_seq: ${highestSequentialIP}`);
    fs.writeFileSync("/tmp/last_seq", highestSequentialIP);

    process.exit();
});