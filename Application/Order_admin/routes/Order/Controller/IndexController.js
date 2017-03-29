//请求代理控制器
var Base = require('./BaseController');

var helper = require('../config/helper');

var request = require('request');

var Pagination = require('pagination');

var queryString = require('qs');


var IndexController = {

    indexPage: function (req, res) {
        res.redirect('/userCenter')
        // res.render('order/index', Base.mergeData(helper.mergeObject({title: '订单登录系统'}, {})));
    },
    countCustomerPage: function (req, res) {
        Base.multiDataRequest(req, res, [
                {url: '/api/taskseqs/custcount?'+ queryString.stringify(req.query), method: 'GET', resConfig: {keyName: 'custcountInfo', is_must: true}},
                {url: '/api/stores/list', method: 'GET', resConfig: {keyName: 'storesList', is_must: true}},
                {url: '/api/stores/employees/homeAdviser', method: 'GET', resConfig: {keyName: 'homeAdviserInfo', is_must: true}},
            ],
            function (req, res, resultList) {
                var returnData = Base.mergeData(helper.mergeObject({
                    title: ' ',
                }, resultList));

                res.render('order/count/count_customer', returnData);
            });
    },
    countDealPage: function (req, res) {
        Base.multiDataRequest(req, res, [
                {url: '/api/taskseqs/custcount/deal?'+ queryString.stringify(req.query), method: 'GET', resConfig: {keyName: 'dealInfo', is_must: true}},
                {url: '/api/stores/designers', method: 'GET', resConfig: {keyName: 'designerInfo', is_must: true}},
                {url: '/api/stores/employees/homeAdviser', method: 'GET', resConfig: {keyName: 'homeAdviserInfo', is_must: true}},
            ],
            function (req, res, resultList) {
                var returnData = Base.mergeData(helper.mergeObject({
                    title: ' ',
                }, resultList));

                res.render('order/count/count_deal', returnData);
            });
    },
};

module.exports = IndexController;

