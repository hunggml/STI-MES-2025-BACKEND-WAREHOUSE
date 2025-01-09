'use strict'

const { model } = require('../../../services/model');
const apps = model({
    table: 'master_product',
    fillable: [
        'name',
        'symbols',
        'unit',
        'stock_min',
        'stock_max',
        'price',
        'note',
        'type',
        'user_created',
        'time_created',
        'user_updated',
        'time_updated',
        'isdelete'
    ],
    timestamps: true,
});


module.exports = apps;