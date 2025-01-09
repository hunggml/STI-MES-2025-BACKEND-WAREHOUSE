'use strict'

const { cwd } = require('../config/router.js')
    , express = require('express')
    , app = express()
    , ejs = require('ejs')
    , engine = require('ejs-mate')
    , bodyParser = require('body-parser')
    , MasterDataCustomer = require('../app/controllers/MasterData/Customer')
    , MasterDataMachine = require('../app/controllers/MasterData/Machine')
    , MasterDataProduct = require('../app/controllers/MasterData/Product')
    , MasterDataWarehouse = require('../app/controllers/MasterData/Warehouse')
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const CheckToken = require('../app/controllers/CheckToken');

app.engine('ejs', engine);
app.set('view engine', 'ejs');
app.set('views', cwd + '/resources/views');
app.use(bodyParser.json());


// master data customer 
app.get('/get-data-customers', async (req, res) => { MasterDataCustomer.SendDataCustomer(req, res); });
app.post('/setting-customer', async (req, res) => { MasterDataCustomer.SettingCustomer(req, res); });
app.post('/lock-customer', async (req, res) => { MasterDataCustomer.LockCustomer(req, res); });
app.get('/get-distinct-customer', async (req, res) => { MasterDataCustomer.SendDistinctCustomer(req, res); });

// master data machine 
app.get('/get-data-machines', async (req, res) => { MasterDataMachine.SendDataMachine(req, res); });
app.post('/setting-machine', async (req, res) => { MasterDataMachine.SettingMachine(req, res); });
app.post('/lock-machine', async (req, res) => { MasterDataMachine.LockMachine(req, res); });
app.get('/get-distinct-machine', async (req, res) => { MasterDataMachine.SendDistinctMachine(req, res); });


// master data product 
app.get('/get-data-products', async (req, res) => { MasterDataProduct.SendDataProduct(req, res); });
app.post('/setting-product', async (req, res) => { MasterDataProduct.SettingProduct(req, res); });
app.post('/lock-product', async (req, res) => { MasterDataProduct.LockProduct(req, res); });
app.get('/get-distinct-product', async (req, res) => { MasterDataProduct.SendDistinctProduct(req, res); });
app.get('/get-data-bom', async (req, res) => { MasterDataProduct.GetDataBom(req, res); });
app.get('/setting-bom', async (req, res) => { MasterDataProduct.SettingBom(req, res); });


// master data warehouse 
app.get('/get-data-warehouses', async (req, res) => { MasterDataWarehouse.SendDataWarehouse(req, res); });
app.post('/setting-warehouse', async (req, res) => { MasterDataWarehouse.SettingWarehouse(req, res); });
app.post('/lock-warehouse', async (req, res) => { MasterDataWarehouse.LockWarehouse(req, res); });
app.get('/get-distinct-warehouse', async (req, res) => { MasterDataWarehouse.SendDistinctWarehouse(req, res); });

app.get('/get-data-bom', async (req, res) => { MasterDataWarehouse.GetDataBom(req, res); });
app.get('/setting-bom', async (req, res) => { MasterDataWarehouse.SettingBom(req, res); });






app.get('/get-data-machines', async (req, res) => { MasterDataMachine.SendDataMachine(req, res); });

module.exports = app; 