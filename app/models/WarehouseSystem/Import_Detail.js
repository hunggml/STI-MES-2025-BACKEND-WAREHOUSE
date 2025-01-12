'use strict'

const { model } = require('../../../services/model');
const apps = model({
    table: 'import_detail',
    fillable: [
        'command_import_id',
        'product_id',
        'location_id',
        'label',
        'lot_number',
        'quantity',
        'inventory',
        'status',
        'note',
        'user_created',
        'time_created',
        'user_updated',
        'time_updated',
        'user_imported',
        'time_imported',
        'isdelete'
    ],
    timestamps: true,
});


module.exports = apps;