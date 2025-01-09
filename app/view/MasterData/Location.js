'use strict'

const { model } = require('../../../services/model');
const apps = model({
    table: 'master_location_view',
    fillable: [
        'id',
        'name',
        'symbols',
        'stock_min',
        'stock_max',
        'note',
        'warehouse_id',
        'position_x',
        'position_y',
        'position_z',
        'warehouse_name',
        'warehouse_symbols',
        'user_created',
        'user_created_id',
        'time_created',
        'user_updated',
        'user_updated_id',
        'time_updated',
        'isdelete'
    ],
    timestamps: true,
});


module.exports = apps;