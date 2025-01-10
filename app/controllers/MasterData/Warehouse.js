'use strict'
const moment = require('moment');
const WarehouseModel = require('../../models/MasterData/Warehouse');
const CheckToken = require('../CheckToken');
const env = require('dotenv').config();
var db = env.parsed.DB_DATABASE;
const ModelQuery = require("../../models/ModelQuery");
const WarehouseView = require('../../view/MasterData/Warehouse');

// const GetDataWarehouse = async () => {
//     listWarehouses = await WarehouseModel.get({
//         orderBy: "time_updated DESC",
//         offset: 0,
//     });
// }

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
        // console.log(req.query);
        // await CheckToken.checkToken(req,res);
        let datas = await GetDataWarehouse(req.query);
        // console.log(datas);

        return res.status(200).send(datas);
        
    }
    catch {

    }
}

const SettingWarehouse = async (req, res) => {
    try {
        await CheckToken.checkToken(req,res);
        let request = req.body;
        let user_id = req.user;
        // console.log(request);
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
                    name    : request.name ?? '',
                    symbols : request.symbols ?? '',
                    note    : request.note ?? '',
                    user_updated: user_id,
                    time_updated: time,
                };
                // const check_warehouse = listWarehouses.find(item => item.id == request.id);
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
                    // const check_symbols_warehouse_update = listWarehouses.find(item => item.symbols == request.symbols && item.id != request.id);
                    // const check_email_warehouse_update   = listWarehouses.find(item => item.email == request.email && item.id != request.id);
                    // const check_tax_warehouse_update     = listWarehouses.find(item => item.tax == request.tax && item.id != request.id);
                    
                    // const check_symbols_warehouse_update = await WarehouseView.first({
                    //     where: [
                    //         {
                    //             key: "symbols",
                    //             value: request.symbols 
                    //         }
                    //     ],
                    //     orderBy: "time_updated DESC"
                    // });

                    // const check_email_warehouse_update = await WarehouseView.first({
                    //     where: [
                    //         {
                    //             key: "email",
                    //             value: request.email 
                    //         }
                    //     ],
                    //     orderBy: "time_updated DESC"
                    // });

                    // const check_tax_warehouse_update = await WarehouseView.first({
                    //     where: [
                    //         {
                    //             key: "tax",
                    //             value: request.tax 
                    //         }
                    //     ],
                    //     orderBy: "time_updated DESC"
                    // });
                    
                    
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
                        name    : request.name ?? '',
                        symbols : request.symbols ?? '',
                        note    : request.note ?? '',
                        user_created: user_id,
                        user_updated: user_id,
                        time_created: time,
                        time_updated: time,
                        isdelete: 0,
                    },
                ]);

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
    // console.log(user_id);
        if(user_id)
        {
            if(request.id)
            {
                // const check_warehouse = listWarehouses.find(item => item.id == request.id);
                let check_warehouse = await WarehouseView.first({
                    where: [
                        {
                            key: "id",
                            value: request.id 
                        }
                    ],
                    orderBy: "time_updated DESC"
                });
                // console.log(check_warehouse.isdelete);
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
        // console.log(req.query);
        await CheckToken.checkToken(req,res);
        let datas = await DistinctData(req.query);
        // console.log(datas);

        return res.status(200).send(datas);
        
    }
    catch {

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