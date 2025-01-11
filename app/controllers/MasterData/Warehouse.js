'use strict'
const moment = require('moment');
const WarehouseModel = require('../../models/MasterData/Warehouse');
const LocationModel = require('../../models/MasterData/Location');
const CheckToken = require('../CheckToken');
const WarehouseView = require('../../view/MasterData/Warehouse');


const GetDataWarehouse = async ( req ) => {

    let page        = req.page;
    let limit_page  = req.limit_page;

    const offset = (page - 1) * limit_page;
    const whereConditions = [
        {
        key: "name",
        value: req.name 
        },
        {
            key: "symbols",
            value: req.symbols 
        },
        {
            key: "tax",
            value: req.tax 
        },
        {
            key: "type",
            value: req.type 
        }
        // ,
        // {
        //     key: "isdelete",
        //     value: 0
        // }
    ];

    listWarehouses = await WarehouseView.get({
        where: whereConditions,
        orderBy: "time_updated DESC",
        limit: limit_page,
        offset,
    });


    const totalRecords = await WarehouseView.count({
        where: whereConditions,
    });
    // const totalPages = Math.ceil(totalRecords / limit_page);

    return {
        listWarehouses,
        // pagination: {
        //     currentPage: page,
        //     totalPages,
            totalRecords,
        // },
    };
}

const SendDataWarehouse = async (req, res) => {
    try {
        await CheckToken.checkToken(req,res);
        let datas = await GetDataWarehouse(req.query);
        return res.status(200).send(datas);
        
    }
    catch(e) {
        console.log(e);
    }
}

const SettingWarehouse = async (req, res) => {
    try {
        await CheckToken.checkToken(req,res);
        let request = req.body;
        let user_id = req.user;
        var array_locations = [];
        console.log(request);
        let time    = moment().format('YYYY-MM-DD HH:mm:ss');
        if(user_id)
        {
            let check_symbols_warehouse = await WarehouseView.first({
                where: [
                    {
                        key: "symbols",
                        value: request.symbols 
                    }
                ],
                orderBy: "time_updated DESC"
            });

            if(request.id)
            {
                let data = {
                    name            : request.name ?? '',
                    symbols         : request.symbols ?? '',
                    note            : request.note ?? '',
                    position_x      : 0,
                    position_z      : 0,
                    user_updated    : user_id,
                    time_updated    : time,
                };
                const check_warehouse = await WarehouseView.first({
                    where: [
                        {
                            key: "id",
                            value: request.id 
                        }
                    ],
                    orderBy: "time_updated DESC"
                });

                if(check_warehouse)
                {
                    if(check_symbols_warehouse && check_symbols_warehouse.id != request.id)
                    {
                        return res.status(500).send({
                            message: 21
                        });
                    }
                    
                    await WarehouseModel.update(
                        data,
                        { where: [`id = ${request.id}`] }
                    );
    
                    return res.status(200).send({
                        message: 22
                    });
                }
                else
                {
                    return res.status(500).send({
                        message: 23
                    });
                }
            }
            else
            {
                
                if(check_symbols_warehouse)
                {
                    return res.status(500).send({
                        message: 21
                    });
                }

                await WarehouseModel.insert([
                    { 
                        name            : request.name ?? '',
                        symbols         : request.symbols ?? '',
                        note            : request.note ?? '',
                        position_x      : 0,
                        position_z      : 0,
                        user_created    : user_id,
                        user_updated    : user_id,
                        time_created    : time,
                        time_updated    : time,
                        isdelete        : 0,
                    },
                ]);

                const get_data_warehouse_new = await WarehouseView.first({
                    where: [
                        {
                            key: "symbols",
                            value: request.symbols 
                        }
                    ],
                    orderBy: "time_updated DESC"
                });

                
                let position_x = 1;
                for(let x = 1 ; x <= request.row; x++)
                {
                    let position_y = 1;
                    for(let y = 1 ; y <= request.floor; y++)
                    {
                        let position_z = 1;
                        for(let z = 1 ; z <= request.column; z++)
                        {
                            let array_data = {
                                name            : `${request.name}-${position_x}-${position_y}-${position_z}`,
                                symbols         : `${request.symbols}-${position_x}-${position_y}-${position_z}`,
                                stock_min       : 0,
                                stock_max       : 0,
                                note            : '',
                                warehouse_id    : get_data_warehouse_new.id,
                                position_x      : position_x,
                                position_y      : position_y,
                                position_z      : position_z,
                                user_created    : user_id,
                                user_updated    : user_id,
                                time_created    : time,
                                time_updated    : time,
                                isdelete        : 0,
                            }
                            array_locations.push(array_data);
                            position_z += 3;
                        }
                        position_y += 3;
                    }
                    position_x += 3;
                }
                await LocationModel.insert(array_locations);

                return res.status(200).send({
                    message: 22
                });
            }
        }
    }
    catch(e) {
        console.log(e);
    }
}

const LockWarehouse = async (req, res) => {
    try {
        await CheckToken.checkToken(req,res);
        let request = req.body;
        let user_id = req.user;
        let time = moment().format('YYYY-MM-DD HH:mm:ss');
        if(user_id)
        {
            if(request.id)
            {
                let check_warehouse = await WarehouseView.first({
                    where: [
                        {
                            key: "id",
                            value: request.id 
                        }
                    ],
                    orderBy: "time_updated DESC"
                });
                if(check_warehouse)
                {
                    let data = {
                        time_updated : time,
                        user_updated : user_id,
                        isdelete     : check_warehouse.isdelete == 1 ? 0 : 1,
                    };
                    await WarehouseModel.update(
                        data,
                        { where: [`id = ${request.id}`] }
                    );
                    
                    return res.status(200).send({
                        message: check_warehouse.isdelete == 0 ? 24 : 25
                    });
                }
                else
                {
                    return res.status(500).send({
                        message: 23
                    });
                }
            }
        }
    }
    catch(e) {
        console.log(e);
    }
}

const DistinctData = async (req) => {

    let page        = req.page;
    let limit_page  = 10;

    const offset = (page - 1) * limit_page;
    const DistinctConditions = {
            key: req.columns,
            value: req.value 
        }
    ;

    let listData = await WarehouseView.selectDistinct({
        distinct: DistinctConditions,
        limit: limit_page,
        offset,
    });

    const totalRecords = await WarehouseView.countDistinct({
        distinct: DistinctConditions,
    });
    const last_page = Math.ceil(totalRecords / limit_page);

    return {
        listData,
        pagination: {
            current_page: page,
            last_page,
        },
    };
}

const SendDistinctWarehouse = async (req,res) => {
    try {
        await CheckToken.checkToken(req,res);
        let datas = await DistinctData(req.query);
        return res.status(200).send(datas);
    }
    catch(e) {
        console.log(e);
    }
} 


module.exports = {
    GetDataWarehouse,
    SendDataWarehouse,
    SettingWarehouse,
    LockWarehouse,
    SendDistinctWarehouse,
    DistinctData
}