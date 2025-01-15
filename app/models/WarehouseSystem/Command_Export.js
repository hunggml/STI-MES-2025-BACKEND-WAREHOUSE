'use strict'

const { model } = require('../../../services/model');
const apps = model({
    table: 'command_export',
    fillable: [
        'name',
        'symbols',
        'warehouse_export_id',
        'warehouse_import_id',
        'note',
        'user_created',
        'time_created',
        'user_updated',
        'time_updated',
        'isdelete'
    ],
    timestamps: true,
});


module.exports = apps;