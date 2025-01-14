'use strict'
const moment = require('moment');
const MachineModel = require('../../models/MasterData/Machine');
const CheckToken = require('../CheckToken');
const MachineView = require('../../view/MasterData/Machine');

const GetDataMachine = async ( req ) => {

    let page        = req.page ?? 1;
    let limit_page  = req.limit_page ?? 10;

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
    ];

    listMachines = await MachineView.get({
        where: whereConditions,
        orderBy: "time_updated DESC",
        limit: limit_page,
        offset,
    });


    const totalRecords = await MachineView.count({
        where: whereConditions,
    });
    // const totalPages = Math.ceil(totalRecords / limit_page);

    return {
        listMachines,
        // pagination: {
        //     currentPage: page,
        //     totalPages,
            totalRecords,
        // },
    };
}

const SendDataMachine = async (req, res) => {
    try {
        // console.log(req.query);
        await CheckToken.checkToken(req,res);
        if(req.user)
        {
            let datas = await GetDataMachine(req.query);
            return res.status(200).send(datas);
        }
    }
    catch(e) {
        console.log(e);
    }
}

const SettingMachine = async (req, res) => {
    try {
        await CheckToken.checkToken(req,res);
        let request = req.body;
        let user_id = req.user;
        let time = moment().format('YYYY-MM-DD HH:mm:ss');
        if(user_id)
        {
            let check_symbols_machine = await MachineView.first({
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

                const check_machine = await MachineView.first({
                    where: [
                        {
                            key: "id",
                            value: request.id 
                        }
                    ],
                    orderBy: "time_updated DESC"
                });

                if(check_machine)
                {
                    

                    if(check_symbols_machine && check_symbols_machine.id != request.id)
                    {
                        return res.status(500).send({
                            message: 11 // symbols exist 
                        });
                    }
                    
                    await MachineModel.update(
                        data,
                        { where: [`id = ${request.id}`] }
                    );
                
                    return res.status(200).send({
                        message: 12 // setting machine success
                    });
                }
                else
                {
                    return res.status(500).send({
                        message: 13
                    });
                }
            }
            else
            {
                if(check_symbols_machine)
                {
                    return res.status(500).send({
                        message: 11
                    });
                }

                await MachineModel.insert([
                    { 
                        name    : req.body.name ?? '',
                        symbols : req.body.symbols ?? '',
                        note    : req.body.note ?? '',
                        user_created: user_id,
                        user_updated: user_id,
                        time_created: time,
                        time_updated: time,
                        isdelete: 0,
                    },
                ]);

                return res.status(200).send({
                    message: 12
                });
            }
        }
    }
    catch(e) {
        console.log(e);
    }
}


const LockMachine = async (req, res) => {
    try {
        await CheckToken.checkToken(req,res);
        let request = req.body;
        let user_id = req.user;
        let time = moment().format('YYYY-MM-DD HH:mm:ss');
        if(user_id)
        {
            if(request.id)
            {
                let check_machine = await MachineView.first({
                    where: [
                        {
                            key: "id",
                            value: request.id 
                        }
                    ],
                    orderBy: "time_updated DESC"
                });
                if(check_machine)
                {
                    let data = {
                        time_updated : time,
                        user_updated : user_id,
                        isdelete     : check_machine.isdelete == 1 ? 0 : 1,
                    };
                    await MachineModel.update(
                        data,
                        { where: [`id = ${request.id}`] }
                    );
                    
                    return res.status(200).send({
                        message: check_machine.isdelete == 0 ? 14 : 15
                    });
                }
                else
                {
                    return res.status(500).send({
                        message: 13
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

    let listData = await MachineView.selectDistinct({
        distinct: DistinctConditions,
        limit: limit_page,
        offset,
    });

    const totalRecords = await MachineView.countDistinct({
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

const SendDistinctMachine = async (req,res) => {
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
    GetDataMachine,
    SendDataMachine,
    SettingMachine,
    LockMachine,
    SendDistinctMachine,
    DistinctData
}