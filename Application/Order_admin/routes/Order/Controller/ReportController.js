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
    reportPage: function (req, res) {
        var returnData = Base.mergeData(helper.mergeObject({
            title: ' ',
            Permission :Permissions,
        }));
        res.render('order/report/report', returnData);
    },
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
                pagination: boostrapPaginator.render(),
                Permission :Permissions,
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
                pagination: boostrapPaginator.render(),
                Permission :Permissions,
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
                Permission :Permissions,
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
                pagination: boostrapPaginator.render(),
                Permission :Permissions,
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
                pagination: boostrapPaginator.render(),
                Permission :Permissions,
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
                pagination: boostrapPaginator.render(),
                Permission :Permissions,
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


        var paramObject = helper.genPaginationQuery(req);
        Base.multiDataRequest(req, res, [
            {url:  '/api/stores/report/getReportByDesigner?'+queryString.stringify(req.query), method: 'GET', resConfig: {keyName: 'storeRepList', is_must: true}},
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
                pagination: boostrapPaginator.render(),
                Permission :Permissions,
            },resultList));
            res.render('order/report/storeRep', returnData);
        });
    },
    storeRepAdviser: function (req, res) {

        var paramObject = helper.genPaginationQuery(req);
        Base.multiDataRequest(req, res, [
            {url:  '/api/stores/report/getReportByAdviser?'+queryString.stringify(req.query), method: 'GET', resConfig: {keyName: 'storeRepList', is_must: true}},
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
                pagination: boostrapPaginator.render(),
                Permission :Permissions,
            },resultList));
            res.render('order/report/storeRepAdviser', returnData);
        });
    },

    storeRepWard: function (req, res) {

        var paramObject = helper.genPaginationQuery(req);
        Base.multiDataRequest(req, res, [
            {url:  '/api/stores/report/getReportByWard?'+queryString.stringify(req.query), method: 'GET', resConfig: {keyName: 'storeRepList', is_must: true}},
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
                pagination: boostrapPaginator.render(),
                Permission :Permissions,
            },resultList));
            res.render('order/report/storeRepWard', returnData);
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
                pagination: boostrapPaginator.render(),
                Permission :Permissions,
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
                pagination: boostrapPaginator.render(),
                Permission :Permissions,
            },resultList));
            res.render('order/report/pageAccessoryByMonth', returnData);
        });

    },
    reportOrderSource: function (req, res) {
        if(!req.query.startTime){
            var dayTime= new Date().format("yyyy-MM-dd");
            return res.redirect('/report/order/source?startTime='+dayTime+'&endTime='+dayTime);
        }
        Base.multiDataRequest(req, res, [
            {url: '/api/orders/stat/orderSource?'+ queryString.stringify(req.query), method: 'GET', resConfig: {keyName: 'dataList', is_must: true}},
        ], function (req, res, resultList) {
            var returnData = Base.mergeData(helper.mergeObject({
                title: ' ',
                Permission :Permissions,
            },resultList));
            res.render('order/report/reportOrderSource', returnData);
        });

    },
    reportOrderState: function (req, res) {
     //   console.log(56656,'/api/orders/stat/orderStatus?'+ queryString.stringify(req.query));
        if(!req.query.startTime){
            var dayTime= new Date().format("yyyy-MM-dd");
            return res.redirect('/report/order/state?startTime='+dayTime+'&endTime='+dayTime);
        }
        Base.multiDataRequest(req, res, [
            {url: '/api/orders/stat/orderStatus?'+ queryString.stringify(req.query), method: 'GET', resConfig: {keyName: 'dataList', is_must: true}},
        ], function (req, res, resultList) {
            var returnData = Base.mergeData(helper.mergeObject({
                title: ' ',
                Permission :Permissions,
            },resultList));
            res.render('order/report/reportOrderState', returnData);
        });

    },
    reportOrderSemiPro: function (req, res) {
      if(!req.query.startTime){
        var dayTime= new Date().format("yyyy-MM-dd");
        return res.redirect('/report/order/semiPro?startTime='+dayTime+'&endTime='+dayTime);
      }
      var paramObject = helper.genPaginationQuery(req);
      Base.multiDataRequest(req, res, [
        {url: '/api/whse/report/halflist?'+ queryString.stringify(req.query), method: 'GET', resConfig: {keyName: 'dataList', is_must: true}},
      ], function (req, res, resultList) {
        var paginationInfo = resultList.dataList;

        var boostrapPaginator = new Pagination.TemplatePaginator(helper.genPageInfo({
          prelink: paramObject.withoutPageNo,
          current: paginationInfo.page,
          rowsPerPage: paginationInfo.pageSize,
          totalResult: paginationInfo.totalItems
        }));

        var returnData = Base.mergeData(helper.mergeObject({
          title: ' ',
          pagination: boostrapPaginator.render(),
          Permission :Permissions,
        },resultList));
        res.render('order/report/reportOrderSemiPro', returnData);
      });
    },
    reportOrderfinishPro: function (req, res) {
      if(!req.query.startTime){
        var dayTime= new Date().format("yyyy-MM-dd");
        return res.redirect('/report/order/finishPro?startTime='+dayTime+'&endTime='+dayTime);
      }
      var paramObject = helper.genPaginationQuery(req);
      Base.multiDataRequest(req, res, [
        {url: '/api/whse/report/list?'+ queryString.stringify(req.query), method: 'GET', resConfig: {keyName: 'dataList', is_must: true}},
      ], function (req, res, resultList) {
        var paginationInfo = resultList.dataList;

        var boostrapPaginator = new Pagination.TemplatePaginator(helper.genPageInfo({
          prelink: paramObject.withoutPageNo,
          current: paginationInfo.page,
          rowsPerPage: paginationInfo.pageSize,
          totalResult: paginationInfo.totalItems
        }));

        var returnData = Base.mergeData(helper.mergeObject({
          title: ' ',
          pagination: boostrapPaginator.render(),
          Permission :Permissions,
        },resultList));
        res.render('order/report/reportOrderFinishPro', returnData);
      });
    },
    productDetailOrder: function (req, res) {
        if(!req.query.startTime){
            var dayTime= new Date().format("yyyy-MM-dd");
            return res.redirect('/report/order/product_detail?startTime='+dayTime+'&endTime='+dayTime);
        }
        var paramObject = helper.genPaginationQuery(req);
        Base.multiDataRequest(req, res, [
            {url: '/api/orders/stat/review?'+ queryString.stringify(req.query), method: 'GET', resConfig: {keyName: 'dataList', is_must: true}},
        ], function (req, res, resultList) {
            var paginationInfo = resultList.dataList;

            var boostrapPaginator = new Pagination.TemplatePaginator(helper.genPageInfo({
                prelink: paramObject.withoutPageNo,
                current: paginationInfo.page,
                rowsPerPage: paginationInfo.pageSize,
                totalResult: paginationInfo.totalItems
            }));

            var returnData = Base.mergeData(helper.mergeObject({
                title: ' ',
                pagination: boostrapPaginator.render(),
                Permission :Permissions,
            },resultList));
            res.render('order/report/reportOrderExamination', returnData);
        });
    },
    separateBillOrder: function (req, res) {

        if(!req.query.startTime){
            var dayTime= new Date().format("yyyy-MM-dd");
            return res.redirect('/report/order/separate_bill?startTime='+dayTime+'&endTime='+dayTime);
        }
        var paramObject = helper.genPaginationQuery(req);
        Base.multiDataRequest(req, res, [
            {url: '/api/orders/stat/apart?'+ queryString.stringify(req.query), method: 'GET', resConfig: {keyName: 'dataList', is_must: true}},
        ], function (req, res, resultList) {

            var paginationInfo = resultList.dataList;

            var boostrapPaginator = new Pagination.TemplatePaginator(helper.genPageInfo({
                prelink: paramObject.withoutPageNo,
                current: paginationInfo.page,
                rowsPerPage: paginationInfo.pageSize,
                totalResult: paginationInfo.totalItems
            }));

            var returnData = Base.mergeData(helper.mergeObject({
                title: ' ',
                pagination: boostrapPaginator.render(),
                Permission :Permissions,
            },resultList));
            res.render('order/report/reportOrderSeparateBill', returnData);
        });
    },
    removeTrialOrder: function (req, res) {
        if(!req.query.startTime){
            var dayTime= new Date().format("yyyy-MM-dd");
            return res.redirect('/report/order/remove_trial?startTime='+dayTime+'&endTime='+dayTime);
        }
        var paramObject = helper.genPaginationQuery(req);
        Base.multiDataRequest(req, res, [
            {url: '/api/orders/stat/apartReview?'+ queryString.stringify(req.query), method: 'GET', resConfig: {keyName: 'dataList', is_must: true}},
        ], function (req, res, resultList) {

            var paginationInfo = resultList.dataList;

            var boostrapPaginator = new Pagination.TemplatePaginator(helper.genPageInfo({
                prelink: paramObject.withoutPageNo,
                current: paginationInfo.page,
                rowsPerPage: paginationInfo.pageSize,
                totalResult: paginationInfo.totalItems
            }));

            var returnData = Base.mergeData(helper.mergeObject({
                title: ' ',
                pagination: boostrapPaginator.render(),
                Permission :Permissions,
            },resultList));
            res.render('order/report/reportOrderRemoveTrial', returnData);
        });
    },
    nestingOrder: function (req, res) {
        if(!req.query.startTime){
            var dayTime= new Date().format("yyyy-MM-dd");
            return res.redirect('/report/order/nesting?startTime='+dayTime+'&endTime='+dayTime);
        }
        var paramObject = helper.genPaginationQuery(req);
        Base.multiDataRequest(req, res, [
            {url: '/api/orders/stat/schedule?'+ queryString.stringify(req.query), method: 'GET', resConfig: {keyName: 'dataList', is_must: true}},
        ], function (req, res, resultList) {

            var paginationInfo = resultList.dataList;

            var boostrapPaginator = new Pagination.TemplatePaginator(helper.genPageInfo({
                prelink: paramObject.withoutPageNo,
                current: paginationInfo.page,
                rowsPerPage: paginationInfo.pageSize,
                totalResult: paginationInfo.totalItems
            }));

            var returnData = Base.mergeData(helper.mergeObject({
                title: ' ',
                pagination: boostrapPaginator.render(),
                Permission :Permissions,
            },resultList));
            res.render('order/report/reportOrderNesting', returnData);
        });
    },
    chargeBackOrder: function (req, res) {
        if(!req.query.startTime){
            var dayTime= new Date().format("yyyy-MM-dd");
            return res.redirect('/report/order/chargeback?startTime='+dayTime+'&endTime='+dayTime);
        }
        var paramObject = helper.genPaginationQuery(req);
        Base.multiDataRequest(req, res, [
            {url: '/api/orders/stat/backOrder?'+ queryString.stringify(req.query), method: 'GET', resConfig: {keyName: 'dataList', is_must: true}},
        ], function (req, res, resultList) {

            var paginationInfo = resultList.dataList;

            var boostrapPaginator = new Pagination.TemplatePaginator(helper.genPageInfo({
                prelink: paramObject.withoutPageNo,
                current: paginationInfo.page,
                rowsPerPage: paginationInfo.pageSize,
                totalResult: paginationInfo.totalItems
            }));

            var returnData = Base.mergeData(helper.mergeObject({
                title: ' ',
                pagination: boostrapPaginator.render(),
                Permission :Permissions,
            },resultList));
            res.render('order/report/reportOrderChargeBack', returnData);
        });
    },
    exportProductDetail: function (req, res) {
        request(Base.mergeRequestOptions({
            method: 'post',
            url: '/api/orders/stat/export/review',
            form:JSON.parse(req.body.mytest),
        }, req, res)).pipe(res)
    },
   exportSemiPro: function (req, res) {
        request(Base.mergeRequestOptions({
          method: 'post',
          url: '/api/whse/report/export/halfList',
          form:JSON.parse(req.body.order),
        }, req, res)).pipe(res)
    },
    exportFinishPro: function (req, res) {
        request(Base.mergeRequestOptions({
          method: 'post',
          url: '/api/whse/report/export/list',
          form:JSON.parse(req.body.order),
        }, req, res)).pipe(res)
    },
    exportSeparateBill: function (req, res) {
        request(Base.mergeRequestOptions({
            method: 'post',
            url: '/api/orders/stat/export/apart',
            form:JSON.parse(req.body.mytest),
        }, req, res)).pipe(res)
    },
    exportRemoveTrial: function (req, res) {
        request(Base.mergeRequestOptions({
            method: 'post',
            url: '/api/orders/stat/export/apartReview',
            form:JSON.parse(req.body.mytest),
        }, req, res)).pipe(res)
    },
    exportNesting: function (req, res) {
        request(Base.mergeRequestOptions({
            method: 'post',
            url: '/api/orders/stat/export/schedule',
            form:JSON.parse(req.body.mytest),
        }, req, res)).pipe(res)
    },
    exportChargeBack: function (req, res) {
        request(Base.mergeRequestOptions({
            method: 'post',
            url: '/api/orders/stat/export/backOrder',
            form:JSON.parse(req.body.mytest),
        }, req, res)).pipe(res)
    },



    suppRateStore: function (req, res) {

        var paramObject = helper.genPaginationQuery(req);
        Base.multiDataRequest(req, res, [
            {url: '/api/orders/stat/storeResupplyRate?'+ queryString.stringify(req.query), method: 'GET', resConfig: {keyName: 'dataList', is_must: true}},
        ], function (req, res, resultList) {

            var paginationInfo = resultList.dataList;

            var boostrapPaginator = new Pagination.TemplatePaginator(helper.genPageInfo({
                prelink: paramObject.withoutPageNo,
                current: paginationInfo.page,
                rowsPerPage: paginationInfo.pageSize,
                totalResult: paginationInfo.totalItems
            }));

            var returnData = Base.mergeData(helper.mergeObject({
                title: ' ',
                pagination: boostrapPaginator.render(),
                Permission :Permissions,
            },resultList));
            res.render('order/report/suppRateStore', returnData);
        });

    },
    suppRateOrderPeople: function (req, res) {

        var paramObject = helper.genPaginationQuery(req);
        Base.multiDataRequest(req, res, [
            {url: '/api/orders/stat/employeeResupplyRate?'+ queryString.stringify(req.query), method: 'GET', resConfig: {keyName: 'dataList', is_must: true}},
        ], function (req, res, resultList) {

            var paginationInfo = resultList.dataList;

            var boostrapPaginator = new Pagination.TemplatePaginator(helper.genPageInfo({
                prelink: paramObject.withoutPageNo,
                current: paginationInfo.page,
                rowsPerPage: paginationInfo.pageSize,
                totalResult: paginationInfo.totalItems
            }));

            var returnData = Base.mergeData(helper.mergeObject({
                title: ' ',
                pagination: boostrapPaginator.render(),
                Permission :Permissions,
            },resultList));
            res.render('order/report/suppRateOrderPeople', returnData);
        });

    },
    costRateDepart: function (req, res) {

        var paramObject = helper.genPaginationQuery(req);
        Base.multiDataRequest(req, res, [
            {url: '/api/orders/stat/departmentResupplyRate?'+ queryString.stringify(req.query), method: 'GET', resConfig: {keyName: 'dataList', is_must: true}},
        ], function (req, res, resultList) {

            var paginationInfo = resultList.dataList;

            var boostrapPaginator = new Pagination.TemplatePaginator(helper.genPageInfo({
                prelink: paramObject.withoutPageNo,
                current: paginationInfo.page,
                rowsPerPage: paginationInfo.pageSize,
                totalResult: paginationInfo.totalItems
            }));

            var returnData = Base.mergeData(helper.mergeObject({
                title: ' ',
                pagination: boostrapPaginator.render(),
                Permission :Permissions,
            },resultList));
            res.render('order/report/costRateDepart', returnData);
        });

    },
    cashFlowPage: function (req, res) {

        var paramObject = helper.genPaginationQuery(req);
        Base.multiDataRequest(req, res, [
            {url: '/api/stores/money/pageShopMoneyChange?'+ queryString.stringify(req.query), method: 'GET', resConfig: {keyName: 'dataList', is_must: true}},
        ], function (req, res, resultList) {

            var paginationInfo = resultList.dataList.page;

            var boostrapPaginator = new Pagination.TemplatePaginator(helper.genPageInfo({
                prelink: paramObject.withoutPageNo,
                current: paginationInfo.page,
                rowsPerPage: paginationInfo.pageSize,
                totalResult: paginationInfo.totalItems
            }));

            var returnData = Base.mergeData(helper.mergeObject({
                title: ' ',
                pagination: boostrapPaginator.render(),
                Permission :Permissions,
            },resultList));
            res.render('order/report/cashFlow', returnData);
        });

    },
    exportcashFlow: function (req, res) {
        request(Base.mergeRequestOptions({
            method: 'post',
            url: '/api/stores/money/moneyPage/export',
            form:JSON.parse(req.body.mytest),
        }, req, res)).pipe(res)
    },
    storeSalesPage: function (req, res) {
        if(!req.query.date){
            var dayTime= new Date().format("yyyy-MM");
            return res.redirect('/report/store/sales?date='+dayTime);
        }
        var paramObject = helper.genPaginationQuery(req);
        Base.multiDataRequest(req, res, [
            {url: '/api/orders/stat/storeSales?'+ queryString.stringify(req.query), method: 'GET', resConfig: {keyName: 'dataList', is_must: true}},
        ], function (req, res, resultList) {

            var paginationInfo = resultList.dataList;

            var boostrapPaginator = new Pagination.TemplatePaginator(helper.genPageInfo({
                prelink: paramObject.withoutPageNo,
                current: paginationInfo.page,
                rowsPerPage: paginationInfo.pageSize,
                totalResult: paginationInfo.totalItems
            }));

            var returnData = Base.mergeData(helper.mergeObject({
                title: ' ',
                pagination: boostrapPaginator.render(),
                Permission :Permissions,
            },resultList));
            res.render('order/report/storeSales', returnData);
        });

    },

    storeSalesAreasPage: function (req, res) {
    if(!req.query.startDate){
      var dayTime= new Date().format("yyyy-MM-dd");
      return res.redirect('/report/store/salesAreas?startDate='+dayTime+'&endDate='+dayTime);
    }
    var paramObject = helper.genPaginationQuery(req);
    Base.multiDataRequest(req, res, [
      {url: '/api/stores/report/pageSaleDistrict?'+ queryString.stringify(req.query), method: 'GET', resConfig: {keyName: 'dataList', is_must: true}},
    ], function (req, res, resultList) {

      var paginationInfo = resultList.dataList;

      var boostrapPaginator = new Pagination.TemplatePaginator(helper.genPageInfo({
        prelink: paramObject.withoutPageNo,
        current: paginationInfo.page,
        rowsPerPage: paginationInfo.pageSize,
        totalResult: paginationInfo.totalItems
      }));

      var returnData = Base.mergeData(helper.mergeObject({
        title: ' ',
        pagination: boostrapPaginator.render(),
        Permission :Permissions,
      },resultList));
      res.render('order/report/storeSalesAreas', returnData);
    });

    },

    workpieceNestingPage: function (req, res) {

        var paramObject = helper.genPaginationQuery(req);
        Base.multiDataRequest(req, res, [
            {url: '/api/orders/package/schedule?'+ queryString.stringify(req.query), method: 'GET', resConfig: {keyName: 'dataList', is_must: true}},
        ], function (req, res, resultList) {

            var paginationInfo = resultList.dataList;

            var boostrapPaginator = new Pagination.TemplatePaginator(helper.genPageInfo({
                prelink: paramObject.withoutPageNo,
                current: paginationInfo.page,
                rowsPerPage: paginationInfo.pageSize,
                totalResult: paginationInfo.totalItems
            }));

            var returnData = Base.mergeData(helper.mergeObject({
                title: ' ',
                pagination: boostrapPaginator.render(),
                Permission :Permissions,
            },resultList));
            res.render('order/report/workpiece_nesting', returnData);
        });

    },
    exportWorkpieceNesting: function (req, res) {
        request(Base.mergeRequestOptions({
            method: 'post',
            url: '/api/orders/package/export/schedule',
            form:JSON.parse(req.body.mytest),
        }, req, res)).pipe(res)
    },
  exportWorkpieceApart: function (req, res) {
    request(Base.mergeRequestOptions({
      method: 'post',
      url: '/api/orders/package/export/apart',
      form:JSON.parse(req.body.mytest),
    }, req, res)).pipe(res)
  },
  exportWorkpieceApartAll: function (req, res) {
    request(Base.mergeRequestOptions({
      method: 'post',
      url: '/api/orders/package/export/static/apart',
      form:JSON.parse(req.body.mytest),
    }, req, res)).pipe(res)
  },
  workpieceApartPage: function (req, res) {

    var paramObject = helper.genPaginationQuery(req);
    Base.multiDataRequest(req, res, [
      {url: '/api/orders/package/apart?'+ queryString.stringify(req.query), method: 'GET', resConfig: {keyName: 'dataList', is_must: true}},
    ], function (req, res, resultList) {

      var paginationInfo = resultList.dataList;

      var boostrapPaginator = new Pagination.TemplatePaginator(helper.genPageInfo({
        prelink: paramObject.withoutPageNo,
        current: paginationInfo.page,
        rowsPerPage: paginationInfo.pageSize,
        totalResult: paginationInfo.totalItems
      }));

      var returnData = Base.mergeData(helper.mergeObject({
        title: ' ',
        pagination: boostrapPaginator.render(),
        Permission :Permissions,
      },resultList));
      res.render('order/report/workpiece_apart', returnData);
    });

  },
  workpieceApartAllPage: function (req, res) {
    var paramObject = helper.genPaginationQuery(req);
    Base.multiDataRequest(req, res, [
      {url: '/api/orders/package/apart/static?'+queryString.stringify(req.query), method: 'GET', resConfig: {keyName: 'dataList', is_must: true}},
    ], function (req, res, resultList) {

      var paginationInfo = resultList.dataList;

      var boostrapPaginator = new Pagination.TemplatePaginator(helper.genPageInfo({
        prelink: paramObject.withoutPageNo,
        current: paginationInfo.page,
        rowsPerPage: paginationInfo.pageSize,
        totalResult: paginationInfo.totalItems
      }));

      var returnData = Base.mergeData(helper.mergeObject({
        title: ' ',
        pagination: boostrapPaginator.render(),
        Permission :Permissions,
      },resultList));
      res.render('order/report/workpiece_apart_all', returnData);
    });

  },
    workpieceNestingAllPage: function (req, res) {
        var paramObject = helper.genPaginationQuery(req);
        Base.multiDataRequest(req, res, [
            {url: '/api/orders/package/schedule/static?'+queryString.stringify(req.query), method: 'GET', resConfig: {keyName: 'dataList', is_must: true}},
        ], function (req, res, resultList) {

            var paginationInfo = resultList.dataList;

            var boostrapPaginator = new Pagination.TemplatePaginator(helper.genPageInfo({
                prelink: paramObject.withoutPageNo,
                current: paginationInfo.page,
                rowsPerPage: paginationInfo.pageSize,
                totalResult: paginationInfo.totalItems
            }));

            var returnData = Base.mergeData(helper.mergeObject({
                title: ' ',
                pagination: boostrapPaginator.render(),
                Permission :Permissions,
            },resultList));
            res.render('order/report/workpiece_nesting_all', returnData);
        });

    },
    exportWorkpieceNestingAll: function (req, res) {
        request(Base.mergeRequestOptions({
            method: 'post',
            url: '/api/orders/package/export/static/schedule',
            form:JSON.parse(req.body.mytest),
        }, req, res)).pipe(res)
    },
    partNestingPage: function (req, res) {

        var paramObject = helper.genPaginationQuery(req);
        Base.multiDataRequest(req, res, [
            {url: '/api/orders/package/accessory/schedule?'+ queryString.stringify(req.query), method: 'GET', resConfig: {keyName: 'dataList', is_must: true}},
        ], function (req, res, resultList) {

            var paginationInfo = resultList.dataList;

            var boostrapPaginator = new Pagination.TemplatePaginator(helper.genPageInfo({
                prelink: paramObject.withoutPageNo,
                current: paginationInfo.page,
                rowsPerPage: paginationInfo.pageSize,
                totalResult: paginationInfo.totalItems
            }));

            var returnData = Base.mergeData(helper.mergeObject({
                title: ' ',
                pagination: boostrapPaginator.render(),
                Permission :Permissions,
            },resultList));
            res.render('order/report/part_nesting', returnData);
        });

    },
    exportPartNesting: function (req, res) {
        request(Base.mergeRequestOptions({
            method: 'post',
            url: '/api/orders/package/export/accessory/schedule',
            form:JSON.parse(req.body.mytest),
        }, req, res)).pipe(res)
    },
    partNestingAllPage: function (req, res) {
        var paramObject = helper.genPaginationQuery(req);
        Base.multiDataRequest(req, res, [
            {url: '/api/orders/package/accessory/schedule/static?'+queryString.stringify(req.query), method: 'GET', resConfig: {keyName: 'dataList', is_must: true}},
        ], function (req, res, resultList) {

            var paginationInfo = resultList.dataList;

            var boostrapPaginator = new Pagination.TemplatePaginator(helper.genPageInfo({
                prelink: paramObject.withoutPageNo,
                current: paginationInfo.page,
                rowsPerPage: paginationInfo.pageSize,
                totalResult: paginationInfo.totalItems
            }));

            var returnData = Base.mergeData(helper.mergeObject({
                title: ' ',
                pagination: boostrapPaginator.render(),
                Permission :Permissions,
            },resultList));
            res.render('order/report/part_nesting_all', returnData);
        });

    },
    exportPartNestingAll: function (req, res) {
        request(Base.mergeRequestOptions({
            method: 'post',
            url: '/api/orders/package/export/accessory/static/schedule',
            form:JSON.parse(req.body.mytest),
        }, req, res)).pipe(res)
    },
  exportPartApart: function (req, res) {
    request(Base.mergeRequestOptions({
      method: 'post',
      url: '/api/orders/package/export/accessory/apart',
      form:JSON.parse(req.body.mytest),
    }, req, res)).pipe(res)
  },
  exportPartApartAll: function (req, res) {
    request(Base.mergeRequestOptions({
      method: 'post',
      url: '/api/orders/package/export/accessory/static/apart',
      form:JSON.parse(req.body.mytest),
    }, req, res)).pipe(res)
  },
    modifyPricePage: function (req, res) {
        var paramObject = helper.genPaginationQuery(req);
        Base.multiDataRequest(req, res, [
            {url: '/api/orders/stat/modifyPrice?'+queryString.stringify(req.query), method: 'GET', resConfig: {keyName: 'dataList', is_must: true}},
        ], function (req, res, resultList) {

            var paginationInfo = resultList.dataList;

            var boostrapPaginator = new Pagination.TemplatePaginator(helper.genPageInfo({
                prelink: paramObject.withoutPageNo,
                current: paginationInfo.page,
                rowsPerPage: paginationInfo.pageSize,
                totalResult: paginationInfo.totalItems
            }));

            var returnData = Base.mergeData(helper.mergeObject({
                title: ' ',
                pagination: boostrapPaginator.render(),
                Permission :Permissions,
            },resultList));
            res.render('order/report/modify_price', returnData);
        });

    },
    exportModifyPrice: function (req, res) {
        request(Base.mergeRequestOptions({
            method: 'post',
            url: '/api/orders/stat/export/modifyPrice',
            form:JSON.parse(req.body.mytest),
        }, req, res)).pipe(res)
    },
  partApartPage: function (req, res) {

    var paramObject = helper.genPaginationQuery(req);
    Base.multiDataRequest(req, res, [
      {url: '/api/orders/package/accessory/apart?'+ queryString.stringify(req.query), method: 'GET', resConfig: {keyName: 'dataList', is_must: true}},
    ], function (req, res, resultList) {

      var paginationInfo = resultList.dataList;

      var boostrapPaginator = new Pagination.TemplatePaginator(helper.genPageInfo({
        prelink: paramObject.withoutPageNo,
        current: paginationInfo.page,
        rowsPerPage: paginationInfo.pageSize,
        totalResult: paginationInfo.totalItems
      }));

      var returnData = Base.mergeData(helper.mergeObject({
        title: ' ',
        pagination: boostrapPaginator.render(),
        Permission :Permissions,
      },resultList));
      res.render('order/report/part_apart', returnData);
    });

  },
  partApartAllPage: function (req, res) {
    var paramObject = helper.genPaginationQuery(req);
    Base.multiDataRequest(req, res, [
      {url: '/api/orders/package/accessory/apart/static?'+queryString.stringify(req.query), method: 'GET', resConfig: {keyName: 'dataList', is_must: true}},
    ], function (req, res, resultList) {

      var paginationInfo = resultList.dataList;

      var boostrapPaginator = new Pagination.TemplatePaginator(helper.genPageInfo({
        prelink: paramObject.withoutPageNo,
        current: paginationInfo.page,
        rowsPerPage: paginationInfo.pageSize,
        totalResult: paginationInfo.totalItems
      }));

      var returnData = Base.mergeData(helper.mergeObject({
        title: ' ',
        pagination: boostrapPaginator.render(),
        Permission :Permissions,
      },resultList));
      res.render('order/report/part_apart_all', returnData);
    });

  },
    echart: function (req, res) {
        var currentYear = new Date().getFullYear();
        var chartTitle = '';
        var apiUrl = '';

        var type = req.params.type;
        var year = req.query.startYearDate? req.query.startYearDate: currentYear;
        if(type == 'customer'){
            chartTitle = year+'年客户统计';
            apiUrl = '/api/orders/stat/countCustomer?startYearDate='+year+'&pattern=2'
        }else if(type == 'order') {
            chartTitle = year+'年订单统计';
            apiUrl = '/api/orders/stat/countOrder?startYearDate='+year+'&pattern=2'
        }else if(type == 'money') {
            chartTitle = year+'年资金统计';
            apiUrl = '/api/orders/stat/countMoney?startYearDate='+year+'&pattern=2'
        }

        Base.multiDataRequest(req, res, [
            {url: apiUrl, method: 'GET', resConfig: {keyName: 'dataList', is_must: true}},
        ], function (req, res, resultList) {

            var dataList = resultList.dataList;
            var chertData = {
                xAxis: [],
                data: {}
            };
            if(type == 'customer'){
                chertData.data = {
                    addedAmount: [],
                    dealtAmount: [],
                    measuredAmount: [],
                }
                for(var i=0; i<dataList.length; i++){
                    chertData.xAxis.push(dataList[i].month);
                    chertData.data.addedAmount.push(dataList[i].addedAmount);
                    chertData.data.dealtAmount.push(dataList[i].dealtAmount);
                    chertData.data.measuredAmount.push(dataList[i].measuredAmount);
                }
            }else if(type == 'order') {
                chertData.data = {
                    addedAmount: [],
                    payedAmount: [],
                    sentAmount: [],
                    closedAmount: [],
                }
                for(var i=0; i<dataList.length; i++){
                    chertData.xAxis.push(dataList[i].month);
                    chertData.data.addedAmount.push(dataList[i].addedAmount);
                    chertData.data.payedAmount.push(dataList[i].payedAmount);
                    chertData.data.sentAmount.push(dataList[i].sentAmount);
                    chertData.data.closedAmount.push(dataList[i].closedAmount);
                }
            }else if(type == 'money') {
                chertData.data = {
                    rechargeMoney: [],
                    receiptMoney: [],
                }
                for(var i=0; i<dataList.length; i++){
                    chertData.xAxis.push(dataList[i].month);
                    chertData.data.rechargeMoney.push(dataList[i].rechargeMoney);
                    chertData.data.receiptMoney.push(dataList[i].receiptMoney);
                }
            }

            resultList.dataList = chertData;
            // console.log('chertData',chertData)

            var returnData = Base.mergeData(helper.mergeObject({
                title: ' ',
                currentYear: currentYear,
                chartTitle: chartTitle,
                chartType: type,
                Permission :Permissions,
            },resultList));
            res.render('order/echarts/index', returnData);
        });

    },

    exportOrderSource: function (req, res) {
        request(Base.mergeRequestOptions({
            method: 'post',
            url: '/api/orders/stat/export/orderSource',
            form:JSON.parse(req.body.mytest),
        }, req, res)).pipe(res)
    },
    exportStoreDesigner: function (req, res) {
        request(Base.mergeRequestOptions({
            method: 'post',
            url: '/api/stores/report/export/getReportByDesigner',
            form:JSON.parse(req.body.mytest),
        }, req, res)).pipe(res)
    },
    exportStoreAdviser: function (req, res) {
        request(Base.mergeRequestOptions({
            method: 'post',
            url: '/api/stores/report/export/getReportByAdviser',
            form:JSON.parse(req.body.mytest),
        }, req, res)).pipe(res)
    },
    exportStoreWard: function (req, res) {
        request(Base.mergeRequestOptions({
            method: 'post',
            url: '/api/stores/report/export/getReportByWard',
            form:JSON.parse(req.body.mytest),
        }, req, res)).pipe(res)
    },
    exportStoreConditions: function (req, res) {
        request(Base.mergeRequestOptions({
            method: 'post',
            url: '/api/orders/stat/export/getReportByConditions',
            form:JSON.parse(req.body.mytest),
        }, req, res)).pipe(res)
    },
    employeeResupplyRate: function (req, res) {
        request(Base.mergeRequestOptions({
            method: 'post',
            url: '/api/orders/stat/export/employeeResupplyRate',
            form:JSON.parse(req.body.mytest),
        }, req, res)).pipe(res)
    },
    departmentResupplyRate: function (req, res) {
        request(Base.mergeRequestOptions({
            method: 'post',
            url: '/api/orders/stat/export/departmentResupplyRate',
            form:JSON.parse(req.body.mytest),
        }, req, res)).pipe(res)
    },
    storeSales: function (req, res) {
        request(Base.mergeRequestOptions({
            method: 'post',
            url: '/api/orders/stat/export/storeSales',
            form:JSON.parse(req.body.mytest),
        }, req, res)).pipe(res)
    },
    storeSalesAreas: function (req, res) {
        request(Base.mergeRequestOptions({
          method: 'post',
          url: '/api/stores/report/export/saleDistrict',
          form:JSON.parse(req.body.salesAreas),
        }, req, res)).pipe(res)
    },
    batchMaterPrice: function (req, res) {
        request(Base.mergeRequestOptions({
            method: 'post',
            url: '/api/tasks/statement/export/pageBatchPriceByEveryDay',
            form:JSON.parse(req.body.mytest),
        }, req, res)).pipe(res)
    },
    orderMaterPrice: function (req, res) {
        request(Base.mergeRequestOptions({
            method: 'post',
            url: '/api/tasks/statement/export/pagePriceByEveryDay',
            form:JSON.parse(req.body.mytest),
        }, req, res)).pipe(res)
    },
    materPriceMonth: function (req, res) {
        request(Base.mergeRequestOptions({
            method: 'post',
            url: '/api/tasks/statement/export/pageBatchPriceByMonth',
            form:JSON.parse(req.body.mytest),
        }, req, res)).pipe(res)
    },
    accessoryTotal: function (req, res) {
        request(Base.mergeRequestOptions({
            method: 'post',
            url: '/api/tasks/statement/export/pageAllAccessoryTotalAmount',
            form:JSON.parse(req.body.mytest),
        }, req, res)).pipe(res)
    },
    accessoryTotalMonth: function (req, res) {
        request(Base.mergeRequestOptions({
            method: 'post',
            url: '/api/tasks/statement/export/pageAllAccessoryByMonth',
            form:JSON.parse(req.body.mytest),
        }, req, res)).pipe(res)
    },
    materialRequisition: function (req, res) {
        request(Base.mergeRequestOptions({
            method: 'post',
            url: '/api/tasks/statement/export/pageMaterialRequisitionReport',
            form:JSON.parse(req.body.mytest),
        }, req, res)).pipe(res)
    },
    mateOut: function (req, res) {
        request(Base.mergeRequestOptions({
            method: 'post',
            url: '/api/tasks/statement/export/pageMateOutReportByCondition',
            form:JSON.parse(req.body.mytest),
        }, req, res)).pipe(res)
    },
    mateIn: function (req, res) {
        request(Base.mergeRequestOptions({
            method: 'post',
            url: '/api/tasks/statement/export/pageMaterialSummaryByInTime',
            form:JSON.parse(req.body.mytest),
        }, req, res)).pipe(res)
    },

};
module.exports = ReportController;

