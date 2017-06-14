//模板 供复制用
var Base = require('./BaseController');

//分页
var Pagination = require('pagination');

//生成请求query
var queryString = require('qs');

//自定义帮助函数
var helper = require('../config/helper');

//请求模块
var request = require('request');

//引入权限
var Permissions = require('../config/permission');


var FinancialStatisticsController = {
    listPage:function(req,res){
        Base.multiDataRequest(req, res, [
                {url: '/api/orders/financial/statistics?'+ queryString.stringify(req.query), method: 'GET', resConfig: {keyName: 'FinancialStatisticsList', is_must: true}},
                {url: '/api/assist/order/stcodes', method: 'GET', resConfig: {keyName: 'stcodeInfo', is_must: false}},
                {url: '/api/assist/deco/color', method: 'GET', resConfig: {keyName: 'colorList', is_must: true}},
            ],
            function (req, res, resultList) {
                var returnData = Base.mergeData(helper.mergeObject({
                    title: ' ',
                }, resultList));

                res.render('order/FinancialStatistics/index', returnData);
            });
    }
};
module.exports = FinancialStatisticsController;