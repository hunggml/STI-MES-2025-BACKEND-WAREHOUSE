'use strict'
const moment = require('moment');
const CommandImportModel = require('../../models/WarehouseSystem/Command_Import');
const ImportDetailModel = require('../../models/WarehouseSystem/Import_Detail');
const CommandExportModel = require('../../models/WarehouseSystem/Command_Export');
const ExportDetailModel = require('../../models/WarehouseSystem/Export_Detail');
const CheckToken = require('../CheckToken');
const CommandImportView = require('../../view/WarehouseSystem/Command_Import');
const ImportDetailView = require('../../view/WarehouseSystem/Import_Detail');
const CommandExportView = require('../../view/WarehouseSystem/Command_Export');
const ExportDetailView = require('../../view/WarehouseSystem/Export_Detail');
const LocationView = require('../../view/MasterData/Location');
const ProductView = require('../../view/MasterData/Product');
// command export
const GetDataCommandExport = async ( req ) => {

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
            key: "warehouse_export_id",
            value: req.warehouse_export_id 
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
        ,
        {
            key: "isdelete",
            value: 0
        }
    ];

    listCommandExports = await CommandExportView.get({
        where: whereConditions,
        orderBy: "time_updated DESC",
        limit: limit_page,
        offset,
    });


    const totalRecords = await CommandExportView.count({
        where: whereConditions,
    });
    // const totalPages = Math.ceil(totalRecords / limit_page);

    return {
        listCommandExports,
        // pagination: {
        //     currentPage: page,
        //     totalPages,
            totalRecords,
        // },
    };
}

const SendDataCommadExport = async (req, res) => {
    try {
        await CheckToken.checkToken(req,res);
        if(req.user)
        {
            let datas = await GetDataCommandExport(req.query);
            return res.status(200).send(datas);
        }
        
    }
    catch(e) {
        console.log(e)
    }
}

const CreateCommandExport = async (req, res) => {
    try {
        await CheckToken.checkToken(req,res);
        let request = req.body;
        let user_id = req.user;
        var array_datas_export_detail = [];
        var array_datas_errors = [];
        let time    = moment().format('YYYY-MM-DD HH:mm:ss');
        if(user_id)
        {
            let check_symbols_command_export = await CommandExportView.first({
                where: [
                    {
                        key: "symbols",
                        value: request.symbols 
                    },
                    {
                        key: "isdelete",
                        value: 0 
                    }
                ],
                orderBy: "time_updated DESC"
            });
            if(check_symbols_command_export)
            {
                return res.status(500).send({
                    message: 38
                });
            }

            await Promise.all(request.products.map(async (v) =>
            {
                let quantity_need = v.quantity;
                let get_data_stock = await ImportDetailView.get({
                    where: [
                        {
                            key:"isdelete",
                            value: 0
                        },
                        {
                            key:"inventory",
                            value: 0
                        },
                        {
                            key:"status",
                            value: 2
                        },
                        {
                            key:"product_id",
                            value: v.product_id
                        },
                        {
                            key:"warehouse_import_id",
                            value: request.warehouse_export_id
                        }
                    ],
                    orderBy: "time_imported ASC",
                })
                let get_data_product = await ProductView.first({
                    where: [{ key:'id', value:v.product_id}]
                });
                let get_sum_stock = await ImportDetailView.sum({
                    where: [
                        { key: "isdelete", value: 0 },
                        { key: "status", value: 2 },
                        { key: "warehouse_import_id", value: request.warehouse_export_id }
                    ],
                    select: "inventory",
                    orderBy: "time_updated DESC"
                })
                if(get_data_stock.length > 0 && quantity_need <= get_sum_stock)
                {
                    await Promise.all(get_data_stock.map(async (value_stock) => {
                        if(quantity_need > 0)
                        {
                            let data = {
                                // command_export_id   : 1,
                                command_export_id   : null,
                                import_detail_id    : value_stock.id,
                                product_id          : value_stock.product_id,
                                label               : value_stock.label,
                                lot_number          : value_stock.lot_number,
                                location_export_id  : value_stock.location_id,
                                quantity            : value_stock.inventory,
                                quantity_exported   : null,
                                status              : 1,
                                type                : 1,
                                note                : v.note ?? '',
                                user_created        : user_id,
                                user_updated        : user_id,
                                time_created        : time,
                                time_updated        : time,
                                isdelete            : 0,
                            }
                            quantity_need = quantity_need - value_stock.inventory;
                            array_datas_export_detail.push(data);
                        }
                    }))
                }
                else
                {
                    let error = {
                        product_name :get_data_product.name ?? v.product_id,
                        product_symbols : get_data_product.symbols ?? v.product_id,
                        quantity : quantity_need
                    }
                    array_datas_errors.push(error)
                }
            }))

            if(array_datas_errors.length > 0 )
            {
                return res.status(500).send({
                    message: 43,
                    data_errors : array_datas_errors
                });
            }
            else
            {
                await CommandExportModel.insert([
                    { 
                        name                : request.name ?? '',
                        symbols             : request.symbols ?? '',
                        note                : request.note ?? '',
                        warehouse_export_id : request.warehouse_export_id ?? 0,
                        warehouse_import_id : request.warehouse_import_id ?? 0,
                        user_created        : user_id,
                        user_updated        : user_id,
                        time_created        : time,
                        time_updated        : time,
                        isdelete            : 0,
                    },
                ]);
    
                const get_data_command_export_new = await CommandExportView.first({
                    where: [
                        {
                            key: "symbols",
                            value: request.symbols 
                        },
                        {
                            key: "isdelete",
                            value: 0 
                        }
                    ],
                    orderBy: "time_updated DESC"
                });

                await ExportDetailModel.insert(array_datas_export_detail);
                await ExportDetailModel.query(`update export_detail set command_export_id = ${get_data_command_export_new.id} where command_export_id is null and status = 1`)
                return res.status(200).send({
                    message: 39
                });
            }
        }
    }
    catch(e) {
        console.log(e);
    }
}

