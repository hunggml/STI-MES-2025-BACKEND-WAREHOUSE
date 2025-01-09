'use strict'

const { consoleLog } = require('../../../config/app');
const connectIo = (socket) => {
    const user_id = socket.id
    console.log(user_id + '- connect');
    socket.join('notification');
    console.log(socket.rooms);
};


module.exports = connectIo;