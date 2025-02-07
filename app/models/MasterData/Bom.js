'use strict'

const { model } = require('../../../services/model');
const apps = model({
    table: 'master_bom',
    fillable: [
        'product_id',
        'semi_product_id',
        'quantity_use',
        'user_created',
        'time_created',
        'user_updated',
        'time_updated',
        'isdelete'
    ],
    timestamps: true,
});


module.exports = apps;