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


var CustomerController = {

    listPage: function (req, res) {

        var paramObject = helper.genPaginationQuery(req);
        req.query.regionTypes=req.query.regionTypes?req.query.regionTypes.toString(','):'';
        // console.log("cccccccccc",req.query.regionTypes)
        Base.multiDataRequest(req, res, [
            {url: '/api/customers?'+ queryString.stringify(req.query), method: 'GET', resConfig: {keyName: 'customerList', is_must: true}},
            {url: '/api/assist/taskseq/status', method: 'GET', resConfig: {keyName: 'statusInfo', is_must: false}},
            {url: '/api/customers/getRegionTypeByGid', method: 'GET', resConfig: {keyName: 'TypesList', is_must: true}},
        ], function (req, res, resultList) {

            var paginationInfo =  resultList.customerList;

            var boostrapPaginator = new Pagination.TemplatePaginator(helper.genPageInfo({
                prelink: paramObject.withoutPageNo,
                current: paginationInfo.page,
                rowsPerPage: paginationInfo.pageSize,
                totalResult: paginationInfo.totalItems
            }));

            var returnData = Base.mergeData(helper.mergeObject({
                title: ' ',
                type:'customers',
                pagination: boostrapPaginator.render(),
                Permission :Permissions,
            },resultList));
            res.render('order/customers', returnData);
        });
    },
    companyCustomersPage: function (req, res) {

        var paramObject = helper.genPaginationQuery(req);
        req.query.regionTypes=req.query.regionTypes?req.query.regionTypes.toString(','):'';
        Base.multiDataRequest(req, res, [
            {url: '/api/customers/company?'+ queryString.stringify(req.query), method: 'GET', resConfig: {keyName: 'customerList', is_must: true}},
            {url: '/api/assist/taskseq/status', method: 'GET', resConfig: {keyName: 'statusInfo', is_must: false}},
            {url: '/api/customers/getRegionTypeByGid', method: 'GET', resConfig: {keyName: 'TypesList', is_must: true}},

        ], function (req, res, resultList) {

            var paginationInfo =  resultList.customerList;

            var boostrapPaginator = new Pagination.TemplatePaginator(helper.genPageInfo({
                prelink: paramObject.withoutPageNo,
                current: paginationInfo.page,
                rowsPerPage: paginationInfo.pageSize,
                totalResult: paginationInfo.totalItems
            }));

            var returnData = Base.mergeData(helper.mergeObject({
                title: ' ',
                type:'companyCustomers',
                pagination: boostrapPaginator.render(),
                Permission :Permissions,
            },resultList));
            res.render('order/customers', returnData);
        });
    },
    detailPage: function (req, res) {
        var cid =  req.params.cid;
        Base.multiDataRequest(req, res, [
                {url: '/api/customers/'+ cid, method: 'GET', resConfig: {keyName: 'customerInfo', is_must: true}},
                {url: '/api/assist/taskseq/status', method: 'GET', resConfig: {keyName: 'statusInfo', is_must: false}}
            ],
            function (req, res, resultList) {
                var returnData = Base.mergeData(helper.mergeObject({
                    title: ' ',
                    cid:cid,
                    Permission :Permissions,
                }, resultList));
                var customerInfo = resultList.customerInfo;
                if(customerInfo.ctype == 10 ){
                    res.render('order/customer/detail', returnData);
                }else{
                    res.render('order/customer/company_detail', returnData);
                }

            });
    }

};

module.exports = CustomerController;

