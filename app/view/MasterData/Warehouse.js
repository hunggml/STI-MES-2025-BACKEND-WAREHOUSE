'use strict'

const { model } = require('../../../services/model');
const apps = model({
    table: 'master_warehouse_view',
    fillable: [
        'id',
        'name',
        'symbols',
        'note',
        'position_x',
        'position_y',
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