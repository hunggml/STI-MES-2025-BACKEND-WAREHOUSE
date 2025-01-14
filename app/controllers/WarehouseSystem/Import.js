'use strict'
const moment = require('moment');
const CommandImportModel = require('../../models/WarehouseSystem/Command_Import');
const ImportDetailModel = require('../../models/WarehouseSystem/Import_Detail');
const CheckToken = require('../CheckToken');
const CommandImportView = require('../../view/WarehouseSystem/Command_Import');
const ImportDetailView = require('../../view/WarehouseSystem/Import_Detail');
const LocationView = require('../../view/MasterData/Location');
const LocationModel = require('../../models/MasterData/Location');

// command import
const GetDataCommandImport = async ( req ) => {

    // console.log(req);
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
            key: "warehouse_import_id",
            value: req.warehouse_import_id 
        },
        {
            key: "from",
            value: req.datepicker ? moment(req.datepicker[0]).format('YYYY-MM-DD') : ''
        },
        {
            key: "to",
            value: req.datepicker ? moment(req.datepicker[1]).format('YYYY-MM-DD') : ''
        },
        {
            key: "user_created_id",
            value: req.user_created_id 
        }
        // ,
        // {
        //     key: "isdelete",
        //     value: 0
        // }
    ];

    listCommandImports = await CommandImportView.get({
        where: whereConditions,
        orderBy: "time_updated DESC",
        limit: limit_page,
        offset,
    });


    const totalRecords = await CommandImportView.count({
        where: whereConditions,
    });
    // const totalPages = Math.ceil(totalRecords / limit_page);

    return {
        listCommandImports,
        // pagination: {
        //     currentPage: page,
        //     totalPages,
            totalRecords,
        // },
    };
}

const SendDataCommadImport = async (req, res) => {
    try {
        await CheckToken.checkToken(req,res);
        if(req.user)
        {
            let datas = await GetDataCommandImport(req.query);
            return res.status(200).send(datas);
        }
        
    }
    catch(e) {
        console.log(e);
        // return res.status(500).send({
        //     message: 40
        // });
    }
}

function divideNumberIntoChunks (number, chunkSize) {
    let result = [];
    while (number > 0) {
        if (number >= chunkSize) {
            result.push(chunkSize)
            number -= chunkSize;
        } else {
            result.push(number)
            number = 0;
        }
    }
    
    return result;
}

const CreateCommandImport = async (req, res) => {
    try {
        await CheckToken.checkToken(req,res);
        let request = req.body;
        let user_id = req.user;
        var array_datas = [];
        let time    = moment().format('YYYY-MM-DD HH:mm:ss');
        let time_label    = moment().format('YYYYMMDD');
        if(user_id)
        {
            let check_symbols_command_import = await CommandImportView.first({
                where: [
                    {
                        key: "symbols",
                        value: request.symbols 
                    }
                ],
                orderBy: "time_updated DESC"
            });

            
            if(check_symbols_command_import)
            {
                return res.status(500).send({
                    message: 33
                });
            }

            await CommandImportModel.insert([
                { 
                    name                : request.name ?? '',
                    symbols             : request.symbols ?? '',
                    note                : request.note ?? '',
                    warehouse_import_id : request.warehouse_import_id ?? 0,
                    user_created        : user_id,
                    user_updated        : user_id,
                    time_created        : time,
                    time_updated        : time,
                    isdelete            : 0,
                },
            ]);

            const get_data_command_import_new = await CommandImportView.first({
                where: [
                    {
                        key: "symbols",
                        value: request.symbols 
                    }
                ],
                orderBy: "time_updated DESC"
            });

            
            request.products.map(function(v)
            {
                let get_datas = Math.ceil(v.quantity / v.standard);
                let result = divideNumberIntoChunks(v.quantity, v.standard);
                for(let i = 0 ; i < get_datas ?? 1 ; i++)
                {
                    let data = {
                        command_import_id   : get_data_command_import_new.id,
                        product_id          : v.product_id,
                        location_id         : null,
                        label               : `${time_label}${get_data_command_import_new.id}${v.product_id}${i}`,
                        lot_number          : v.lot_number,
                        quantity            : result[i],
                        inventory           : null,
                        status              : 1,
                        type                : 1,
                        note                : v.note ?? '',
                        user_created        : user_id,
                        user_updated        : user_id,
                        user_imported       : null,
                        time_created        : time,
                        time_updated        : time,
                        time_imported       : null,
                        isdelete            : 0,
                    }

                    array_datas.push(data);
                }
                return array_datas;
            })
              
            await ImportDetailModel.insert(array_datas);
            await get_count_label_unimport();
            return res.status(200).send({
                message: 34
            });
            
        }
    }
    catch(e) {
        console.log(e);
        // return res.status(500).send({
        //     message: 40
        // });
    }
}

