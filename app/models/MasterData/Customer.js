'use strict'

const { model } = require('../../../services/model');
const apps = model({
    table: 'master_customer',
    fillable: [
        'name',
        'symbols',
        'tax',
        'address',
        'email',
        'type',
        'note',
        'user_created',
        'time_created',
        'user_updated',
        'time_updated',
        'isdelete'
    ],
    timestamps: true,
});


module.exports = apps;