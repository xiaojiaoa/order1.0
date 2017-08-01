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
            {url: '/api/tasks/statement/pageAccessoryTotalAmount?'+ queryString.stringify(req.query), method: 'GET', resConfig: {keyName: 'orderCountList', is_must: true}},
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
                pagination: boostrapPaginator.render(),
            },resultList));
            res.render('order/report/orderCount', returnData);
        });

    },
    orderCountDetailPage: function (req, res) {

        var paramObject = helper.genPaginationQuery(req);
        Base.multiDataRequest(req, res, [
            {url: '/api/tasks/statement/pageAccessoryAmount?'+ queryString.stringify(req.query), method: 'GET', resConfig: {keyName: 'orderCountDetail', is_must: true}},
        ], function (req, res, resultList) {

            var paginationInfo = resultList.orderCountDetail;

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
            res.render('order/report/orderCountDetail', returnData);
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
    outMateRepDetailPage: function (req, res) {

        var paramObject = helper.genPaginationQuery(req);
        Base.multiDataRequest(req, res, [
            {url: '/api/tasks/statement/pageMateInfoList?'+ queryString.stringify(req.query), method: 'GET', resConfig: {keyName: 'outMateDetail', is_must: true}},
        ], function (req, res, resultList) {

            var paginationInfo = resultList.outMateDetail;

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
            res.render('order/report/outMateRepDetail', returnData);
        });

    },
    inMateRepPage: function (req, res) {

        var paramObject = helper.genPaginationQuery(req);
        Base.multiDataRequest(req, res, [
            {url: '/api/tasks/statement/materialSummary/page?'+ queryString.stringify(req.query), method: 'GET', resConfig: {keyName: 'outMateRepList', is_must: true}},
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
            res.render('order/report/inMateRep', returnData);
        });

    },
    inMateRepDetailPage: function (req, res) {

        var paramObject = helper.genPaginationQuery(req);
        Base.multiDataRequest(req, res, [
            {url: '/api/tasks/statement//materialSummary/item?'+ queryString.stringify(req.query), method: 'GET', resConfig: {keyName: 'outMateDetail', is_must: true}},
        ], function (req, res, resultList) {

            var paginationInfo = resultList.outMateDetail;

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
            res.render('order/report/inMateRepDetail', returnData);
        });

    },
    storeRepPage: function (req, res) {

        var type=req.query.type;
        if(!type){
            type=99999996;
        }
       //  console.log(4545,'/api/stores/report?roleId='+type+'&'+queryString.stringify(req.query));
        var paramObject = helper.genPaginationQuery(req);
        Base.multiDataRequest(req, res, [
            {url:  '/api/stores/report?roleId='+type+'&'+queryString.stringify(req.query), method: 'GET', resConfig: {keyName: 'storeRepList', is_must: true}},
            {url: '/api/stores/list', method: 'GET', resConfig: {keyName: 'storesList', is_must: false}},
            {url: '/api/stores/report/getRegionTypeByGid', method: 'GET', resConfig: {keyName: 'regionList', is_must: true}},
        ], function (req, res, resultList) {
            var paginationInfo = resultList.storeRepList;
            var boostrapPaginator = new Pagination.TemplatePaginator(helper.genPageInfo({
                prelink: paramObject.withoutPageNo,
                current: paginationInfo.page,
                rowsPerPage: paginationInfo.pageSize,
                totalResult: paginationInfo.totalItems
            }));
            var returnData = Base.mergeData(helper.mergeObject({
                title: ' ',
                type:type,
                pagination: boostrapPaginator.render(),
            },resultList));
            res.render('order/report/storeRep', returnData);
        });
    },
    showTaskseqPage:function (req, res) {
        var worker=req.params.worker;
        var type=req.params.type;
        var gid=req.params.gid;

        var paramObject = helper.genPaginationQuery(req);
        Base.multiDataRequest(req, res, [
                {url:'/api/stores/report/'+worker+'/'+type+'/'+gid+'?'+queryString.stringify(req.query), method: 'GET', resConfig: {keyName: 'showTaskseqList', is_must: true}},
            ],
            function (req, res, resultList) {
                var paginationInfo = resultList.showTaskseqList;
                var boostrapPaginator = new Pagination.TemplatePaginator(helper.genPageInfo({
                    prelink: paramObject.withoutPageNo,
                    current: paginationInfo.page,
                    rowsPerPage: paginationInfo.pageSize,
                    totalResult: paginationInfo.totalItems
                }));
                var returnData = Base.mergeData(helper.mergeObject({
                    title: ' ',
                    type:worker,
                    pagination: boostrapPaginator.render(),
                },resultList));
                res.render('order/report/showTaskseqLids', returnData);

            });
    },
    taskPlanPage: function (req, res) {
        var baseUrl;
        var taskId=req.query.taskId;
        if(taskId){
            baseUrl=[
                {url: '/api/tasks/statement/list', method: 'GET', resConfig: {keyName: 'statementList', is_must: true}},
                {url:'/api/tasks/statement/listDetail?'+queryString.stringify(req.query), method: 'GET', resConfig: {keyName: 'taskPlanList', is_must: true}},
            ];
        }
        else{
            baseUrl=[
                {url: '/api/tasks/statement/list', method: 'GET', resConfig: {keyName: 'statementList', is_must: true}},
            ]
        }
        Base.multiDataRequest(req, res, baseUrl,function (req, res, resultList) {

         //   console.log(5858,JSON.stringify(resultList));
            var returnData = Base.mergeData(helper.mergeObject({
                title: ' ',
                type:taskId
            },resultList));
            res.render('order/report/taskPlan',returnData);
        });

    },
    doTaskPlan: function (req, res) {
        request(Base.mergeRequestOptions({
            method: 'post',
            url: '/api/tasks/statement/taskManual',
            form: req.body
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                Base.handlerSuccess(res,req);
                res.redirect('/taskPlan');
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })
    },
    pageBatchByMonth: function (req, res) {

        var paramObject = helper.genPaginationQuery(req);
        Base.multiDataRequest(req, res, [
            {url: '/api/tasks/statement/pagebatchByMonth?'+ queryString.stringify(req.query), method: 'GET', resConfig: {keyName: 'pagebatchByMonthList', is_must: true}},
        ], function (req, res, resultList) {

            var paginationInfo = resultList.pagebatchByMonthList;

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
            res.render('order/report/pageBatchByMonth', returnData);
        });

    },
    pageAccessoryByMonth: function (req, res) {

        var paramObject = helper.genPaginationQuery(req);
        Base.multiDataRequest(req, res, [
            {url: '/api/tasks/statement/pageAccessoryByMonth?'+ queryString.stringify(req.query), method: 'GET', resConfig: {keyName: 'pageAccessoryByMonthList', is_must: true}},
        ], function (req, res, resultList) {

            var paginationInfo = resultList.pageAccessoryByMonthList;

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
            res.render('order/report/pageAccessoryByMonth', returnData);
        });

    },


};
module.exports = ReportController;

