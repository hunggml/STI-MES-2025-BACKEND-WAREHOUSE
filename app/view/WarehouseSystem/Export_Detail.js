'use strict'

const { model } = require('../../../services/model');
const apps = model({
    table: 'export_detail_view',
    fillable: [
        'id',
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
        'user_created_id',
        'time_created',
        'user_updated',
        'user_updated_id',
        'time_updated',
        'command_export_name',
        'command_export_symbols',
        'product_name',
        'product_symbols',
        'product_unit',
        'status_led',
        'location_export_name',
        'location_export_symbols',
        'warehouse_export_id',
        'warehouse_export_name',
        'warehouse_export_symbols',
        'warehouse_import_id',
        'warehouse_import_name',
        'warehouse_import_symbols',
        'isdelete'
    ],
    timestamps: true,
});


module.exports = apps;