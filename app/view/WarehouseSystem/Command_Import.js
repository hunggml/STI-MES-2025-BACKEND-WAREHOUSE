'use strict'

const { model } = require('../../../services/model');
const apps = model({
    table: 'command_import_view',
    fillable: [
        'id',
        'name',
        'symbols',
        'warehouse_import_id',
        'note',
        'user_created',
        'user_created_id',
        'time_created',
        'user_updated',
        'user_updated_id',
        'time_updated',
        'warehouse_name',
        'warehouse_symbols',
        'isdelete'
    ],
    timestamps: true,
});


module.exports = apps;