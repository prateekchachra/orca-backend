const mongoose = require('mongoose');

const vesselItemSchema = new mongoose.Schema({
  Longitude: { type: Number, required: true },
  Latitude: { type: Number, required: true },
  TrueHeading: { type: Number, required: true },
  Cog: { type: Number, required: true },
  Sog: { type: Number, required: true },
});

const VesselItem = mongoose.model('VesselItem', vesselItemSchema);

module.exports = VesselItem;