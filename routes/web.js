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
    , MasterDataLocation = require('../app/controllers/MasterData/Location')
    , Import = require('../app/controllers/WarehouseSystem/Import')
    , Export = require('../app/controllers/WarehouseSystem/Export')
    , Report = require('../app/controllers/WarehouseSystem/Report')
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const CheckToken = require('../app/controllers/CheckToken');

app.engine('ejs', engine);
app.set('view engine', 'ejs');
app.set('views', cwd + '/resources/views');
app.use(bodyParser.json());


const masterDataCustomerRouter = express.Router();
// master data customer 
masterDataCustomerRouter.get('/get-data-customers', async (req, res) => { MasterDataCustomer.SendDataCustomer(req, res); });
masterDataCustomerRouter.post('/setting-customer', async (req, res) => { MasterDataCustomer.SettingCustomer(req, res); });
masterDataCustomerRouter.post('/lock-customer', async (req, res) => { MasterDataCustomer.LockCustomer(req, res); });
masterDataCustomerRouter.get('/get-distinct-customer', async (req, res) => { MasterDataCustomer.SendDistinctCustomer(req, res); });

// app.get('/get-data-customers', async (req, res) => { MasterDataCustomer.SendDataCustomer(req, res); });
// app.post('/setting-customer', async (req, res) => { MasterDataCustomer.SettingCustomer(req, res); });
// app.post('/lock-customer', async (req, res) => { MasterDataCustomer.LockCustomer(req, res); });
// app.get('/get-distinct-customer', async (req, res) => { MasterDataCustomer.SendDistinctCustomer(req, res); });

const masterDataMachineRouter = express.Router();
// master data machine 
masterDataMachineRouter.get('/get-data-machines', async (req, res) => { MasterDataMachine.SendDataMachine(req, res); });
masterDataMachineRouter.post('/setting-machine', async (req, res) => { MasterDataMachine.SettingMachine(req, res); });
masterDataMachineRouter.post('/lock-machine', async (req, res) => { MasterDataMachine.LockMachine(req, res); });
masterDataMachineRouter.get('/get-distinct-machine', async (req, res) => { MasterDataMachine.SendDistinctMachine(req, res); });

const masterDataProductRouter = express.Router();
// master data product 
masterDataProductRouter.get('/get-data-products', async (req, res) => { MasterDataProduct.SendDataProduct(req, res); });
masterDataProductRouter.post('/setting-product', async (req, res) => { MasterDataProduct.SettingProduct(req, res); });
masterDataProductRouter.post('/lock-product', async (req, res) => { MasterDataProduct.LockProduct(req, res); });
masterDataProductRouter.get('/get-distinct-product', async (req, res) => { MasterDataProduct.SendDistinctProduct(req, res); });
masterDataProductRouter.get('/get-data-bom', async (req, res) => { MasterDataProduct.GetDataBom(req, res); });
masterDataProductRouter.post('/setting-bom', async (req, res) => { MasterDataProduct.SettingBom(req, res); });

const masterDataWarehouseRouter = express.Router();
// master data warehouse 
masterDataWarehouseRouter.get('/get-data-warehouses', async (req, res) => { MasterDataWarehouse.SendDataWarehouse(req, res); });
masterDataWarehouseRouter.post('/setting-warehouse', async (req, res) => { MasterDataWarehouse.SettingWarehouse(req, res); });
masterDataWarehouseRouter.post('/lock-warehouse', async (req, res) => { MasterDataWarehouse.LockWarehouse(req, res); });
masterDataWarehouseRouter.get('/get-distinct-warehouse', async (req, res) => { MasterDataWarehouse.SendDistinctWarehouse(req, res); });

const masterDataLocationRouter = express.Router();
// master data location 
masterDataLocationRouter.get('/get-data-locations', async (req, res) => { MasterDataLocation.SendDataLocation(req, res); });
masterDataLocationRouter.post('/setting-location', async (req, res) => { MasterDataLocation.SettingLocation(req, res); });
masterDataLocationRouter.post('/lock-location', async (req, res) => { MasterDataLocation.LockLocation(req, res); });
masterDataLocationRouter.get('/get-distinct-location', async (req, res) => { MasterDataLocation.SendDistinctLocation(req, res); });

app.use('/settings/customer', masterDataCustomerRouter);
app.use('/settings/machine', masterDataMachineRouter);
app.use('/settings/product', masterDataProductRouter);
app.use('/settings/warehouse', masterDataWarehouseRouter);
app.use('/settings/location', masterDataLocationRouter);


// warehouse system 

// import
const importRouter = express.Router();
importRouter.get('/get-data-command-import', async (req, res) => { Import.SendDataCommadImport(req, res); });
importRouter.post('/create-command-import', async (req, res) => { Import.CreateCommandImport(req, res); });
importRouter.get('/get-distinct-command-import', async (req, res) => { Import.SendDistinctCommandImport(req, res); });
importRouter.get('/get-data-import-detail', async (req, res) => { Import.SendDataImportDetail(req, res); });
importRouter.get('/get-distinct-import-detail', async (req, res) => { Import.SendDistinctImportDetail(req, res); });
importRouter.get('/get-data-before-import', async (req, res) => { Import.SendDataBeforeImport(req, res); });
importRouter.post('/turn-on-led-before-import', async (req, res) => { Import.SettingLedLocation(req, res); });
importRouter.post('/import-warehouse', async (req, res) => { Import.ImportWarehouse(req, res); });

app.use('/warehouse-system/import', importRouter);

// export
const exportRouter = express.Router();
exportRouter.get('/get-data-command-export', async (req, res) => { Export.SendDataCommadExport(req, res); });
exportRouter.post('/create-command-export', async (req, res) => { Export.CreateCommandExport(req, res); });
exportRouter.get('/get-distinct-command-export', async (req, res) => { Export.SendDistinctCommandExport(req, res); });
exportRouter.get('/get-data-export-detail', async (req, res) => { Export.SendDataExportDetail(req, res); });
exportRouter.get('/get-distinct-export-detail', async (req, res) => { Export.SendDistinctExportDetail(req, res); });
exportRouter.get('/get-data-before-export', async (req, res) => { Export.SendDataBeforeExport(req, res); });
exportRouter.post('/export-warehouse', async (req, res) => { Export.ExportWarehouse(req, res); });

app.use('/warehouse-system/export', exportRouter);

// report
const reportRouter = express.Router();
reportRouter.get('/all', async (req, res) => { Report.SendDataReportAll(req, res); });
reportRouter.get('/stock-label', async (req, res) => { Report.SendDataReportStock(req, res); });

app.use('/warehouse-system/report', reportRouter);


module.exports = app; 