'use strict'
const moment = require('moment');
const CommandImportModel = require('../../models/WarehouseSystem/Command_Import');
const ImportDetailModel = require('../../models/WarehouseSystem/Import_Detail');
const CheckToken = require('../CheckToken');
const CommandImportView = require('../../view/WarehouseSystem/Command_Import');
const ImportDetailView = require('../../view/WarehouseSystem/Import_Detail');

const GetDataCommandImport = async ( req ) => {

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
            value: moment(req.datepicker[0]).format('YYYY-MM-DD')
        },
        {
            key: "to",
            value: moment(req.datepicker[1]).format('YYYY-MM-DD')
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
        // console.log(req.query);
        await CheckToken.checkToken(req,res);
        let datas = await GetDataCommandImport(req.query);

        return res.status(200).send(datas);
        
    }
    catch {

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
                
                for(let i = 0 ; i < get_datas ; i++)
                {
                    let data = {
                        command_import_id   : get_data_command_import_new.id,
                        product_id          : v.product_id,
                        location_id         : null,
                        label               : `${time_label}${get_data_command_import_new.id}${v.product_id}${i}`,
                        quantity            : result[i],
                        inventory           : null,
                        status              : 1,
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

            return res.status(200).send({
                message: 34
            });
            
        }
    }
    catch(e) {
        console.log(e);
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
        let datas = await DistinctDataCommandImport(req.query);

        return res.status(200).send(datas);
        
    }
    catch {

    }
} 


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
            value: req.name 
        },
        {
            key: "location_id",
            value: req.symbols 
        },
        {
            key: "status",
            value: req.warehouse_import_id 
        },
        {
            key: "from",
            value: moment(req.datepicker[0]).format('YYYY-MM-DD')
        },
        {
            key: "to",
            value: moment(req.datepicker[1]).format('YYYY-MM-DD')
        },
        {
            key: "user_imported_id",
            value: req.user_imported_id 
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
        let datas = await GetDataImportDetail(req.query);
        return res.status(200).send(datas);
    }
    catch {

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
        let datas = await DistinctDataImportDetail(req.query);
        return res.status(200).send(datas);
        
    }
    catch {

    }
} 

const ImportWarehouse = async (req, res) => {
    try {
        await CheckToken.checkToken(req,res);
        let request = req.body;
        let user_id = req.user;
        let time    = moment().format('YYYY-MM-DD HH:mm:ss');
        if(user_id)
        {
            for(let i = 0 ; i < request.data_imports.length; i ++ )
            {

                let check_label = await ImportDetailView.first({
                    where: [
                        {
                            key: "label",
                            value: request.data_imports[i].label
                        }
                    ],
                    orderBy: "time_updated DESC"
                });
                if(check_label)
                {
                    let data = {
                        command_import_id   : check_label.id,
                        product_id          : check_label.product_id,
                        location_id         : request.data_imports[i].location_id,
                        label               : check_label.label,
                        quantity            : check_label.quantity,
                        inventory           : check_label.quantity,
                        status              : 2,
                        note                : check_label.note,
                        user_created        : check_label.user_created_id,
                        user_updated        : user_id,
                        user_imported       : user_id,
                        time_created        : moment(check_label.time_created).format('YYYY-MM-DD hh:mm:ss'),
                        time_updated        : time,
                        time_imported       : time,
                        isdelete            : 0,
                    }
    
                    ImportDetailModel.update(
                        data,
                        { where: [`id = ${check_label.id}`] }
                    );
                }
            }
            return res.status(200).send({
                message: 35
            });
            
        }
    }
    catch(e) {
        console.log(e);
    }
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
    ImportWarehouse
}