const DistinctDataCommandExport = async (req) => {

    let page        = req.page;
    let limit_page  = 10;

    const offset = (page - 1) * limit_page;
    const DistinctConditions = {
            key: req.columns,
            value: req.value 
        }
    ;

    let listData = await CommandExportView.selectDistinct({
        distinct: DistinctConditions,
        limit: limit_page,
        offset,
    });

    const totalRecords = await CommandExportView.countDistinct({
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

const SendDistinctCommandExport = async (req,res) => {
    try {
        await CheckToken.checkToken(req,res);
        if(req.user)
        {
            let datas = await DistinctDataCommandExport(req.query);
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

// export detail
const GetDataExportDetail = async ( req ) => {

    let page        = req.page;
    let limit_page  = req.limit_page;

    const offset = (page - 1) * limit_page;
    const whereConditions = [
        {
            key: "command_export_id",
            value : req.command_export_id
        },
        {
            key: "product_id",
            value: req.product_id 
        },
        {
            key: "warehouse_export_id",
            value: req.warehouse_export_id 
        },
        {
            key: "warehouse_import_id",
            value: req.warehouse_import_id 
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

    listExportDetails = await ExportDetailView.get({
        where: whereConditions,
        orderBy: "time_updated DESC",
        limit: limit_page,
        offset,
    });


    const totalRecords = await ExportDetailView.count({
        where: whereConditions,
    });
    // const totalPages = Math.ceil(totalRecords / limit_page);

    return {
        listExportDetails,
        // pagination: {
        //     currentPage: page,
        //     totalPages,
            totalRecords,
        // },
    };
}

const SendDataExportDetail = async (req, res) => {
    try {
        await CheckToken.checkToken(req,res);
        if(req.user)
        {
            let datas = await GetDataExportDetail(req.query);
            return res.status(200).send(datas);
        }
    }
    catch(e) {
        console.log(e);
    }
}

const DistinctDataExportDetail = async (req) => {

    let page        = req.page;
    let limit_page  = 10;

    const offset = (page - 1) * limit_page;
    const DistinctConditions = {
            key: req.columns,
            value: req.value 
        }
    ;

    let listData = await ExportDetailView.selectDistinct({
        distinct: DistinctConditions,
        limit: limit_page,
        offset,
    });

    const totalRecords = await ExportDetailView.countDistinct({
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

const SendDistinctExportDetail = async (req,res) => {
    try {
        await CheckToken.checkToken(req,res);
        if(req.user)
        {
            let datas = await DistinctDataExportDetail(req.query);
            return res.status(200).send(datas);
        }
    }
    catch(e) {
        console.log(e);
    }
} 

const GetDataBeforeExport = async ( req ) => {

    // console.log(req);
    let listData            = [];
    let datas               = req.data_labels ? Object.values(req.data_labels) : [];

    for(let i = 0; i < datas.length ; i++)
    {
        let check_label = await ExportDetailView.first({
            where: [
                {
                    key: "label",
                    value: datas[i].label
                }
            ],
            orderBy: "time_updated DESC"
        });
        if(check_label)
        {
            let check_location = await LocationView.first({
                where: [
                    {
                        key: "id",
                        value: check_label.location_export_id
                    }
                ],
                orderBy: "time_updated DESC"
            });
            let result = {
                label           : check_label.label,
                status_led      : check_location.status_led,
                location_name   : check_location.name,
                location_symbols: check_location.symbols,
                location_id     : check_location.id,
                status          : check_label.status,
                r               : check_location.r,
                g               : check_location.g,
                b               : check_location.b
            };
            listData.push(result);
        }
    }
    
    return {listData};
}

const SendDataBeforeExport = async (req, res) => {
    try {
        await CheckToken.checkToken(req,res);
        if(req.user)
        {
            let datas = await GetDataBeforeExport(req.query);
            return res.status(200).send(datas);
        }
    }
    catch(e) {
        console.log(e);
    }
}


const ExportWarehouse = async (req, res) => {
    // try {
        await CheckToken.checkToken(req,res);
        let request             = req.body;
        let user_id             = req.user;
        let time                = moment().format('YYYY-MM-DD HH:mm:ss');
        let time_command_import = moment().format('YYYYMMDDHHmmss');
        let array_datas_import  = [];
        var array_errors        = [];
        if(user_id)
        {
            let get_data_warehouse_import = await CommandExportView.first({
                where : [
                    {
                        key: 'id',
                        value: request.command_export_id
                    }
                ]
            });
            // console.log(get_data_warehouse_import);
            // check du lieu tung thang
            await Promise.all(request.data_exports.map(async (v) => {
                let check_label = await ExportDetailView.first({
                    where: [
                        {
                            key : "label",
                            value : v.label
                        },
                        {
                            key : "command_export_id",
                            value : request.command_export_id
                        }
                    ],
                    orderBy: 'time_created desc'
                })

                let check_label_stock = await ImportDetailView.first({
                    where: [
                        {
                            key : "id",
                            value : check_label.import_detail_id
                        }
                        
                    ],
                    orderBy: 'time_created desc'
                })
                if(check_label && check_label_stock)
                {
                    if(check_label.location_export_symbols == v.location_symbols)
                    {
                        // b1 : update xuat kho
                        await ExportDetailModel.query(`update export_detail set status = 2, quantity_exported=${v.quantity},user_updated=${user_id},time_updated="${time}" where id=${check_label.id}`);
                        // b2 : update ton kho
                        await ImportDetailModel.query(`update import_detail set inventory= inventory - ${v.quantity},user_updated=${user_id},time_updated="${time}" where id=${check_label.id}`);

                        let data_import = {
                            command_import_id   : null,
                            product_id          : check_label.product_id,
                            location_id         : null,
                            label               : check_label.label,
                            lot_number          : check_label.lot_number,
                            quantity            : v.quantity,
                            inventory           : null,
                            status              : 1,
                            type                : 3,
                            note                : check_label.note ?? '',
                            user_created        : user_id,
                            user_updated        : user_id,
                            user_imported       : null,
                            time_created        : time,
                            time_updated        : time,
                            time_imported       : null,
                            isdelete            : 0,
                        }
    
                        array_datas_import.push(data_import);
                    }
                    else
                    {
                        array_errors.push(check_label.label)
                    }
                }
                else
                {
                    array_errors.push(v.label)
                }
            }));

            await ImportDetailModel.insert(array_datas_import);
            await CommandImportModel.insert([
                { 
                    name                : `Lệnh Nhập Kho -${time_command_import}`,
                    symbols             : `LNK-${time_command_import}`,
                    note                : null,
                    warehouse_import_id : get_data_warehouse_import.warehouse_import_id,
                    user_created        : user_id,
                    user_updated        : user_id,
                    time_created        : time,
                    time_updated        : time,
                    isdelete            : 0,
                },
            ]);

            let get_id_command_improt = await CommandImportView.first({
                where: [
                    {
                        key: "symbols",
                        value: request.symbols 
                    }
                ],
                orderBy: "time_updated DESC"
            });

            await ImportDetailModel.query(`update import_detail set command_import_id = ${get_id_command_improt.id} where command_import_id is null and type = 3`)

            if(array_errors.length > 0)
            {
                return res.status(500).send({
                    message: 41,
                    data_labels : array_errors
                });
            }
            return res.status(200).send({
                message: 42,
                data_labels : array_errors
            });            
        }
    // }
    // catch(e) {
    //     console.log(e);
    // }
}

module.exports = {
    GetDataCommandExport,
    SendDataCommadExport,
    CreateCommandExport,
    DistinctDataCommandExport,
    SendDistinctCommandExport,
    GetDataExportDetail,
    SendDataExportDetail,
    DistinctDataExportDetail,
    SendDistinctExportDetail,
    GetDataBeforeExport,
    SendDataBeforeExport,
    ExportWarehouse,
}