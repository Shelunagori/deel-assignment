require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
require('./model/associations');

const adminRoutes = require('./routes/admin.routes');
const contractRoutes = require('./routes/contract.routes');
const jobRoutes = require('./routes/job.routes');
const balanceRoutes = require('./routes/balance.routes');

const app = express();
app.use(bodyParser.json());

// Register routes
app.use('/admin', adminRoutes);
app.use('/contracts', contractRoutes);
app.use('/balances', balanceRoutes);
app.use('/jobs', jobRoutes);

// Start server
const PORT = process.env.PORT || 3001;
const server = app.listen(PORT, () => {
    console.log(`Express App Listening on Port ${PORT}`);
});

server.on('error', (err) => {
    console.error('Server error:', err);
    process.exit(1);
});
