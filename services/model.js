'use strict';
const mysql = require('mysql2/promise'); // Thư viện MySQL

const config = require('../config/database'); // File cấu hình cơ sở dữ liệu
const { debug, consoleLog, queryLog } = require('../config/app');
const { split } = require('lodash');

const timeNow = () => {
    const datetime = new Date();
    const year = datetime.getFullYear();
    const month = String(datetime.getMonth() + 1).padStart(2, '0');
    const day = String(datetime.getDate()).padStart(2, '0');
    const hours = String(datetime.getHours()).padStart(2, '0');
    const minutes = String(datetime.getMinutes()).padStart(2, '0');
    const seconds = String(datetime.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};
// Kết nối MySQL
const pool = mysql.createPool(config.sqlConfig);
const model = (constructor = {
    table: '',
    fillable: [],
    timestamps: true,
    created_at: 'time_create',
    updated_at: 'time_update'
}) => {
    const { table, fillable, timestamps, created_at, updated_at } = constructor;
    const query = async (sql, params = []) => {
        try {
            const [results] = await pool.execute(sql, params);
            return results;
        } catch (err) {
            console.error('Error Query:', err.message);
            throw err;
        }
    };

    const get = async (request = {}) => {
        let whereClause = '';
        if(request.where)
        {
            let array_where = [];
            request.where.map(function(v){
                if(v.value != null && v.value != '' && v.value || v.value === 0)
                {
                    
                    if(typeof(v.value) != 'object')
                    {
                        if(v.key == 'from')
                        {
                            console.log(v.value);
                            array_where.push(`time_created >= '${v.value} 0:0:01'`);
                        }
                        else if(v.key == 'to')
                        {
                            array_where.push(`time_created <= '${v.value} 23:59:59'`);
                        }
                        else if(v.key == 'inventory')
                        {
                            array_where.push(`inventory > ${v.value}`);
                        }
                        else
                        {
                            array_where.push(`${v.key} = '${v.value}'`);
                        }
                    }
                    else
                    {
                        let value_string = '';
                        v.value.map(function(v,i)
                        {
                            value_string += `${i != 0 ? ',' : ''}'${v}'`;
                        })
                        array_where.push(`${v.key} in( ${value_string} )`);

                    }
                }
            });

            if(array_where.length > 0 )
            {
                whereClause = `WHERE ` + array_where.join(' AND ');
            }
        }
        if(request.whereElse && request.where)
        {
            let array_whereElse = [];
            let array_where_in_else = [];
            request.whereElse.map(function(v){
                if(v.value != null && v.value != '' && v.value || v.value === 0)
                {
                    let value_string = '';
                    v.value.map(function(v,i)
                    {
                        value_string += `${i != 0 ? ',' : ''}'${v}'`;
                    })
                    array_whereElse.push(`${v.key} not in( ${value_string} )`);
                }
            });
            request.where.map(function(v){
                if(v.value != null && v.value != '' && v.value || v.value === 0)
                {
                    array_where_in_else.push(`${v.key} = '${v.value}'`);    
                }
            });

            if(array_whereElse.length > 0 && array_where_in_else.length > 0)
            {
                whereClause = `WHERE ` + array_where_in_else.join(' AND ') + ' AND '+ array_whereElse.join(' AND ');
            }
        }

        const orderBy = request.orderBy ? `ORDER BY ${request.orderBy}` : '';
        const limit = request.limit ? `LIMIT ${request.limit}` : '';
        const offset = request.offset ? `OFFSET ${request.offset}` : '';
        let sql = `SELECT ${request.select || '*'} FROM ${table} ${whereClause} ${orderBy} ${limit} ${offset}`;
        // console.log(sql);
        if (queryLog) console.log(sql);
        return query(sql);
    };

    const selectDistinct = async (request = {}) => {
        let distinctClause = '';

        if(request.distinct)
        {
            let array_distinct = [];
                if(request.distinct.value != null && request.distinct.value != '' && request.distinct.value)
                {
                    array_distinct.push(`${request.distinct.key} like '%${request.distinct.value}%'`);
                }

            if(array_distinct.length > 0 )
            {
                distinctClause = `where ` + array_distinct.join(' AND ');
            }
        }

        const orderBy = request.orderBy ? `ORDER BY ${request.orderBy}` : '';
        const limit = request.limit ? `LIMIT ${request.limit}` : '';
        const offset = request.offset ? `OFFSET ${request.offset}` : '';

        let sql = `SELECT distinct id,${request.distinct.key} as column_name FROM ${table} ${distinctClause} ${orderBy} ${limit} ${offset}`;

        if (queryLog) console.log(sql);
        return query(sql);
    };

    const first = async (request = {}) => {
        const results = await get({ ...request, limit: 1 });
        return results[0] || null;
    };

    const insert = async (data = []) => {
        if (!data.length) return null;
        const columns = fillable.join(', ');
        const values = data.map(row => `(${fillable.map(col => row[col] == null ? 'NULL' : `'${row[col]}'`).join(', ')})`).join(', ');
        const params = data.flatMap(row => fillable.map(col => row[col]));
        const sql = `INSERT INTO ${table} (${columns}) VALUES ${values}`;
        // console.log(sql);
        if (queryLog) console.log(sql);
        return query(sql, params);
    };

    const update = async (data = {}, request = {}) => {
        const updates = Object.entries(data).map(([key, value]) => `${key} = '${value}'`).join(', ');
        const whereClause = request.where ? `WHERE ${request.where.join(' AND ')}` : '';
        const sql = `UPDATE ${table} SET ${updates} ${whereClause}`;
        const params = [...Object.values(data)];
        if (timestamps) params.push(timeNow());
        if (queryLog) console.log(sql);
        // console.log(sql);
        return query(sql, params);
    };

    const remove = async (request = {}) => {
        const whereClause = request.where ? `WHERE ${request.where.join(' AND ')}` : '';
        const sql = `DELETE FROM ${table} ${whereClause}`;
        if (queryLog) console.log(sql);
        return query(sql);
    };

    const count = async (request = {}) => {
        let whereClause = '';
        if(request.where)
        {
            let array_where = [];
            request.where.map(function(v){
                if(v.value != null && v.value != '' && v.value || v.value === 0)
                {
                    if(typeof(v.value) != 'object')
                    {
                        if(v.key == 'from')
                        {
                            array_where.push(`time_created >= '${v.value} 0:0:01'`);
                        }
                        else if(v.key == 'to')
                        {
                            array_where.push(`time_created <= '${v.value} 23:59:59'`);
                        }
                        else if(v.key == 'inventory')
                        {
                            array_where.push(`inventory > ${v.value}`);
                        }
                        else
                        {
                            array_where.push(`${v.key} = '${v.value}'`);
                        }
                        // array_where.push(`${v.key} = '${v.value}'`);
                    }
                    else
                    {
                        let value_string = '';
                        v.value.map(function(v,i)
                        {
                            value_string += `${i != 0 ? ',' : ''}'${v}'`;
                        })
                        array_where.push(`${v.key} in( ${value_string} )`);

                    }
                    // array_where.push(`${v.key} '${typeof(v.value) == 'string' ? '=' : 'in' }'`);
                }
            });

            if(array_where.length > 0 )
            {
                whereClause = `WHERE ` + array_where.join(' AND ');
            }
        }
        // const whereClause = request.where ? `WHERE ${request.where.join(' AND ')}` : '';
        const sql = `SELECT COUNT(id) AS count FROM ${table} ${whereClause}`;
        // console.log(sql);
        if (queryLog) console.log(sql);
        const results = await query(sql);
        return results[0]?.count || 0;
    };

    const sum = async (request = {}) => {
        let whereClause = '';
        if(request.where)
        {
            let array_where = [];
            request.where.map(function(v){
                if(v.value != null && v.value != '' && v.value || v.value === 0)
                {
                    if(typeof(v.value) != 'object')
                    {
                        if(v.key == 'from')
                        {
                            array_where.push(`time_created >= '${v.value} 0:0:01'`);
                        }
                        else if(v.key == 'to')
                        {
                            array_where.push(`time_created <= '${v.value} 23:59:59'`);
                        }
                        else
                        {
                            array_where.push(`${v.key} = '${v.value}'`);
                        }
                        // array_where.push(`${v.key} = '${v.value}'`);
                    }
                    else
                    {
                        let value_string = '';
                        v.value.map(function(v,i)
                        {
                            value_string += `${i != 0 ? ',' : ''}'${v}'`;
                        })
                        array_where.push(`${v.key} in( ${value_string} )`);

                    }
                    // array_where.push(`${v.key} '${typeof(v.value) == 'string' ? '=' : 'in' }'`);
                }
            });

            if(array_where.length > 0 )
            {
                whereClause = `WHERE ` + array_where.join(' AND ');
            }
        }
        // const whereClause = request.where ? `WHERE ${request.where.join(' AND ')}` : '';
        const sql = `SELECT sum(${request.select}) AS sum FROM ${table} ${whereClause}`;
        // console.log(sql);
        if (queryLog) console.log(sql);
        const results = await query(sql);
        return results[0]?.sum || 0;
    };

    const countDistinct = async (request = {}) => {
        let distinctClause = '';
        if(request.distinct)
        {
            let array_distinct = [];
                if(request.distinct.value != null && request.distinct.value != '' && request.distinct.value)
                {
                    array_distinct.push(`${request.distinct.key} like '%${request.distinct.value}%'`);
                }

            if(array_distinct.length > 0 )
            {
                distinctClause = `where ` + array_distinct.join(' AND ');
            }
        }
        const sql = `SELECT COUNT(id) AS count FROM ${table} ${distinctClause}`;
        if (queryLog) console.log(sql);
        const results = await query(sql);
        return results[0]?.count || 0;
    };

    return {
        query,
        get,
        first,
        insert,
        update,
        remove,
        count,
        selectDistinct,
        countDistinct,
        sum
    };
};

module.exports = { pool, model };
