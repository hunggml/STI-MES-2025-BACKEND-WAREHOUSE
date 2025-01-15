'use strict'

const { model } = require('../../../services/model');
const apps = model({
    table: 'command_export_view',
    fillable: [
        'id',
        'name',
        'symbols',
        'note',
        'warehouse_export_id',
        'warehouse_import_id',
        'user_created',
        'user_created_id',
        'time_created',
        'user_updated',
        'user_updated_id',
        'time_updated',
        'warehouse_export_name',
        'warehouse_export_symbols',
        'warehouse_import_name',
        'warehouse_import_symbols',
        'isdelete'
    ],
    timestamps: true,
});


module.exports = apps;