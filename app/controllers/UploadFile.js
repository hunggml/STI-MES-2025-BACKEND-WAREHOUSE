'use strict'
const moment = require('moment');
const multer = require("multer");
const config = require('../../config/router');
const path = require('path');
const LoginController = require('../controllers/Auth/LoginController');
const UploadImg = require('../models/UploadImg');

const storage = multer.diskStorage({
    destination: (req, file, cb) => { cb(null, config.cwd + "/public/uploads/img") },
    filename: async (req, file, cb) => {
        let originalname = file.originalname.split('.');
        let fileName = originalname[originalname.length - 1];
        originalname.splice(originalname.length - 1, 1, moment().format('YYMMDD_HHmm').toString());
        let name = originalname.join('_').replace(/ /g, '_');
        cb(null, `${name}.${fileName}`);
        await UploadImg.insert([
            { user_id: req.user, url: `/public/uploads/img/${name}.${fileName}`, name: file.originalname, time_create: moment().format('YYYY-MM-DD HH:mm:ss'), time_update: moment().format('YYYY-MM-DD HH:mm:ss'), isdelete: 0 },
        ]);
    }
});
const upload = multer({
    storage: storage,
    limits: { fileSize: config.maxSizeUpload },
    fileFilter: (req, file, cb) => {
        let filetypes = /jpeg|jpg|png|bin/; // 
        let extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        if (extname) { return cb(null, true); }
        cb(`Error: File upload only supports the following filetypes - ${filetypes}`);
    }
}).single("file");

const uploadFileImg = async (req, res) => {
    await LoginController.middleware(req, res);
    const userId = req.user;
    console.log(userId);
    upload(req, res, async (err) => {
        if (err) {
            res.status(500).send(
                {
                    'status': false,
                    'msg': err
                });
        }
        else {
            console.log('get data');
            setTimeout(async function () {
                const fileLast = await UploadImg.first({
                    orderBy: "id DESC",
                    offset: 0,
                });
                console.log(fileLast);
                res.status(200).send(
                    {
                        'status': true,
                        'data': fileLast
                    });
            }, 500);
        }
    });
}
const sendDataImg = async (req, res) => {
    try {
        await LoginController.middleware(req, res);
        const userId = req.user;
        const listImg = await UploadImg.get({
            where: [`user_id = ${userId}`],
        });
        console.log(listImg);
        res.send({ 'data': listImg });
    }
    catch {

    }
}
module.exports = {
    uploadFileImg,
    sendDataImg
}