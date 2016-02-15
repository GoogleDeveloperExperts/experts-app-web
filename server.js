// *****************************************
//   server.js - GDE Tracking App
//   2015, by GDE Trackin App Team
// *****************************************

// Import configurations
var config       = require('./config.json');
// Install NodeJS Dependencies -> Express http://expressjs.com/
var express      = require('express');
// Initialize the application
var server       = express();

/**
*  Launchs express server
*  @method startServer
*  @return {string} Console log
*/
var startServer  = function() {
  server.use(express.static('public'));
  server.listen(config.express.port);
//** Console log - delete first '/' on this line to disable -
  console.log('_____________________');
  console.log('Express server launched');
  console.log('port: '+config.express.port);
  console.log('_____________________');
//*/
};

startServer();