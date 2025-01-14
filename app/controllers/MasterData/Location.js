'use strict'
const moment = require('moment');
const LocationModel = require('../../models/MasterData/Location');
const CheckToken = require('../CheckToken');
const LocationView = require('../../view/MasterData/Location');

const GetDataLocation = async ( req ) => {

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
            key: "warehouse_id",
            value: req.warehouse_id 
        },
        {
            key: "position_x",
            value: req.position_x 
        },
        {
            key: "position_y",
            value: req.position_y 
        },
        {
            key: "position_y",
            value: req.position_y 
        }
        // {
        //     key: "isdelete",
        //     value: 0
        // }
    ];

    if(page == 0)
    {
        listLocations = await LocationView.get({
            where: whereConditions,
            orderBy: "time_updated DESC"
        });
    }
    else
    {
        listLocations = await LocationView.get({
            where: whereConditions,
            orderBy: "time_updated DESC",
            limit: limit_page,
            offset,
        });
    }


    const totalRecords = await LocationView.count({
        where: whereConditions,
    });
    // const totalPages = Math.ceil(totalRecords / limit_page);

    return {
        listLocations,
        // pagination: {
        //     currentPage: page,
        //     totalPages,
            totalRecords,
        // },
    };
}

const SendDataLocation = async (req, res) => {
    try {
        await CheckToken.checkToken(req,res);
        if(req.user)
        {
            let datas = await GetDataLocation(req.query);
            return res.status(200).send(datas);
        }
        
    }
    catch(e) {
        console.log(e);
    }
}

const SettingLocation = async (req, res) => {
    try {
        await CheckToken.checkToken(req,res);
        let request = req.body;
        let user_id = req.user;
        let time    = moment().format('YYYY-MM-DD HH:mm:ss');
        if(user_id)
        {
            let check_symbols_location = await LocationView.first({
                where: [
                    {
                        key: "symbols",
                        value: request.symbols 
                    }
                ],
                orderBy: "time_updated DESC"
            });

            let check_name_location = await LocationView.first({
                where: [
                    {
                        key: "name",
                        value: request.name 
                    }
                ],
                orderBy: "time_updated DESC"
            });

            let check_position_x_location = await LocationView.first({
                where: [
                    {
                        key: "position_x",
                        value: request.position_x ?? ''
                    }
                ],
                orderBy: "time_updated DESC"
            });
            let check_position_y_location = await LocationView.first({
                where: [
                    {
                        key: "position_y",
                        value: request.position_y ?? ''
                    }
                ],
                orderBy: "time_updated DESC"
            });

            let check_position_z_location = await LocationView.first({
                where: [
                    {
                        key: "position_z",
                        value: request.position_z ?? ''
                    }
                ],
                orderBy: "time_updated DESC"
            });

            if(request.id)
            {
                let data = {
                    name            : request.name,
                    symbols         : request.symbols,
                    stock_min       : request.stock_min ?? 0,
                    stock_max       : request.stock_max ?? 0,
                    warehouse_id    : request.warehouse_id,
                    position_x      : request.position_x ?? 0,
                    position_y      : request.position_y ?? 0,
                    position_z      : request.position_z ?? 0,
                    r               : 0,
                    g               : 0,
                    b               : 0,
                    status_led      : 0,
                    note            : request.note ?? '',
                    user_updated    : user_id,
                    time_updated    : time,
                };
                const check_location = await LocationView.first({
                    where: [
                        {
                            key: "id",
                            value: request.id 
                        }
                    ],
                    orderBy: "time_updated DESC"
                });

                if(check_location)
                {
                    
                    if(check_symbols_location && check_symbols_location.id != request.id)
                    {
                        return res.status(500).send({
                            message: 26
                        });
                    }

                    if(check_name_location && check_name_location.id != request.id)
                    {
                        return res.status(500).send({
                            message: 27
                        });
                    }

                    const isInvalidX = check_position_x_location && check_position_x_location.position_x == request.position_x;
                    const isInvalidY = check_position_y_location && check_position_y_location.position_y == request.position_y;
                    const isInvalidZ = check_position_z_location && check_position_z_location.position_z == request.position_z;

                    if( request.position_x != check_location.position_x || request.position_y != check_location.position_y || request.position_z != check_location.position_z )
                    {
                        if (isInvalidX && isInvalidY && isInvalidZ) {
                            return res.status(500).send({
                                message: 32
                            });
                        }
                    }
                    
                    await LocationModel.update(
                        data,
                        { where: [`id = ${request.id}`] }
                    );
    
                    return res.status(200).send({
                        message: 28
                    });
                }
                else
                {
                    return res.status(500).send({
                        message: 29
                    });
                }
            }
            else
            {
                
                if(check_symbols_location)
                {
                    return res.status(500).send({
                        message: 26
                    });
                }

                if(check_name_location)
                {
                    return res.status(500).send({
                        message: 27
                    });
                }

                if(check_position_x_location && check_position_x_location.position_x == request.position_x &&
                    check_position_y_location && check_position_y_location.position_y == request.position_y &&
                    check_position_z_location && check_position_z_location.position_z == request.position_z
                )
                {
                    return res.status(500).send({
                        message: 32
                    });
                }
                
                await LocationModel.insert([
                    { 
                        name            : request.name,
                        symbols         : request.symbols,
                        stock_min       : request.stock_min ?? 0,
                        stock_max       : request.stock_max ?? 0,
                        warehouse_id    : request.warehouse_id,
                        position_x      : request.position_x ?? 0,
                        position_y      : request.position_y ?? 0,
                        position_z      : request.position_z ?? 0,
                        r               : 0,
                        g               : 0,
                        b               : 0,
                        status_led      : 0,
                        note            : request.note ?? '',
                        user_created    : user_id,
                        user_updated    : user_id,
                        time_created    : time,
                        time_updated    : time,
                        isdelete        : 0,
                    },
                ]);

                return res.status(200).send({
                    message: 28
                });
            }
        }
    }
    catch(e) {
        console.log(e);
    }
}

const LockLocation = async (req, res) => {
    try {
        await CheckToken.checkToken(req,res);
        let request = req.body;
        let user_id = req.user;
        let time = moment().format('YYYY-MM-DD HH:mm:ss');
        if(user_id)
        {
            if(request.id)
            {
                let check_location = await LocationView.first({
                    where: [
                        {
                            key: "id",
                            value: request.id 
                        }
                    ],
                    orderBy: "time_updated DESC"
                });
                if(check_location)
                {
                    let data = {
                        time_updated : time,
                        user_updated : user_id,
                        isdelete     : check_location.isdelete == 1 ? 0 : 1,
                    };
                    await LocationModel.update(
                        data,
                        { where: [`id = ${request.id}`] }
                    );
                    
                    return res.status(200).send({
                        message: check_location.isdelete == 0 ? 30 : 31
                    });
                }
                else
                {
                    return res.status(500).send({
                        message: 29
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

    let listData = await LocationView.selectDistinct({
        distinct: DistinctConditions,
        limit: limit_page,
        offset,
    });

    const totalRecords = await LocationView.countDistinct({
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

const SendDistinctLocation = async (req,res) => {
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
    GetDataLocation,
    SendDataLocation,
    SettingLocation,
    LockLocation,
    SendDistinctLocation,
    DistinctData
}