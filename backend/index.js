require('dotenv').config();

const l = require("@connibug/js-logging");
const db = require("../hunter/db.js");

// Create API server with cors
const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const cors = require('cors');
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
}));

app.listen(port, () => {
    console.log(`API server listening at http://localhost:${port}`);
});

app.get('/', (req, res) => {
    res.send('Hello World!');
});

// API endpoints
app.get('/api/ips', async (req, res) => {
    console.log('===========');

    for (let [key, value] of Object.entries(req.query)) {
        if(value === "") {
            delete req.query[key];
            continue;
        }
        if(key === "min_players" || key === "max_players" || key === "page")
            value = parseInt(value);
        console.log(`${key}: ${value}`);
        req.query[key] = value < 1 ? 1 : value;

        if(key === "sort_by" && (value !== "id" && value !== "players_online" && value !== "last_updated"))
            throw("Invalid sort_by");
        if(key === "sort_order" && (value.toLowerCase() !== "asc" && value.toLowerCase() !== "desc"))
            throw("Invalid sort_order");
    }

    if(!req.query.page)
        req.query.page = 1;

    console.log(`Page = ${req.query.page}`);
    console.log(req.query);

    // alive = null, hostname = null, port = null, min_players = null, max_players = null, version = null, description = null, error = null
    let ips = await db.get_ips(req.query);
    res.send(ips);

    let req_ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    console.log(`GET /api/ips from ${req_ip} - ${ips.length} ips`);
});
app.get('/api/ips/:hostname', async (req, res) => {
    let alive = req.query.alive ? req.query.alive == "true" : true;

    let hostname = req.params.hostname;
    let ips = await db.get_ips(true, hostname);
    res.send(ips);

    let req_ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    console.log(`GET /api/ips/${hostname} from ${req_ip} - ${ips.length} ips`);
});

