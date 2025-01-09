'use strict'

const { model } = require('../../../services/model');
const apps = model({
    table: 'master_product_view',
    fillable: [
        'id',
        'name',
        'symbols',
        'unit',
        'stock_min',
        'stock_max',
        'price',
        'type',
        'note',
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