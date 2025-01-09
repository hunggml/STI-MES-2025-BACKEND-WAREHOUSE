'use strict'
const moment = require('moment');
const env = require('dotenv').config();
const axios = require("axios")
const CustomerModal = require('../models/MasterData/Customer');
var serverLogin = env.parsed.URL_LOGIN;

const checkToken = async (req, res) => {
    try {
        if (req.headers['authorization']) {
            // console.log(1);
            const token = req.headers['authorization'].split(' ')[1];
            if (!token) {
                return res.status(401).send({
                    message: 2
                });  
            }

            await axios({
                method: 'get',
                url: `${serverLogin}/check-token`,
                data: {
                    token: token
                }      
            })
            .then(function (response) {
                req.user = response.data.decoded.userId;
                return true;
            }).catch(function (error) {
                return res.status(401).send({
                    message: 2
                });  
            });

        }
        else {
            return res.status(401).send({
                message: 2
            });  
        }

    }
    catch {
        return res.status(500).send({
            message: 2
        });  
    }
}


module.exports = {
    checkToken
}