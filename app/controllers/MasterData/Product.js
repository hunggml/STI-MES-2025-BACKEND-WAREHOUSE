'use strict'
const moment = require('moment');
const ProductModel = require('../../models/MasterData/Product');
const BomModel = require('../../models/MasterData/Bom');
const CheckToken = require('../CheckToken');
const BomView = require('../../view/MasterData/Bom');
const ProductView = require('../../view/MasterData/Product');

const GetDataProduct = async ( req ) => {

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
            key: "unit",
            value: req.unit 
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

    listProducts = await ProductView.get({
        where: whereConditions,
        orderBy: "time_updated DESC",
        limit: limit_page,
        offset,
    });


    const totalRecords = await ProductView.count({
        where: whereConditions,
    });
    // const totalPages = Math.ceil(totalRecords / limit_page);

    return {
        listProducts,
        // pagination: {
        //     currentPage: page,
        //     totalPages,
            totalRecords,
        // },
    };
}

const SendDataProduct = async (req, res) => {
    try {
        await CheckToken.checkToken(req,res);
        let datas = await GetDataProduct(req.query);
        return res.status(200).send(datas);
        
    }
    catch(e) {
        console.log(e);
    }
}

const SettingProduct = async (req, res) => {
    try {
        await CheckToken.checkToken(req,res);
        let request = req.body;
        let user_id = req.user;
        console.log(request);
        let time = moment().format('YYYY-MM-DD HH:mm:ss');
        if(user_id)
        {
            let check_symbols_product = await ProductView.first({
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
                    name        : request.name ?? '',
                    symbols     : request.symbols ?? '',
                    unit        : request.unit ?? '',
                    stock_min   : request.stock_min ?? '',
                    stock_max   : request.stock_max ?? '',
                    price       : request.price ?? '',
                    note        : request.note ?? '',
                    type        : request.type ?? '',
                    user_updated: user_id,
                    time_updated: time,
                };

                const check_product = await ProductView.first({
                    where: [
                        {
                            key: "id",
                            value: request.id 
                        }
                    ],
                    orderBy: "time_updated DESC"
                });

                if(check_product)
                {
                    if(check_symbols_product && check_symbols_product.id != request.id)
                    {
                        return res.status(500).send({
                            message: 16
                        });
                    }
                    
                    await ProductModel.update(
                        data,
                        { where: [`id = ${request.id}`] }
                    );
    
                    return res.status(200).send({
                        message: 17
                    });
                }
                else
                {
                    return res.status(500).send({
                        message: 18
                    });
                }
            }
            else
            {
    
                if(check_symbols_product)
                {
                    return res.status(500).send({
                        message: 16
                    });
                }

                await ProductModel.insert([
                    { 
                        name        : request.name ?? '',
                        symbols     : request.symbols ?? '',
                        unit        : request.unit ?? '',
                        stock_min   : request.stock_min ?? '',
                        stock_max   : request.stock_max ?? '',
                        price       : request.price ?? '',
                        note        : request.note ?? '',
                        type        : request.type ?? '',
                        user_created: user_id,
                        user_updated: user_id,
                        time_created: time,
                        time_updated: time,
                        isdelete: 0,
                    },
                ]);

                return res.status(200).send({
                    message: 17
                });
            }
        }
    }
    catch(e) {
        console.log(e);
    }
}

