const express = require('express');
const client = require('prom-client');
const chalk = require('chalk');
const ora = require('ora');
const figlet = require('figlet');
const boxen = require('boxen');

const app = express();
const PORT = process.env.PORT || 3000;

// Prometheus metrics registry
const register = new client.Registry();

// Enable collection of default metrics
client.collectDefaultMetrics({ register });

// Custom metric: HTTP request counter
const httpRequestCounter = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});
register.registerMetric(httpRequestCounter);

// Middleware to track requests
app.use((req, res, next) => {
  res.on('finish', () => {
    httpRequestCounter.labels(req.method, req.path, res.statusCode).inc();
  });
  next();
});

// Sample API route
app.get('/', (req, res) => {
  res.json({ message: 'Hello from Node.js with metrics!' });
});

// Prometheus metrics endpoint
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (err) {
    res.status(500).end(err.message);
  }
});

// Health check
app.get('/healthz', (req, res) => {
  res.send('OK');
});

// Show startup animation and start server
const spinner = ora(chalk.blue('🚀 Starting Metrics Server...')).start();

setTimeout(() => {
  spinner.succeed(chalk.green('✅ Server initialized!'));
  console.log(
    chalk.yellow(
      figlet.textSync('Node Metrics', {
        horizontalLayout: 'fitted'
      })
    )
  );

  const serverInfo = boxen(
    `
${chalk.cyanBright('▶ Server Info')}
${chalk.green('URL:')} http://localhost:${PORT}
${chalk.green('Health Endpoint:')} /healthz
${chalk.green('Metrics Endpoint:')} /metrics
${chalk.green('Sample API:')} /api/hello
  `,
    {
      padding: 1,
      margin: 1,
      borderStyle: 'round',
      borderColor: 'magentaBright'
    }
  );
  console.log(serverInfo);
}, 1500);

app.listen(PORT);

