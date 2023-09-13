const { getFilterValues } = require("./filterHandler.js");

const pageNum = document.querySelector("#table1-pagenum");


function getUrlVars() {
    let hostname = "";
    let port = 25565;
    let version = "";
    let minPlayers = 0;
    let maxPlayers = 9999999;
    let sortBy = "players_online";
    let sortOrder = "desc";
    let page = 1;

    let string = window.location.hash ? window.location.hash.substring(1) : "";
    let components = string.split("#");
    if(components.length == 1 && components[0] == "")
        return { hostname, port, version, minPlayers, maxPlayers, sortBy, sortOrder, page };

    for(let i = 0; i < components.length; ++i) {
        let comp = components[i];
        let tmp = comp.split("=");
        let key = tmp[0];
        let value = tmp[1];

        switch (key) {
            case "hostname":
                hostname = value;
                break;
            case "port":
                port = value;
                break;
            case "min_players":
                minPlayers = value;
                if(!minPlayers)
                    minPlayers = 1;
                break;
            case "max_players":
                maxPlayers = value;
                if(!maxPlayers)
                    maxPlayers = 9999999;
                break;
            case "version":
                version = value;
                break;
            case "sort_by":
                if(value == "")
                    value = "players_online";
                sortBy = value;
                break;
            case "sort_order":
                if(value == "")
                    value = "desc";
                sortOrder = value;
                break;
            case "page":
                page = parseInt(value);

                break;
            default:
                console.error(`Unknown key: ${key}`);
                break;
        }
        // console.log(`${key} = ${value}`);
    }

    return { hostname, port, version, minPlayers, maxPlayers, sortBy, sortOrder, page };
}
function setUrlVars(page = null) {
    if(page === null)
        page = getUrlVars().page;
    let { hostname, port, version, minPlayers, maxPlayers, sortBy, sortOrder } = getFilterValues();

    pageNum.innerHTML = `Page #${page}`;

    let url = `#hostname=${hostname}#port=${port}#min_players=${minPlayers}#max_players=${maxPlayers}#version=${version}#sort_by=${sortBy}#sort_order=${sortOrder}#page=${page}`;
    window.location.hash = url;
}

module.exports.getUrlVars = getUrlVars;
module.exports.setUrlVars = setUrlVars;
module.exports.getPageNumber = () => {
    let vars = getUrlVars();
    if(!vars)
        return 1;
    let page = vars.page;
    return page;
}