const LockProduct = async (req, res) => {
    try {
        await CheckToken.checkToken(req,res);
        let request = req.body;
        let user_id = req.user;
        let time = moment().format('YYYY-MM-DD HH:mm:ss');
        if(user_id)
        {
            if(request.id)
            {
                let check_Product = await ProductView.first({
                    where: [
                        {
                            key: "id",
                            value: request.id 
                        }
                    ],
                    orderBy: "time_updated DESC"
                });
                if(check_Product)
                {
                    let data = {
                        time_updated : time,
                        user_updated : user_id,
                        isdelete     : check_Product.isdelete == 1 ? 0 : 1,
                    };
                    await ProductModel.update(
                        data,
                        { where: [`id = ${request.id}`] }
                    );

                    return res.status(200).send({
                        message: check_Product.isdelete == 0 ? 19 : 20
                    });
                }
                else
                {
                    return res.status(500).send({
                        message: 18
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

    let listData = await ProductView.selectDistinct({
        distinct: DistinctConditions,
        limit: limit_page,
        offset,
    });

    const totalRecords = await ProductView.countDistinct({
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

const SendDistinctProduct = async (req,res) => {
    try {
        await CheckToken.checkToken(req,res);
        let datas = await DistinctData(req.query);
        return res.status(200).send(datas);
    }
    catch(e) {
        console.log(e);
    }
} 

const GetDataBom = async ( req,res ) => {
    try {
        await CheckToken.checkToken(req,res);

        let page        = req.page;
        let limit_page  = 10;

        const offset = (page - 1) * limit_page;
        
        const whereConditions = [
            {
                key: "product_id",
                value: req.query.product_id 
            },
            {
                key: "isdelete",
                value: 0
            },
            
        ];

        let listBom = await BomView.get({
            where: whereConditions,
            orderBy: "time_updated DESC",
            limit: limit_page,
            offset,
        });

        const totalRecords = await BomView.count({
            where: whereConditions,
        });

        let datas = {
            listBom,
            totalRecords
        }

        return res.status(200).send(datas);
        
    }
    catch(e) {
        console.log(e);
    }
}

const SettingBom = async ( req,res ) => {
    try {
        await CheckToken.checkToken(req,res);

        let request = req.body;

        let user_id = req.user;
        let time = moment().format('YYYY-MM-DD HH:mm:ss');
        if(user_id)
        {
            const check_product_bom = await ProductView.first({
                where: [
                    {
                        key: "id",
                        value: request.product_id 
                    }
                ],
                orderBy: "time_updated DESC"
            });

            if(check_product_bom)
            {
                const get_data_bom_of_product = await BomView.get({
                    where: [
                        {
                            key: "product_id",
                            value: request.product_id 
                        }
                    ],
                    orderBy: "time_updated DESC"
                }); 

                if(get_data_bom_of_product.length == 0)
                {
                    let data_semi = request.semi_products.map(function(v){
                        return { 
                            product_id      : request.product_id ?? '',
                            semi_product_id    : v.semi_product_id ?? '',
                            quantity_use    : v.quantity_use ?? '',
                            user_created    : user_id,
                            time_created    : time,
                            user_updated    : user_id,
                            time_updated    : time,
                            isdelete        : 0,
                        };
                    });

                    if(data_semi.length > 0)
                    {
                        await BomModel.insert(data_semi);
                    }

                    return res.status(200).send({
                        message: 17
                    });                
                }
                else
                {
                    await BomModel.update(
                        {
                           isdelete : 1
                        },
                        { where: [`product_id = ${request.product_id}`] }
                    );

                    let data_semi = request.semi_products.map(function(v){
                        return { 
                                product_id      : request.product_id ?? '',
                                semi_product_id    : v.semi_product_id ?? '',
                                quantity_use    : v.quantity_use ?? '',
                                user_created    : user_id,
                                user_updated    : user_id,
                                time_created    : time,
                                time_updated    : time,
                                isdelete        : 0,
                            };
                    });

                    if(data_semi.length > 0)
                    {
                        await BomModel.insert(data_semi);
                    }

                    return res.status(200).send({
                        message: 17
                    });                       
                }
            }

        }
        
    }
    catch(e) {
        console.log(e);
    }
}

module.exports = {
    GetDataProduct,
    SendDataProduct,
    SettingProduct,
    LockProduct,
    DistinctData,
    SendDistinctProduct,
    GetDataBom,
    SettingBom
}