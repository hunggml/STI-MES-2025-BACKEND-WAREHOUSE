'use strict'

const { model } = require('../../../services/model');
const apps = model({
    table: 'import_detail_view',
    fillable: [
        'id',
        'command_import_id',
        'product_id',
        'location_id',
        'label',
        'lot_number',
        'quantity',
        'inventory',
        'status',
        'type',
        'note',
        'user_created',
        'user_created_id',
        'time_created',
        'user_updated',
        'user_updated_id',
        'time_updated',
        'user_imported',
        'user_imported_id',
        'time_imported',
        'command_import_name',
        'command_import_symbols',
        'command_import_name',
        'product_name',
        'product_symbols',
        'product_unit',
        'warehouse_import_id',
        'warehouse_name',
        'warehouse_symbols',
        'location_name',
        'location_symbols',
        'isdelete'
    ],
    timestamps: true,
});


module.exports = apps;