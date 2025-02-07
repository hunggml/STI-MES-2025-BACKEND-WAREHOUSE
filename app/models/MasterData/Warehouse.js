'use strict'

const { model } = require('../../../services/model');
const apps = model({
    table: 'master_warehouse',
    fillable: [
        'name',
        'symbols',
        'note',
        'position_x',
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