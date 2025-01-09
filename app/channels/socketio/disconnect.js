'use strict'
const { cacheDeleteClient } = require('../../../config/cache');

const disconnectIo = (socket) => {
    socket.on('disconnect', async () => {
        console.log('disconnect');
    });
}

module.exports = disconnectIo;