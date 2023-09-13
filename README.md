# mc-hunter

## Hunter

### Usage

```bash
npm i
node hunter.js
```

### Configuration

#### Config File

- `config.json` - The configuration file
```json
{
  "starting_ip": "1.0.0.0", 
  "ending_ip": "255.255.255.255", 
  "reservedSubnets": ["10.", "172.", "192.", "127.", "0."],
  "save_progress_interval": 10,
  "status_update_interval": 10000,
  "max_pending": 3000,
  "discord": {
    "webhook_url": "https://discord.com/api/webhooks/<webhook_id>/<webhook_token>",
    "username": "Minecraft Server Hunter"
  }
}
````

#### Environment Variables

- `DB_HOST` - The host of the database (default: `localhost`)
- `DB_PORT` - The port of the database (default: `3306`)
- `DB_USER` - The user of the database (default: `root`)
- `DB_PASSWORD` - The password of the database (default: `N/A`)
- `DB_NAME` - The name of the database (default: `mc_stuff`)

## Web API

### /api/ips

#### GET

Returns a list of all IPs in the database

##### Query Parameters

- `alive` - Whether to only return alive IPs  (default: `false`, options: `true`, `false`)
- `page` - The page number to return (default: 1, page size: 50)
- `sort_by` - The field to sort by (default: `ip`, options: `ip`, `last_updated`, `player_count`)
- `sort_order` - Sort by ascending or descending (default: `desc`, options: `asc`, `desc`)
- `version` - The version of the server (default: ` `, options: `any`, `1.7`, `1.8`, `1.9`, `1.10`, `1.11`, `1.12`, `1.13`, `1.14`, `1.15`, `1.16`, `1.17`)


## Frontend (WIP)

### Usage

```bash
npm i
npm start
```

### Configuration

#### Environment Variables

- `API_URL` - The URL of the API (default: `http://localhost:3000/api`)