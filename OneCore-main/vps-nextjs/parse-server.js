/**
 * Parse Server Configuration
 * Standalone Parse Server for BAYYTI Smart Irrigation Cloud
 */

const express = require('express');
const { ParseServer } = require('parse-server');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Enable CORS
app.use(cors());

// Parse Server configuration
const parseServer = new ParseServer({
  databaseURI: process.env.DATABASE_URI || 'mongodb://localhost:27017/bayyti',
  cloud: './cloud/main.js',
  appId: process.env.PARSE_APP_ID || 'BAYYTI_APP_ID',
  masterKey: process.env.PARSE_MASTER_KEY || 'BAYYTI_MASTER_KEY',
  javascriptKey: process.env.PARSE_JS_KEY || 'BAYYTI_JS_KEY',
  serverURL: process.env.PARSE_SERVER_URL || 'http://localhost:1337/parse',
  
  // Security
  allowClientClassCreation: false,
  enableAnonymousUsers: false,
  
  // File uploads
  maxUploadSize: '20mb',
  
  // Live Query (optional - for real-time updates)
  liveQuery: {
    classNames: ['Device', 'SensorLog', 'IrrigationLog', 'Alert', 'AIInput']
  },
  
  // Email verification (configure with your email provider)
  // emailAdapter: {
  //   module: '@parse/simple-mailgun-adapter',
  //   options: {
  //     fromAddress: 'noreply@bayyti.com',
  //     domain: 'your-mailgun-domain',
  //     apiKey: 'your-mailgun-api-key'
  //   }
  // },
  
  // Push notifications (optional)
  // push: {
  //   android: {
  //     apiKey: 'your-fcm-api-key'
  //   },
  //   ios: {
  //     pfx: 'path/to/cert.p12',
  //     passphrase: 'cert-passphrase',
  //     production: false
  //   }
  // }
});

// Mount Parse Server at /parse
app.use('/parse', parseServer.app);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'BAYYTI Parse Server',
    timestamp: new Date().toISOString()
  });
});

// Start server
const PORT = process.env.PARSE_PORT || 1337;
app.listen(PORT, () => {
  console.log(`Parse Server running on port ${PORT}`);
  console.log(`Server URL: http://localhost:${PORT}/parse`);
});

module.exports = app;
