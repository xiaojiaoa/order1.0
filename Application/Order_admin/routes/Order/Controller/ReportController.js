// 模板 供复制用
var Base = require('./BaseController');

// 分页
var Pagination = require('pagination');

// 生成请求query
var queryString = require('qs');

// 自定义帮助函数
var helper = require('../config/helper');

// 请求模块
var request = require('request');

// 引入权限
var Permissions = require('../config/permission');

var _ = require('lodash');

var ReportController = {
    orderMatPricingPage: function (req, res) {

        var paramObject = helper.genPaginationQuery(req);
        Base.multiDataRequest(req, res, [
            {url: '/api/tasks/statement/pageday?'+ queryString.stringify(req.query), method: 'GET', resConfig: {keyName: 'orderMatPricingList', is_must: true}},
        ], function (req, res, resultList) {

            var paginationInfo = resultList.orderMatPricingList;

            var boostrapPaginator = new Pagination.TemplatePaginator(helper.genPageInfo({
                prelink: paramObject.withoutPageNo,
                current: paginationInfo.page,
                rowsPerPage: paginationInfo.pageSize,
                totalResult: paginationInfo.totalItems
            }));

            var returnData = Base.mergeData(helper.mergeObject({
                title: ' ',
                pagination: boostrapPaginator.render()
            },resultList));
            res.render('order/report/orderMatPricing', returnData);
        });

    },
    batchNumMatPricingPage: function (req, res) {

        var paramObject = helper.genPaginationQuery(req);
        Base.multiDataRequest(req, res, [
            {url: '/api/tasks/statement/pagebatch?'+ queryString.stringify(req.query), method: 'GET', resConfig: {keyName: 'batchNumMatPricingList', is_must: true}},
        ], function (req, res, resultList) {

            var paginationInfo = resultList.batchNumMatPricingList;

            var boostrapPaginator = new Pagination.TemplatePaginator(helper.genPageInfo({
                prelink: paramObject.withoutPageNo,
                current: paginationInfo.page,
                rowsPerPage: paginationInfo.pageSize,
                totalResult: paginationInfo.totalItems
            }));

            var returnData = Base.mergeData(helper.mergeObject({
                title: ' ',
                pagination: boostrapPaginator.render()
            },resultList));
            res.render('order/report/batchNumMatPricing', returnData);
        });

    },
    orderCountPage: function (req, res) {

        var paramObject = helper.genPaginationQuery(req);
        Base.multiDataRequest(req, res, [
            {url: '/api/tasks/pageAccessoryAmount?'+ queryString.stringify(req.query), method: 'GET', resConfig: {keyName: 'orderCountList', is_must: true}},
        ], function (req, res, resultList) {

            var paginationInfo = resultList.orderCountList;

            var boostrapPaginator = new Pagination.TemplatePaginator(helper.genPageInfo({
                prelink: paramObject.withoutPageNo,
                current: paginationInfo.page,
                rowsPerPage: paginationInfo.pageSize,
                totalResult: paginationInfo.totalItems
            }));

            var returnData = Base.mergeData(helper.mergeObject({
                title: ' ',
                pagination: boostrapPaginator.render()
            },resultList));
            res.render('order/report/orderCount', returnData);
        });

    },
    pickMateRepPage: function (req, res) {

        var paramObject = helper.genPaginationQuery(req);
        Base.multiDataRequest(req, res, [
            {url: '/api/tasks/statement/pageMaterialRequisitionReport?'+ queryString.stringify(req.query), method: 'GET', resConfig: {keyName: 'pickMateRepList', is_must: true}},
        ], function (req, res, resultList) {

            var paginationInfo = resultList.pickMateRepList;

            var boostrapPaginator = new Pagination.TemplatePaginator(helper.genPageInfo({
                prelink: paramObject.withoutPageNo,
                current: paginationInfo.page,
                rowsPerPage: paginationInfo.pageSize,
                totalResult: paginationInfo.totalItems
            }));

            var returnData = Base.mergeData(helper.mergeObject({
                title: ' ',
                pagination: boostrapPaginator.render()
            },resultList));
            res.render('order/report/pickMateRep', returnData);
        });

    },
    outMateRepPage: function (req, res) {

        var paramObject = helper.genPaginationQuery(req);
        Base.multiDataRequest(req, res, [
            {url: '/api/tasks/statement/pageMateOutReportByCondition?'+ queryString.stringify(req.query), method: 'GET', resConfig: {keyName: 'outMateRepList', is_must: true}},
        ], function (req, res, resultList) {

            var paginationInfo = resultList.outMateRepList;

            var boostrapPaginator = new Pagination.TemplatePaginator(helper.genPageInfo({
                prelink: paramObject.withoutPageNo,
                current: paginationInfo.page,
                rowsPerPage: paginationInfo.pageSize,
                totalResult: paginationInfo.totalItems
            }));

            var returnData = Base.mergeData(helper.mergeObject({
                title: ' ',
                pagination: boostrapPaginator.render()
            },resultList));
            res.render('order/report/outMateRep', returnData);
        });

    },


};
module.exports = ReportController;

