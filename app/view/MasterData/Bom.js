'use strict'

const { model } = require('../../../services/model');
const apps = model({
    table: 'master_bom_view',
    fillable: [
        'id',
        'product_id',
        'semi_product',
        'quantity_use',
        'user_created',
        'user_created_id',
        'time_created',
        'user_updated',
        'user_updated_id',
        'time_updated',
        'product_name',
        'product_symbols',
        'semi_product_name',
        'semi_product_symbols',
        'isdelete'
    ],
    timestamps: true,
});


module.exports = apps;