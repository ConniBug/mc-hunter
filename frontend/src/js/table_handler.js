const { autoToHTML } = require('@sfirew/minecraft-motd-parser');

// Function to send a request to the API server
const send_request = require("./requestHandler.js").send_request;
const { getUrlVars, setUrlVars } = require("./urlHandler.js");
const { setFilterValues } = require("./filterHandler.js");


//     hostname       varchar(255)  null,
//     port           integer       null,
//     version        varchar(255)  null,
//     description    varchar(1000) null,
//     players_online integer       null,
//     players_max    integer       null,
//     error          varchar(255)  null,
//     alive          tinyint       null,
//     last_updated   timestamp     null
// Function to populate the three tables

const table = document.querySelector("#table1-body");

let { hostname, port, version, minPlayers, maxPlayers, sortBy, sortDirection, page } = getUrlVars();
console.log(`Starting URL Vars: ${hostname}, ${port}, ${version}, ${minPlayers}, ${maxPlayers}, ${sortBy}, ${sortDirection}, ${page}`);
setFilterValues({ hostname, port, version, minPlayers, maxPlayers, sortBy, sortOrder: sortDirection });

setUrlVars();

const resultCount = document.querySelector("#resultCount");
function table_populate(entrys) {
    // Clear the table
    table.innerHTML = "";

    // Fill the table
    entrys.forEach((entry, idx) => {
        idx = entry.id ? entry.id : idx + 1;

        let motd = entry.description;
        if (motd) {
            motd = autoToHTML(motd);
        }
        let version = entry.version;
        if (version) {
            version = autoToHTML(version);
        }

        const row = `
                <tr class="firstTable_entry"">
                    <td>${idx}</td>
                    <td>
                        ${entry.hostname}:${entry.port}
                        <br>
                    <div class="h6 text-truncate">${motd}</div>
                        
                    </td>
                    <td>${entry.players_online}/${entry.players_max}</td>
                    <td>${version}</td>
                    <td>${entry.last_updated}</td>
                </tr>
            `;
        table.insertAdjacentHTML("beforeend", row);
    });

    // Update result count
    resultCount.innerHTML = `Found ${entrys.length} servers`;
}

let anim = null;
function OnSearchUpdate(caller) {
    resultCount.innerHTML = `Loading...`;
    if(anim !== null)
        clearInterval(anim);

    let cnt = 0;
    anim = setInterval(() => {
        let tmp = "";
        ++cnt;
        if (cnt >= 4)
            cnt = 0;
        switch (cnt) {
            case 0:
                tmp = "-";
                break;
            case 1:
                tmp = "\\";
                break;
            case 2:
                tmp = "|";
                break;
            case 3:
                tmp = "/";
                break;
        }
        resultCount.innerHTML = `Loading ${tmp}`;
    }, 250);

    setUrlVars();
    console.log(`Search update: ${caller}`);
    send_request(function (serverInfo) {
        anim = clearInterval(anim);
        table_populate(serverInfo);
    });
}

const sByHostname = document.querySelector("#sByHostname");
const sByPort = document.querySelector("#sByPort");
{
    sByHostname.value = hostname;
    sByPort.value = port;

    sByHostname.addEventListener("keyup", () => {
        hostname = sByHostname.value;

        OnSearchUpdate("sByHostname");
    });
    sByPort.addEventListener("keyup", () => {
        port = sByPort.value;

        OnSearchUpdate("sByPort");
    });

}

const sByMinPlayers = document.querySelector("#sByMinPlayers");
const sByMaxPlayers = document.querySelector("#sByMaxPlayers");
{
    sByMinPlayers.value = minPlayers;
    sByMaxPlayers.value = maxPlayers;

// On changed min/max players
    sByMinPlayers.addEventListener("keyup", () => {

        if (isNaN(sByMinPlayers.value)) {
            sByMinPlayers.value = minPlayers;
            return;
        }

        // Get the value of the min players
        let tmpMin = parseInt(sByMinPlayers.value);
        if (tmpMin < 0 || isNaN(tmpMin)) {
            tmpMin = 0;
        }
        if (tmpMin >= maxPlayers) {
            tmpMin = maxPlayers - 1;
        }
        sByMinPlayers.value = tmpMin;
        minPlayers = tmpMin;

        OnSearchUpdate("sByMinPlayers");
    });
    sByMaxPlayers.addEventListener("keyup", () => {
        let tmpMax = parseInt(sByMaxPlayers.value);
        if (tmpMax < 0 || isNaN(tmpMax)) {
            tmpMax = 0;
        }
        if (tmpMax <= minPlayers) {
            tmpMax = minPlayers + 1;
        }
        sByMaxPlayers.value = tmpMax;
        maxPlayers = tmpMax;

        OnSearchUpdate("sByMaxPlayers");
    });
}

const sByVersion = document.querySelector("#sByVersion");
{
    sByVersion.value = version;

    sByVersion.addEventListener("keyup", () => {
        version = sByVersion.value;

        OnSearchUpdate("sByVersion");
    });
}

const sBySortBy = document.querySelector("#sort_type");
{
    sBySortBy.value = sortBy;

    sBySortBy.addEventListener("change", () => {
        sortBy = sBySortBy.value;

        OnSearchUpdate("sBySortBy");
    });
}

const sBySortOrder = document.querySelector("#sort_direction");
{
    sBySortOrder.value = sortDirection;

    sBySortOrder.addEventListener("change", () => {
        sortDirection = sBySortOrder.value;

        OnSearchUpdate("sortDirection");
    });
}

const table1First = document.querySelector("#table1-first");
{
    table1First.addEventListener("click", () => {
        page = 1;
        setUrlVars(page);
        OnSearchUpdate("table1First");
    });
}
const table1Prev = document.querySelector("#table1-prev");
{
    table1Prev.addEventListener("click", () => {
        --page;
        if(page <= 0)
            page = 1;
        setUrlVars(page);
        OnSearchUpdate("table1Prev");
    });
}
const table1Next = document.querySelector("#table1-next");
{
    table1Next.addEventListener("click", () => {
        ++page;
        setUrlVars(page);
        OnSearchUpdate("table1Next");
    });
}
const table1Last = document.querySelector("#table1-last");
{
    table1Last.addEventListener("click", () => {
        // OnSearchUpdate("table1Last");
        setUrlVars(page);
        console.error("Not implemented");
        return false;
    });
}

module.exports.table_populate = table_populate;
OnSearchUpdate("init");