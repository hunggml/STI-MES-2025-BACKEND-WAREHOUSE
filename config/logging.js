'use strict';

const log4js = require('log4js');
const logDefault = {
    appenders: {
        multi: {
            type: 'multiFile',
            base: 'storage/logs/', // Forder log
            property: 'categoryName',
            extension: '.log', // File name extension
            maxLogSize: 1048576000, // 1000MB
        },
    },
    categories: {
        default: { appenders: ['multi'], level: 'debug' },
    },
};

const optionLog = (url = 'storage/logs/server.log', size = 10, backups = 2, numBackups = 3) => {
    return {
        type: 'dateFile',
        pattern: "yyyy-MM-dd",
        keepFileExt: true, //
        maxLogSize: 1024 * 1024 * Number(size), //1024 * 1024 * size = size M
        backups: backups, //
        alwaysIncludePattern: true,//
        numBackups: numBackups, // So file luu giu trong 1 ngay
        filename: `${url}`,
    }
}

const logDayly = {
    appenders: {
        default: optionLog('storage/logs/server.log'),
        queryLog: optionLog('storage/logs/query/query-log.log', ''),
    },
    categories: {
        default: { appenders: ["default"], level: "ALL" },
        queryLog: { appenders: ["queryLog"], level: "ALL" },
    }
}

log4js.configure(logDayly);

global.logger = log4js.getLogger();
global.queryLog = log4js.getLogger('queryLog');
