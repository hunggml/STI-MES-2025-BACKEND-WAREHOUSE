'use strict'

const { consoleLog } = require('../../../config/app');
const Import = require('../../controllers/WarehouseSystem/Import');

const connectIo = (socket) => {
    const user_id = socket.id
    console.log(user_id + '- connect');
    socket.join('notification');
    console.log(socket.rooms);
    Import.get_count_label_unimport()
};


module.exports = connectIo;