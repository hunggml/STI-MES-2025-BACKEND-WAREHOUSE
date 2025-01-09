'use strict'

const { model } = require('../../../services/model');
const apps = model({
    table: 'master_location',
    fillable: [
        'name',
        'symbols',
        'stock_min',
        'stock_max',
        'note',
        'warehouse_id',
        'position_x',
        'position_y',
        'position_z',
        'user_created',
        'time_created',
        'user_updated',
        'time_updated',
        'isdelete'
    ],
    timestamps: true,
});


module.exports = apps;