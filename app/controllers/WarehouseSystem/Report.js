'use strict'
const moment = require('moment');
const CheckToken = require('../CheckToken');
const ProductView = require('../../view/MasterData/Product');
const ProductModel = require('../../models/MasterData/Product');
const ImportDetailView = require('../../view/WarehouseSystem/Import_Detail');

const GetDataReportAll = async ( req ) => {

    let page        = req.page;
    let limit_page  = req.limit_page;
    let array_datas = [];
    const offset = (page - 1) * limit_page;
    const whereConditions = [
        {
            key: "name",
            value: req.name 
        },
        {
            key: "symbols",
            value: req.symbols 
        }
        // ,
        // {
        //     key: "isdelete",
        //     value: 0
        // }
    ];
    let warehouse   = req.warehouse_id.length > 0 ? req.warehouse_id.join(',') : 1;
    let from        = req.datepicker ? moment(req.datepicker[0]).format('YYYY-MM-DD') : moment().startOf('month').format('YYYY-MM-DD') + ' 0:0:01';
    let to          = req.datepicker ? moment(req.datepicker[1]).format('YYYY-MM-DD') : moment().format('YYYY-MM-DD') + ' 23:59:59';
    listProductsReport = await ProductView.get({
        where: whereConditions,
        orderBy: "id asc",
        limit: limit_page,
        offset,
    });

    listProductsReport = await Promise.all(listProductsReport.map(async (v) => {
        let data_procedure = await ProductModel.query(`CALL get_import_export_inventory(?, ?, ?, ?)`, [v.id, warehouse, from, to]);
        return {
            name                : v.name,
            symbols             : v.symbols,
            unit                : v.unit,
            price               : parseFloat(v.price.toFixed(2)),
            type                : v.type,
            stock_first         : data_procedure[0][0].stock_first,
            import              : data_procedure[0][0].import,
            reimport            : data_procedure[0][0].reimport,
            inventory_import    : data_procedure[0][0].inventory_import,
            export              : data_procedure[0][0].export,
            inventory_export    : data_procedure[0][0].inventory_export,
            stock_end           : data_procedure[0][0].stock_end,
        }
    }))

    const totalRecords = await ProductView.count({
        where: whereConditions,
    });

    return {
        listProductsReport,
        totalRecords,
    };
}

const SendDataReportAll = async (req, res) => {
    try {
        await CheckToken.checkToken(req,res);
        if(req.user)
        {
            let datas = await GetDataReportAll(req.query);
            return res.status(200).send(datas);
        }
        
    }
    catch(e) {
        console.log(e);
    }
}

const GetDataReportStock = async ( req ) => {

    const whereConditions = [
        {
            key: "inventory",
            value: 0 
        },
        {
            key: "status",
            value: 2
        },
        {
            key: "isdelete",
            value: 0
        }
    ];

    listLabelStock = await ImportDetailView.get({
        where: whereConditions,
        orderBy: "time_updated desc"
    });
    const totalRecords = await ImportDetailView.count({
        where: whereConditions,
    });
    
    return {
        listLabelStock,
        totalRecords
    };
}

const SendDataReportStock = async (req, res) => {
    try {
        await CheckToken.checkToken(req,res);
        if(req.user)
        {
            let datas = await GetDataReportStock(req.query);
            return res.status(200).send(datas);
        }
        
    }
    catch(e) {
        console.log(e);
    }
}


module.exports = {
    GetDataReportAll,
    SendDataReportAll,
    GetDataReportStock,
    SendDataReportStock
}