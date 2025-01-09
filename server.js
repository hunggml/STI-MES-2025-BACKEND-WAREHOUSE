'use strict'

console.log("Start Server");
require('dotenv').config();
require('./helpers/helper.js');
require('./config/logging.js');
require('./services/router.js');
require('./queue/queue.js');