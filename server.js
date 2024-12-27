const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

const vesselRoutes = require('./routes/vessels');

app.use(cors());
app.use(express.json()); 

app.use('/api', vesselRoutes);

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.log(err));

app.get('/', (req, res) => {
  res.send('Orca BE API is running!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});