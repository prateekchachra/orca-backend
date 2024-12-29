const WebSocket = require("ws");
const { Pool } = require("pg");
const cors = require("cors");
const express = require("express");
const cron = require('node-cron')
const rateLimit = require("express-rate-limit");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  user: "orcatest",
  database: "vesselsdb",
});

require("dotenv").config();

cron.schedule('0 0 * * *', async () => {
  console.log('Running daily cleanup job...');
  try {
    await pool.query(`
      DELETE FROM vessels
      WHERE timestamp < (NOW() AT TIME ZONE 'UTC') - INTERVAL '1 day';
    `);
    console.log('Old data successfully deleted.');
  } catch (error) {
    console.error('Error during cleanup:', error);
  }
});

const app = express();
const PORT = process.env.PORT || 5020;
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

const wss = new WebSocket.Server({ server });
const aisSocket = new WebSocket("wss://stream.aisstream.io/v0/stream");

aisSocket.onopen = () => {
  const subscriptionMessage = {
    Apikey: process.env.AIS_STREAM_API_KEY,
    BoundingBoxes: [
      [
        [-90, -180],
        [90, 180],
      ],
    ],
    FilterMessageTypes: ["PositionReport"],
  };
  aisSocket.send(JSON.stringify(subscriptionMessage));
};

aisSocket.onmessage = async (event) => {
  try {
    const aisMessage = JSON.parse(event.data);
    const { Latitude, Longitude, Cog, Sog, TrueHeading } =
      aisMessage?.Message?.PositionReport;
    const { MMSI, time_utc } = aisMessage?.MetaData;
    const cleanedTimestamp = time_utc.replace(/\s\+\d{4}\sUTC$/, "");
    if (MMSI) {
      await pool.query(
        `
        INSERT INTO vessels (mmsi, position, cog, sog, heading, timestamp)
        VALUES ($1, ST_SetSRID(ST_MakePoint($2, $3), 4326), $4, $5, $6, $7)
        ON CONFLICT (mmsi)
        DO UPDATE SET position = EXCLUDED.position, cog = EXCLUDED.cog, sog = EXCLUDED.sog, heading = EXCLUDED.heading, timestamp = EXCLUDED.timestamp;
    `,
        [MMSI, Longitude, Latitude, Cog, Sog, TrueHeading, cleanedTimestamp],
      );
    }
  } catch (error) {
    console.error("Error processing AIS message:", error);
  }
};

wss.on("connection", (ws) => {
  ws.on("message", async (message) => {
    try {
      const { bounds, zoom } = JSON.parse(message);
      if (zoom >= 12) {
        const { rows } = await pool.query(
          `
              SELECT mmsi, ST_X(position) AS lon, ST_Y(position) AS lat, cog, sog, heading
              FROM vessels
              WHERE timestamp > (NOW() AT TIME ZONE 'UTC') - INTERVAL '2 minutes'
              AND ST_Within(
              position,
              ST_MakeEnvelope(
                LEAST($1::double precision, $3::double precision),  -- Minimum longitude (west)
                LEAST($2::double precision, $4::double precision),  -- Minimum latitude (south)
                GREATEST($1::double precision, $3::double precision),  -- Maximum longitude (east)
                GREATEST($2::double precision, $4::double precision),  -- Maximum latitude (north)
                4326
              )
            );`,
          [
            bounds.minLatitude,
            bounds.minLongitude,
            bounds.maxLatitude,
            bounds.maxLongitude,
          ],
        );
        ws.send(JSON.stringify(rows));
      }
    } catch (error) {
      console.error("Error sending message to client:", error);
    }
  });
});

app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
  }),
);

app.get("/", (req, res) => {
  res.send("Orca BE API is running!");
});
