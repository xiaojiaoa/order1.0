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


var OrderController = {

    listPage: function (req, res) {

        console.log(req);
        var paramObject = helper.genPaginationQuery(req);
        Base.multiDataRequest(req, res, [
            {url: '/api/orders?'+ queryString.stringify(req.query), method: 'GET', resConfig: {keyName: 'orderList', is_must: true}},
            {url: '/api/assist/order/stcodes', method: 'GET', resConfig: {keyName: 'stcodeInfo', is_must: false}},
            {url: '/api/assist/brandinfo', method: 'GET', resConfig: {keyName: 'brandInfo', is_must: false}},
            {url: '/api/assist/space/prod', method: 'GET', resConfig: {keyName: 'prodInfo', is_must: false}}
        ], function (req, res, resultList) {

            var paginationInfo =  resultList.orderList;

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
            res.render('order/orders', returnData);
        });

    },
    detailPage: function (req, res) {

        var tid = req.params.tid;
        Base.multiDataRequest(req, res, [
                {url: '/api/orders/'+tid, method: 'GET', resConfig: {keyName: 'orderInfo', is_must: true}},
                // {url: '/api/assist/taskseq/status', method: 'GET', resConfig: {keyName: 'statusInfo', is_must: false}},
                {url: '/api/assist/order/stcodes', method: 'GET', resConfig: {keyName: 'stcodeInfo', is_must: false}},
                {url: '/api/assist/deco/style' , method: 'GET', resConfig: {keyName: 'styleInfo', is_must: true}},
                {url: '/api/assist/file/type', method: 'GET', resConfig: {keyName: 'allFileTypeInfo', is_must: true}},
                {url: '/api/assist/review/reson', method: 'GET', resConfig: {keyName: 'resonList', is_must: true}},
                {url: '/api/assist/review/reson', method: 'GET', resConfig: {keyName: 'resonList', is_must: true}},
                {url: '/api/assist/order/difficulty', method: 'GET', resConfig: {keyName: 'difficultyList', is_must: true}},
            ],
            function (req, res, resultList) {
                var returnData = Base.mergeData(helper.mergeObject({
                    title: ' ',
                    tid:tid,
                    Permission :Permissions,
                }, resultList));
                res.render('order/order/order_detail', returnData);
            });
    },
    getTask: function (req, res) {
        var tid = req.params.tid;
        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/orders/review/getTask/'+tid,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                res.sendStatus(200);
                // res.redirect("/order/check/getOrder");
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })

    },
    doUnlock: function (req, res) {
        var tid = req.params.tid;
        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/orders/review/unlock/'+tid,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                res.sendStatus(200);
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })

    },
    notPass: function (req, res) {
        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/orders/review/notPass?'+queryString.stringify(req.body),
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                res.redirect("/order/check/waitOrder");
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })

    },
    doPass: function (req, res) {
        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/orders/review/pass?'+queryString.stringify(req.body),
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                res.redirect("/order/check/waitOrder");
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })

    },
    updateDifficultyLevel: function (req, res) {
        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/orders/review/updateDifficultyLevel?'+queryString.stringify(req.body),
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                res.redirect("/order/check/waitOrder");
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })

    },
    resupplyPage: function (req, res) {
        res.render('order/order/resupplys');
    },
    acceptPage: function (req, res) {
        res.render('order/order/resupplys_accept');
    },
    apartPage: function (req, res) {
        res.render('order/order/resupplys_apart');
    },
    resupplyDetailPage: function (req, res) {
        res.render('order/order/resupply_detail');
    },
    checkPage: function (req, res) {
        var type = req.params.type;
        // var apiRequest = {};
        // if(type == 'getOrder'){
        //     apiRequest = {url: '/api/orders/review?'+ (queryString.stringify(req.query)), method: 'GET', resConfig: {keyName: 'orderList', is_must: true}}
        // }else{
        //     apiRequest = {url: '/api/assist/order/difficulty', method: 'GET', resConfig: {keyName: 'difficultyList', is_must: true}}
        // }
        var paramObject = helper.genPaginationQuery(req);

        if(type == 'getOrder'){
            Base.multiDataRequest(req, res, [
                {url: '/api/orders/review/gid', method: 'GET', resConfig: {keyName: 'selfList', is_must: true}},
                {url: '/api/orders/review?'+ (queryString.stringify(req.query)), method: 'GET', resConfig: {keyName: 'orderList', is_must: true}},
                {url: '/api/assist/brandinfo', method: 'GET', resConfig: {keyName: 'brandinfoList', is_must: true}},
                {url: '/api/assist/order/difficulty', method: 'GET', resConfig: {keyName: 'difficultyList', is_must: true}},
                {url: '/api/assist/space/prod', method: 'GET', resConfig: {keyName: 'prodList', is_must: true}},
            ], function (req, res, resultList) {

                var paginationInfo =  resultList.selfList;
                var paginationInfoForGet =  resultList.orderList;

                var boostrapPaginator = new Pagination.TemplatePaginator(helper.genPageInfo({
                    prelink: paramObject.withoutPageNo,
                    current: paginationInfo.page,
                    rowsPerPage: paginationInfo.pageSize,
                    totalResult: paginationInfo.totalItems
                }));
                var boostrapPaginatorForGet = new Pagination.TemplatePaginator(helper.genPageInfo({
                    prelink: paramObject.withoutPageNo,
                    current: paginationInfoForGet.page,
                    rowsPerPage: paginationInfoForGet.pageSize,
                    totalResult: paginationInfoForGet.totalItems
                }));

                var returnData = Base.mergeData(helper.mergeObject({
                    title: '订单审核 ',
                    pagination: boostrapPaginator.render(),
                    paginationForGet: boostrapPaginatorForGet.render(),
                    Permission :Permissions,
                    type :type,
                },resultList));
                res.render('order/order/order_check', returnData);
            });
        }else{
            Base.multiDataRequest(req, res, [
                {url: '/api/orders/review/gid', method: 'GET', resConfig: {keyName: 'selfList', is_must: true}},
                {url: '/api/assist/brandinfo', method: 'GET', resConfig: {keyName: 'brandinfoList', is_must: true}},
                {url: '/api/assist/order/difficulty', method: 'GET', resConfig: {keyName: 'difficultyList', is_must: true}},
                {url: '/api/assist/space/prod', method: 'GET', resConfig: {keyName: 'prodList', is_must: true}},
            ], function (req, res, resultList) {

                var paginationInfo =  resultList.selfList;

                var boostrapPaginator = new Pagination.TemplatePaginator(helper.genPageInfo({
                    prelink: paramObject.withoutPageNo,
                    current: paginationInfo.page,
                    rowsPerPage: paginationInfo.pageSize,
                    totalResult: paginationInfo.totalItems
                }));

                var returnData = Base.mergeData(helper.mergeObject({
                    title: '订单审核 ',
                    pagination: boostrapPaginator.render(),
                    Permission :Permissions,
                    type :type,
                },resultList));
                res.render('order/order/order_check', returnData);
            });
        }
        // Base.multiDataRequest(req, res, [
        //     {url: '/api/orders/review/gid', method: 'GET', resConfig: {keyName: 'selfList', is_must: true}},
        //     {url: '/api/assist/brandinfo', method: 'GET', resConfig: {keyName: 'brandinfoList', is_must: true}},
        //     {url: '/api/assist/order/difficulty', method: 'GET', resConfig: {keyName: 'difficultyList', is_must: true}},
        //     {url: '/api/assist/space/prod', method: 'GET', resConfig: {keyName: 'prodList', is_must: true}},
        //     apiRequest
        // ], function (req, res, resultList) {
        //
        //     var paginationInfo =  resultList.selfList;
        //
        //     var boostrapPaginator = new Pagination.TemplatePaginator(helper.genPageInfo({
        //         prelink: paramObject.withoutPageNo,
        //         current: paginationInfo.page,
        //         rowsPerPage: paginationInfo.pageSize,
        //         totalResult: paginationInfo.totalItems
        //     }));
        //
        //     var returnData = Base.mergeData(helper.mergeObject({
        //         title: '订单审核 ',
        //         pagination: boostrapPaginator.render(),
        //         Permission :Permissions,
        //         type :type,
        //     },resultList));
        //     res.render('order/order/order_check', returnData);
        // });
    },
    processPage: function (req, res) {
        res.render('order/order/order_process');
    },
    permitPage: function (req, res) {

        var paramObject = helper.genPaginationQuery(req);
        Base.multiDataRequest(req, res, [
            {url: '/api/assist/order/difficulty', method: 'GET', resConfig: {keyName: 'difficultyList', is_must: true}},
            {url: '/api/orders/review/gid', method: 'GET', resConfig: {keyName: 'selfList', is_must: true}},
        ], function (req, res, resultList) {

            var paginationInfo =  resultList.selfList;

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
            res.render('order/order/order_permit', returnData);
        });
    },
    nestingPage: function (req, res) {
        res.render('order/order/nesting');
    },
    packagePage: function (req, res) {
        res.render('order/order/package');
    },
};

module.exports = OrderController;

