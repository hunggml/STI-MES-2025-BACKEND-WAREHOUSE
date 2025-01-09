'use strict'

const { model } = require('../../services/model');
const userModel = model({
    table: 'users',       // Tên bảng trong cơ sở dữ liệu
    fillable: ['id','name', 'email', 'username', 'avatar'], // Các trường có thể điền
    timestamps: true,     // Bao gồm trường timestamps (created_at, updated_at)
});


module.exports = userModel;