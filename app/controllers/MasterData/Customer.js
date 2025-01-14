'use strict'
const moment = require('moment');
const CustomerModel = require('../../models/MasterData/Customer');
const CheckToken = require('../CheckToken');
const CustomerView = require('../../view/MasterData/Customer');

// const GetDataCustomer = async () => {
//     listCustomers = await CustomerModel.get({
//         orderBy: "time_updated DESC",
//         offset: 0,
//     });
// }

const GetDataCustomer = async ( req ) => {

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

    listCustomers = await CustomerView.get({
        where: whereConditions,
        orderBy: "time_updated DESC",
        limit: limit_page,
        offset,
    });


    const totalRecords = await CustomerView.count({
        where: whereConditions,
    });
    // const totalPages = Math.ceil(totalRecords / limit_page);

    return {
        listCustomers,
        // pagination: {
        //     currentPage: page,
        //     totalPages,
            totalRecords,
        // },
    };
}

const SendDataCustomer = async (req, res) => {
    try {
        await CheckToken.checkToken(req,res);
        if(req.user)
        {
            let datas = await GetDataCustomer(req.query);
            return res.status(200).send(datas);
        }
    }
    catch(e) {
        console.log(e);
    }
}

const SettingCustomer = async (req, res) => {
    try {
        await CheckToken.checkToken(req,res);
        let request = req.body;
        let user_id = req.user;
        let time    = moment().format('YYYY-MM-DD HH:mm:ss');
        if(user_id)
        {
            let check_symbols_cutomer = await CustomerView.first({
                where: [
                    {
                        key: "symbols",
                        value: request.symbols 
                    }
                ],
                orderBy: "time_updated DESC"
            });

            let check_email_cutomer = await CustomerView.first({
                where: [
                    {
                        key: "email",
                        value: request.email 
                    }
                ],
                orderBy: "time_updated DESC"
            });

            let check_tax_cutomer = await CustomerView.first({
                where: [
                    {
                        key: "tax",
                        value: request.tax 
                    }
                ],
                orderBy: "time_updated DESC"
            });

            if(request.id)
            {
                let data = {
                    name    : request.name ?? '',
                    symbols : request.symbols ?? '',
                    tax     : request.tax ?? '',
                    address : request.address ?? '',
                    email   : request.email ?? '',
                    note    : request.note ?? '',
                    type    : request.type ?? '',
                    user_updated: user_id,
                    time_updated: time,
                };
                const check_cutomer = await CustomerView.first({
                    where: [
                        {
                            key: "id",
                            value: request.id 
                        }
                    ],
                    orderBy: "time_updated DESC"
                });

                if(check_cutomer)
                {
                    
                    // const check_symbols_cutomer_update = await CustomerView.first({
                    //     where: [
                    //         {
                    //             key: "symbols",
                    //             value: request.symbols 
                    //         }
                    //     ],
                    //     orderBy: "time_updated DESC"
                    // });

                    // const check_email_cutomer_update = await CustomerView.first({
                    //     where: [
                    //         {
                    //             key: "email",
                    //             value: request.email 
                    //         }
                    //     ],
                    //     orderBy: "time_updated DESC"
                    // });

                    // const check_tax_cutomer_update = await CustomerView.first({
                    //     where: [
                    //         {
                    //             key: "tax",
                    //             value: request.tax 
                    //         }
                    //     ],
                    //     orderBy: "time_updated DESC"
                    // });
                    
                    
                    if(check_symbols_cutomer && check_symbols_cutomer.id != request.id)
                    {
                        return res.status(500).send({
                            message: 5
                        });
                    }
                    if(check_email_cutomer && check_email_cutomer.id != request.id)
                    {
                        return res.status(500).send({
                            message: 6
                        });
                    }
                    if(check_tax_cutomer && check_tax_cutomer.id != request.id)
                    {
                        return res.status(500).send({
                            message: 7
                        });
                    }
                    
                    await CustomerModel.update(
                        data,
                        { where: [`id = ${request.id}`] }
                    );
    
                    return res.status(200).send({
                        message: 8
                    });
                }
                else
                {
                    return res.status(500).send({
                        message: 4
                    });
                }
            }
            else
            {
                // const check_symbols_cutomer = await CustomerView.first({
                //     where: [
                //         {
                //             key: "symbols",
                //             value: request.symbols 
                //         }
                //     ],
                //     orderBy: "time_updated DESC"
                // });

                // const check_email_cutomer = await CustomerView.first({
                //     where: [
                //         {
                //             key: "email",
                //             value: request.email 
                //         }
                //     ],
                //     orderBy: "time_updated DESC"
                // });

                // const check_tax_cutomer = await CustomerView.first({
                //     where: [
                //         {
                //             key: "tax",
                //             value: request.tax 
                //         }
                //     ],
                //     orderBy: "time_updated DESC"
                // });
                
                if(check_symbols_cutomer)
                {
                    return res.status(500).send({
                        message: 5
                    });
                }
                if(check_email_cutomer)
                {
                    return res.status(500).send({
                        message: 6
                    });
                }
                if(check_tax_cutomer)
                {
                    return res.status(500).send({
                        message: 7
                    });
                }

                await CustomerModel.insert([
                    { 
                        name    : request.name ?? '',
                        symbols : request.symbols ?? '',
                        tax     : request.tax ?? '',
                        address : request.address ?? '',
                        email   : request.email ?? '',
                        note    : request.note ?? '',
                        type    : request.type ?? '',
                        user_created: user_id,
                        user_updated: user_id,
                        time_created: time,
                        time_updated: time,
                        isdelete: 0,
                    },
                ]);

                return res.status(200).send({
                    message: 8
                });
            }
        }
    }
    catch(e) {
        console.log(e);
    }
}

const LockCustomer = async (req, res) => {
    try {
        await CheckToken.checkToken(req,res);
        let request = req.body;
        let user_id = req.user;
        let time = moment().format('YYYY-MM-DD HH:mm:ss');
        if(user_id)
        {
            if(request.id)
            {
                let check_cutomer = await CustomerView.first({
                    where: [
                        {
                            key: "id",
                            value: request.id 
                        }
                    ],
                    orderBy: "time_updated DESC"
                });
                if(check_cutomer)
                {
                    let data = {
                        time_updated : time,
                        user_updated : user_id,
                        isdelete     : check_cutomer.isdelete == 1 ? 0 : 1,
                    };
                    await CustomerModel.update(
                        data,
                        { where: [`id = ${request.id}`] }
                    );
                    
                    return res.status(200).send({
                        message: check_cutomer.isdelete == 0 ? 9 : 10
                    });
                }
                else
                {
                    return res.status(500).send({
                        message: 4
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

    let listData = await CustomerView.selectDistinct({
        distinct: DistinctConditions,
        limit: limit_page,
        offset,
    });

    const totalRecords = await CustomerView.countDistinct({
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

const SendDistinctCustomer = async (req,res) => {
    try {
        await CheckToken.checkToken(req,res);
        if(req.user)
        {
            let datas = await DistinctData(req.query);
            return res.status(200).send(datas);
        }
        
    }
    catch(e) {
        console.log(e);
    }
} 


module.exports = {
    GetDataCustomer,
    SendDataCustomer,
    SettingCustomer,
    LockCustomer,
    SendDistinctCustomer,
    DistinctData
}