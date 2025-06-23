const express = require('express');
const client = require('prom-client');

const app = express();
const port = 3000;

// Enable collection of default metrics like memory, CPU, etc.
client.collectDefaultMetrics();

// Custom metric example
const requestCounter = new client.Counter({
  name: 'node_app_request_count',
  help: 'Total number of requests to the root endpoint',
});

app.get('/', (req, res) => {
  requestCounter.inc(); // increment counter
  res.send('✅ Node.js App is Running with Metrics!');
});

// Prometheus metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

app.listen(port, () => {
  console.log(`🚀 App running at http://localhost:${port}`);
});

