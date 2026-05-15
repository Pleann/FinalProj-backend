const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/trips/:tripId/invites', require('./features/tripInvite/tripInvite.routes'));
app.use('/api/trips/:tripId/members', require('./features/tripMember/tripMember.routes'));
app.use('/api/trips', require('./features/trip/trip.routes'));

module.exports = app;