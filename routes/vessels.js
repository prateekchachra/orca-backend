const express = require('express');
const VesselItem = require('../models/VesselItem');
const router = express.Router();

const WebSocket = require('ws');
const socket = new WebSocket("wss://stream.aisstream.io/v0/stream");

socket.onopen = function (_) {
    let subscriptionMessage = {
        Apikey: process.env.AIS_STREAM_API_KEY,
        BoundingBoxes: [[[-90, -180], [90, 180]]],
    }
    socket.send(JSON.stringify(subscriptionMessage));
};

socket.onmessage = function (event) {
    let aisMessage = JSON.parse(event.data)
    console.log(aisMessage)
};

router.get('/vessels', async (req, res) => {
    
  try {
    const vesselItems = await VesselItem.find();
    res.json(vesselItems);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});