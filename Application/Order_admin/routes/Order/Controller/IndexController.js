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

        var storeId=req.query.bid? req.query.bid:req.session.user.bid;
        var departId=req.query.did;

        var multiDataRequest= [
            {url: '/api/taskseqs/custcount?'+ queryString.stringify(req.query), method: 'GET', resConfig: {keyName: 'custcountInfo', is_must: true}},
            {url: '/api/stores/list', method: 'GET', resConfig: {keyName: 'storesList', is_must: true}},
        ];
        if(storeId){
            multiDataRequest= [
                {url: '/api/taskseqs/custcount?'+ queryString.stringify(req.query), method: 'GET', resConfig: {keyName: 'custcountInfo', is_must: true}},
                {url: '/api/stores/list', method: 'GET', resConfig: {keyName: 'storesList', is_must: true}},
                {url:'/api/stores/departments/'+storeId, method: 'GET', resConfig: {keyName: 'departmentsList', is_must: true}},
            ];
        }
        if(departId){
            multiDataRequest= [
                {url: '/api/taskseqs/custcount?'+ queryString.stringify(req.query), method: 'GET', resConfig: {keyName: 'custcountInfo', is_must: true}},
                {url: '/api/stores/list', method: 'GET', resConfig: {keyName: 'storesList', is_must: true}},
                {url:'/api/stores/departments/'+storeId, method: 'GET', resConfig: {keyName: 'departmentsList', is_must: true}},
                {url:'/api/stores/employees/homeAdviser?bid='+storeId+'&did='+departId, method: 'GET', resConfig: {keyName: 'homeAdviserList', is_must: true}},
            ];
        }

        Base.multiDataRequest(req, res, multiDataRequest,
            function (req, res, resultList) {

                if(!storeId){
                    resultList.departmentsList = [];
                }
                if(!departId){
                    resultList.homeAdviserList = [];
                }
                var returnData = Base.mergeData(helper.mergeObject({
                    title: ' ',
                    storeId:storeId,
                }, resultList));

                res.render('order/count/count_customer', returnData);
            });
    },

    getDepartList: function (req, res) {
        var storeId = req.params.sid;
        console.log("1111"+storeId);
        request(Base.mergeRequestOptions({
            method: 'GET',
            url: '/api/stores/departments/'+storeId,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 200) {
                // Base.handlerSuccess(res, req);
                // res.sendStatus(200);
                res.status(200).json(body)

            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })

    },
    getHomeAdviserList: function (req, res) {
        var storeId = req.params.sid;
        var departId = req.params.did;
        console.log('/api/stores/employees/homeAdviser?bid='+storeId+'&did='+departId);
        request(Base.mergeRequestOptions({
            method: 'GET',
            url: '/api/stores/employees/homeAdviser?bid='+storeId+'&did='+departId,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 200) {
                // Base.handlerSuccess(res, req);
                res.status(200).json(body)
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })

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

