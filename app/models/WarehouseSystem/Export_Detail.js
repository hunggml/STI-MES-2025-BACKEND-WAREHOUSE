'use strict'

const { model } = require('../../../services/model');
const apps = model({
    table: 'export_detail',
    fillable: [
        'command_export_id',
        'import_detail_id',
        'product_id',
        'label',
        'lot_number',
        'quantity',
        'quantity_exported',
        'status',
        'type',
        'note',
        'location_export_id',
        'user_created',
        'time_created',
        'user_updated',
        'time_updated',
        'isdelete'
    ],
    timestamps: true,
});


module.exports = apps;