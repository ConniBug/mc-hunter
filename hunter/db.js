const mariadb = require('mariadb');
const l = require("@connibug/js-logging");

let update_ip_connection = null;
let get_ips_connection = null;

// Connect to mariadb
l.log(`Connecting to MariaDB at ${process.env.DB_HOST}:${process.env.DB_PORT} as ${process.env.DB_USER} with database ${process.env.DB_NAME}`);
const pool = mariadb.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,

    user: process.env.DB_USER,
    password: process.env.DB_PASS,

    database: process.env.DB_NAME,

    connectionLimit: 5,

    trace: true
});

function connect() {
    return new Promise((resolve, reject) => {
        pool.getConnection().then((conn) => {
            resolve(conn);
        }).catch((err) => {
            reject(err);
        });
    });
}

module.exports.shutdown = async () => {
    if(update_ip_connection !== null)
        update_ip_connection.end();
    if(get_ips_connection !== null)
        get_ips_connection.end();

    if(pool !== null)
        pool.end();

    console.log("Closed database connections");
}

module.exports.update_ip = async (hostname, port, players_online, players_max, alive, version, description, error) => {
    return new Promise(async (resolve, reject) => {
        while (!connected) {
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
        update_ip_connection.query(`INSERT INTO ips (hostname, port, players_online, players_max, alive, version, description, error) VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE port = ?, alive = ?, players_online = ?, players_max = ?, version = ?, description = ?, error = ?`, [hostname, port, players_online, players_max, alive, version, description, error, port, alive, players_online, players_max, version, description, error]).then((res) => {
            resolve(res);
        });
    });
}

// Help prevent against injection attacks
const valid_keys = [
    "page",
    "alive",
    "hostname",
    "port",
    "min_players",
    "max_players",
    "version",
    "description",
    "error",
    "sort_by",
    "sort_order"
];

module.exports.get_ips = async (options = {}) => {
    let page = options.page ? options.page : 1;
    delete options.page;

    let query = `SELECT * FROM ips`;
    let values = [];

    let tmp = ' WHERE '
    for (let [key, value] of Object.entries(options)) {
        if(!valid_keys.includes(key)) {
            l.error(`Invalid key: ${key}`);
            continue;
        }
        l.verbose(`${key}: ${value}`);

        if(key === "alive") {
            if(value === "true")
                value = 1;
            else if(value === "false")
                value = 0;
            else
                value = 0;
        }

        if(key === "min_players" || key === "max_players") {
            query += tmp + `players_online ${key === "min_players" ? ">=" : "<="} ?`;
            value = parseInt(value);
        }
        else if(key === "sort_by" || key === "sort_order")
            continue;
        else
            query += tmp + `${key} = ?`;

        values.push(value);

        tmp = ' AND ';
    }

    if(options.sort_by !== null) {
        l.log(`Sorting by ${options.sort_by} ${options.sort_order}`);

        if(options.sort_by !== "id" && options.sort_by !== "players_online" && options.sort_by !== "last_updated") {
            options.sort_by = "id";
            options.sort_order = "desc";
            l.log(`Invalid options.sort_by: ${options.sort_by}`);
        }
        let t = options.sort_order === "asc" ? "ASC" : "DESC";
        query += ` ORDER BY ${options.sort_by} ${t}`;
    }
    // query += ` LIMIT 50;`;
    query += ` LIMIT ${50 * (page - 1)}, 50;`;

    console.log(query);
    console.log(values);

    return new Promise(async (resolve, reject) => {
        while (!connected) {
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
        get_ips_connection.query(query, values).then((res) => {
            resolve(res);
        });
    });
};

let connected = false;
(async() => {
    l.log(`Connecting...`);
    update_ip_connection = connect();
    get_ips_connection = connect();

    if((await update_ip_connection) === null || (await get_ips_connection) === null) {
        l.error("Failed to connect to database");
        process.exit(1);
    }
    update_ip_connection = await update_ip_connection;
    get_ips_connection = await get_ips_connection;

    connected = true;
    l.log("Connected to database");
})();
