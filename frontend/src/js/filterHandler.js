let filterObjects = {
    hostname: document.querySelector("#sByHostname"),
    port: document.querySelector("#sByPort"),
    version: document.querySelector("#sByVersion"),

    minPlayers: document.querySelector("#sByMinPlayers"),
    maxPlayers: document.querySelector("#sByMaxPlayers"),

    sortBy: document.querySelector("#sort_type"),
    sortOrder: document.querySelector("#sort_direction"),

    pageTurners: {
        first: document.querySelector("#table1-first"),
        prev: document.querySelector("#table1-prev"),
        next: document.querySelector("#table1-next"),
        last: document.querySelector("#table1-last"),
    }
}

function getFilterValues() {
    let filterValues = {
        hostname: filterObjects.hostname.value,
        port: filterObjects.port.value,
        version: filterObjects.version.value,

        minPlayers: filterObjects.minPlayers.value,
        maxPlayers: filterObjects.maxPlayers.value,


        sortBy: filterObjects.sortBy.value,
        sortOrder: filterObjects.sortOrder.value,
    }
    return filterValues;
}

module.exports.filterObjects = filterObjects;
module.exports.getFilterValues = getFilterValues;