const DistinctDataCommandImport = async (req) => {

    let page        = req.page;
    let limit_page  = 10;

    const offset = (page - 1) * limit_page;
    const DistinctConditions = {
            key: req.columns,
            value: req.value 
        }
    ;

    let listData = await CommandImportView.selectDistinct({
        distinct: DistinctConditions,
        limit: limit_page,
        offset,
    });

    const totalRecords = await CommandImportView.countDistinct({
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

const SendDistinctCommandImport = async (req,res) => {
    try {
        await CheckToken.checkToken(req,res);
        if(req.user)
        {
            let datas = await DistinctDataCommandImport(req.query);
            return res.status(200).send(datas);
        }
        
    }
    catch(e) {
        console.log(e);
        // return res.status(500).send({
        //     message: 40
        // });
    }
} 

// import detail
const GetDataImportDetail = async ( req ) => {

    let page        = req.page;
    let limit_page  = req.limit_page;

    const offset = (page - 1) * limit_page;
    const whereConditions = [
        {
            key: "command_import_id",
            value : req.command_import_id
        },
        {
            key: "product_id",
            value: req.product_id 
        },
        {
            key: "status",
            value: req.status 
        },
        {
            key: "from",
            value: req.datepicker ? moment(req.datepicker[0]).format('YYYY-MM-DD') : ''
        },
        {
            key: "to",
            value: req.datepicker ? moment(req.datepicker[1]).format('YYYY-MM-DD') : ''
        },
        {
            key: "user_imported_id",
            value: req.user_imported_id 
        }
        ,
        {
            key: "warehouse_import_id",
            value: req.warehouse_import_id 
        },
        {
            key: "lot_number",
            value: req.lot_number 
        }
        // ,
        // {
        //     key: "isdelete",
        //     value: 0
        // }
    ];

    listImportDetails = await ImportDetailView.get({
        where: whereConditions,
        orderBy: "time_updated DESC",
        limit: limit_page,
        offset,
    });


    const totalRecords = await ImportDetailView.count({
        where: whereConditions,
    });
    // const totalPages = Math.ceil(totalRecords / limit_page);

    // console.log(listImportDetails);
    return {
        listImportDetails,
        // pagination: {
        //     currentPage: page,
        //     totalPages,
            totalRecords,
        // },
    };
}

const SendDataImportDetail = async (req, res) => {
    try {
        await CheckToken.checkToken(req,res);
        if(req.user)
        {
            let datas = await GetDataImportDetail(req.query);
            return res.status(200).send(datas);
        }
    }
    catch(e) {
        console.log(e);
    }
}

const DistinctDataImportDetail = async (req) => {

    let page        = req.page;
    let limit_page  = 10;

    const offset = (page - 1) * limit_page;
    const DistinctConditions = {
            key: req.columns,
            value: req.value 
        }
    ;

    let listData = await ImportDetailView.selectDistinct({
        distinct: DistinctConditions,
        limit: limit_page,
        offset,
    });

    const totalRecords = await ImportDetailView.countDistinct({
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

const SendDistinctImportDetail = async (req,res) => {
    try {
        await CheckToken.checkToken(req,res);
        if(req.user)
        {
            let datas = await DistinctDataImportDetail(req.query);
            return res.status(200).send(datas);
        }
    }
    catch(e) {
        console.log(e);
        // return res.status(500).send({
        //     message: 40
        // });
    }
} 

async function processLocations(get_location, check_label,quantity_need) {
    for (const v of get_location) {
        let get_stock = await ImportDetailView.sum({
            where: [
                { key: "isdelete", value: 0 },
                { key: "status", value: 2 },
                { key: "location_id", value: v.id }
            ],
            select: "inventory",
            orderBy: "time_updated DESC"
        });

        if(get_stock < v.stock_max && (v.stock_max - get_stock >= quantity_need))
        {
            let quantity_can_use = v.stock_max - (get_stock + quantity_need);
    
            // console.log(`stock : ${quantity_can_use}, need : ${quantity_need}, request : ${check_label.quantity}`)
            if (quantity_can_use < check_label.quantity) {
                return { 
                    result: {
                        label: check_label.label,
                        status_led: v.status_led,
                        location_name: v.name,
                        location_symbols: v.symbols,
                        location_id: v.id,
                        status : check_label.status,
                        r: v.r,
                        g: v.g,
                        b: v.b,
                    },
                    reset_quantity_need_return : 0,
                };
                
            }
            if (quantity_can_use > 0) {
                return { 
                    result: {
                        label: check_label.label,
                        status_led: v.status_led,
                        location_name: v.name,
                        location_symbols: v.symbols,
                        location_id: v.id,
                        status : check_label.status,
                        r: v.r,
                        g: v.g,
                        b: v.b,
                    },
                    reset_quantity_need_return : 1,
                };
                
            }
            else
            {
                return { 
                    result: {
                        label: check_label.label,
                        status_led: v.status_led,
                        location_name: v.name,
                        location_symbols: v.symbols,
                        location_id: v.id,
                        status : check_label.status,
                        r: v.r,
                        g: v.g,
                        b: v.b,
                    },
                    reset_quantity_need_return : 0,
                };        
            }
        }
    }

    return null;
}

const GetDataBeforeImport = async ( req ) => {

    // console.log(req);
    let datas = req.data_labels ? Object.values(req.data_labels) : [];
    let listData = [];
    let reset_quantity_need = 0;
    let quantity_need = 0;
    let location_id_used = [];
    for(let i = 0; i < (datas.length) ; i++)
    {
        let check_label = await ImportDetailView.first({
            where: [
                {
                    key: "status",
                    value: 1
                },
                {
                    key: "label",
                    value: datas[i].label
                }
            ],
            orderBy: "time_updated DESC"
        });

        let get_data_warehouse = await CommandImportView.first({
            where: [
                {
                    key: "id",
                    value: check_label.command_import_id
                }
            ],
            orderBy: "time_updated DESC"
        })

        let get_location = await LocationView.get({
            where:[
                {
                    key : 'warehouse_id',
                    value : get_data_warehouse.warehouse_import_id
                }
            ],
            whereElse:[
                {
                    key : 'id',
                    value : location_id_used
                }
            ],
            orderBy: "time_updated DESC"
        });
        if(reset_quantity_need == 0)
        {
            quantity_need = check_label.quantity
        }
        const { result, reset_quantity_need_return } = await processLocations(get_location, check_label,quantity_need);

        // console.log(reset_quantity_need_return,quantity_need)
        if(reset_quantity_need_return == 1)
        {
            quantity_need       += check_label.quantity;
            reset_quantity_need = 1
        }
        else
        {
            quantity_need       = check_label.quantity
            location_id_used.push(result.location_id)
            // console.log(location_id_used,check_label.label);
        }
        // console.log(reset_quantity_need_return);
        // check_location_used = result.location_id
        
        listData.push(result);

    }
    
    return {listData};
}

const SendDataBeforeImport = async (req, res) => {
    try {
        await CheckToken.checkToken(req,res);
        if(req.user)
        {
            let datas = await GetDataBeforeImport(req.body);
            return res.status(200).send(datas);
        }
    }
    catch(e) {
        console.log(e);
        // return res.status(500).send({
        //     message: 40
        // });
    }
}

const SettingLedLocation = async (req, res) => {
    try {
        await CheckToken.checkToken(req,res);
        let request = req.body;
        let user_id = req.user;
        let time    = moment().format('YYYY-MM-DD HH:mm:ss');
        // console.log(request)
        if(user_id)
        {
            request.listData.map(async (v) => {

                let check_location = await LocationView.first({
                    where: [
                        {
                            key: "id",
                            value: v.location_id
                        }
                    ],
                    orderBy: "time_updated DESC"
                });

                if(check_location)
                {
                    let sql = `update master_location set status_led = ${v.status_led ? 1 : 0}, r = ${v.r},g = ${v.g},b = ${v.b} where id = ${check_location.id}`
                    LocationModel.query(sql)
                }

            })
            return res.status(200).send({
                message: 36
            });
        }
    }
    catch(e) {
        console.log(e);
        // return res.status(500).send({
        //     message: 40
        // });
    }
}

const ImportWarehouse = async (req, res) => {
    try {
        await CheckToken.checkToken(req,res);
        let request = req.body;
        let user_id = req.user;
        let time    = moment().format('YYYY-MM-DD HH:mm:ss');
        // console.log(request);
        var array_errors = [];
        if(user_id)
        {
            await Promise.all(request.data_imports.map(async (v) => {
                let check_location = await LocationView.first({
                    where: [
                        {
                            key: "symbols",
                            value: v.location_symbols
                        }
                    ],
                    orderBy: "time_updated DESC"
                });
                let check_label = await ImportDetailView.first({
                    where: [
                        {
                            key: "label",
                            value: v.label
                        }
                    ],
                    orderBy: "time_updated DESC"
                });
                if(check_location && check_label)
                {
                    let get_stock = await ImportDetailView.sum({
                        where: [
                            { key: "isdelete", value: 0 },
                            { key: "status", value: 2 },
                            { key: "location_id", value: check_location.id }
                        ],
                        select: "inventory",
                        orderBy: "time_updated DESC"
                    });
                    let check_stock_can_import = check_location.stock_max - (get_stock + check_label.quantity);
                    if(check_stock_can_import >= 0)
                    {
                        let data = {
                            command_import_id   : check_label.command_import_id,
                            product_id          : check_label.product_id,
                            location_id         : check_location.id,
                            label               : check_label.label,
                            quantity            : check_label.quantity,
                            inventory           : check_label.quantity,
                            status              : 2,
                            type                : 1,
                            note                : check_label.note,
                            user_created        : check_label.user_created_id,
                            user_updated        : user_id,
                            user_imported       : user_id,
                            time_created        : moment(check_label.time_created).format('YYYY-MM-DD hh:mm:ss'),
                            time_updated        : time,
                            time_imported       : time,
                            isdelete            : 0,
                        }
        
                        await LocationModel.query(`update master_location set r=0,g=0,b=0,status_led=0 where id = ${check_location.id}`)
                        await ImportDetailModel.update(
                            data,
                            { where: [`id = ${check_label.id}`] }
                        );
                        await get_count_label_unimport();

                    }
                    else
                    {
                        array_errors.push(check_label.label);
                    }
                }
                else
                {
                    array_errors.push(v.label);
                }
                return array_errors
            }))
            if(array_errors.length > 0)
            {
                return res.status(500).send({
                    message: 37,
                    data_labels : array_errors
                });
            }
            return res.status(200).send({
                message: 35,
                data_labels : array_errors
            });
            
        }
    }
    catch(e) {
        console.log(e);
        // return res.status(500).send({
        //     message: 40
        // });
    }
}

async function get_count_label_unimport ()
// async function get_count_label_unimport (req,res)
{
    // try {
    //     await CheckToken.checkToken(req,res);
    //     let user_id = req.user;
    //     if(user_id)
    //     {
            let get_count_label = await ImportDetailView.count({
                where:[
                    {
                        key: "status",
                        value: 1
                    },
                    {
                        key: "isdelete",
                        value: 0
                    }
                ]
            });

            __io.emit('send_data_count_label_unimport',get_count_label)
            // return get_count_label;
    //     }
    // }
    // catch(e) {
    //     console.log(e);
    // }
}

module.exports = {
    GetDataCommandImport,
    SendDataCommadImport,
    CreateCommandImport,
    SendDistinctCommandImport,
    DistinctDataCommandImport,
    GetDataImportDetail,
    SendDataImportDetail,
    DistinctDataImportDetail,
    SendDistinctImportDetail,
    divideNumberIntoChunks,
    GetDataBeforeImport,
    SendDataBeforeImport,
    ImportWarehouse,
    SettingLedLocation,
    get_count_label_unimport
}