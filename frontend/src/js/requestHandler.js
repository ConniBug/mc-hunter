const config = require("./config.js");

const { getFilterValues } = require("./filterHandler.js");
const { getPageNumber } = require("./urlHandler.js");

const { table_populate } = require("./table_handler.js");

// Create the request
const request = new XMLHttpRequest();

function send_request(callback = null) {
    if(callback)
        request.onComplete = callback;

    let { hostname, port, version, minPlayers, maxPlayers, sortBy, sortOrder } = getFilterValues();
    let page = getPageNumber();

    // Request from the server
    const api_url = config.api_url;

    let api_path = `/ips?alive=true`;

    let params = [
        `hostname=${hostname}`,
        `port=${port}`,
        `version=${version}`,
        `page=${page}`,
        `min_players=${minPlayers}`,
        `max_players=${maxPlayers}`,
        `sort_by=${sortBy}`,
        `sort_order=${sortOrder}`,
    ];
    api_path += `&${params.join("&")}`;

    request.open("GET", `${api_url}${api_path}`, true);
    request.setRequestHeader("Content-Type", "application/json");

    // Send the request
    request.send();
}

// Handle the response
request.onload = function () {
    if (request.status >= 200 && request.status < 400) {
        // Success!
        let serverInfo = [];
        const data = JSON.parse(request.responseText);
        serverInfo.push(...data);

        console.log(`Loaded ${data.length} servers`);
        if(request.onComplete) {
            request.onComplete(serverInfo);
            console.log("Called onComplete");
        }
    } else {
        // We reached our target server, but it returned an error
        console.error("Error: " + request.statusText);
    }
};

// Handle network errors
request.onerror = function () {
    console.error("Error: " + request.statusText);
}

module.exports.send_request = send_request;