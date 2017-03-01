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
                {url: '/api/orders/statusInfo/'+tid, method: 'GET', resConfig: {keyName: 'orderStatusInfo', is_must: false}},
                {url: '/api/assist/order/stcodes', method: 'GET', resConfig: {keyName: 'stcodeInfo', is_must: false}},
                {url: '/api/assist/deco/style' , method: 'GET', resConfig: {keyName: 'styleInfo', is_must: true}},
                {url: '/api/assist/orderfile/type', method: 'GET', resConfig: {keyName: 'allFileTypeInfo', is_must: true}},
                {url: '/api/assist/review/reson', method: 'GET', resConfig: {keyName: 'resonList', is_must: true}},
                {url: '/api/assist/order/difficulty', method: 'GET', resConfig: {keyName: 'difficultyList', is_must: true}},
                {url: '/api/cofficient', method: 'GET', resConfig: {keyName: 'cofficientInfo', is_must: true}},
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
        var paramObject = helper.genPaginationQuery(req);
        Base.multiDataRequest(req, res, [
                {url: '/api/orders/resupply', method: 'GET', resConfig: {keyName: 'resupplyList', is_must: false}},
                {url: '/api/assist/brandinfo' , method: 'GET', resConfig: {keyName: 'brandInfo', is_must: true}},
                {url: '/api/assist/space/prod?spaceId=10', method: 'GET', resConfig: {keyName: 'prodList', is_must: true}},
                {url: '/api/assist/resupply/reason', method: 'GET', resConfig: {keyName: 'reasonList', is_must: true}},
                {url: '/api/assist/order/stcodes', method: 'GET', resConfig: {keyName: 'stcodesList', is_must: true}},
            ],
            function (req, res, resultList) {
                var paginationInfo =  resultList.resupplyList;

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
                }, resultList));
                res.render('order/order/resupplys', returnData);
            });
    },
    acceptPage: function (req, res) {
        var paramObject = helper.genPaginationQuery(req);
        Base.multiDataRequest(req, res, [
            {url: '/api/orders/resupply/accept/gid', method: 'GET', resConfig: {keyName: 'acceptingList', is_must: true}},
            {url: '/api/orders/resupply/accept?'+ (queryString.stringify(req.query)), method: 'GET', resConfig: {keyName: 'acceptList', is_must: true}},
            {url: '/api/assist/order/difficulty', method: 'GET', resConfig: {keyName: 'difficultyList', is_must: true}},
        ], function (req, res, resultList) {

            var paginationInfoOne =  resultList.acceptingList;
            var paginationInfTwo =  resultList.acceptList;

            var boostrapPaginatorOne = new Pagination.TemplatePaginator(helper.genPageInfo({
                prelink: paramObject.withoutPageNo,
                current: paginationInfoOne.page,
                rowsPerPage: paginationInfoOne.pageSize,
                totalResult: paginationInfoOne.totalItems
            }));
            var boostrapPaginatorTwo = new Pagination.TemplatePaginator(helper.genPageInfo({
                prelink: paramObject.withoutPageNo,
                current: paginationInfTwo.page,
                rowsPerPage: paginationInfTwo.pageSize,
                totalResult: paginationInfTwo.totalItems
            }));


            var returnData = Base.mergeData(helper.mergeObject({
                title: '补单受理 ',
                paginationOne: boostrapPaginatorOne.render(),
                paginationTwo: boostrapPaginatorTwo.render(),
                Permission :Permissions,
            },resultList));
            res.render('order/order/resupplys_accept', returnData);
        });
    },
    getTaskResupplys: function (req, res) {
        var tid = req.params.tid;
        var resId = req.params.resId;
        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/orders/resupply/accept/getTask?tid='+tid+'&resId='+resId,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                res.sendStatus(200);
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })

    },
    doUnlockResupplys: function (req, res) {
        var tid = req.params.tid;
        var resId = req.params.resId;
        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/orders/resupply/accept/unlock?tid='+tid+'&resId='+resId,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                res.sendStatus(200);
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })

    },
    notPassResupplys: function (req, res) {
        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/orders/resupply/accept/notPass?'+queryString.stringify(req.body),
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                res.redirect("/orders/resupplys/accept");
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })

    },
    doPassResupplys: function (req, res) {
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
    getTaskReApart: function (req, res) {
        var tid = req.params.tid;
        var resId = req.params.resId;
        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/orders/resupply/apart/getTask?tid='+tid+'&resId='+resId,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                res.sendStatus(200);
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })

    },
    doUnlockReApart: function (req, res) {
        var tid = req.params.tid;
        var resId = req.params.resId;
        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/orders/resupply/apart/unlock?tid='+tid+'&resId='+resId,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                res.sendStatus(200);
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })

    },
    notPassReApart: function (req, res) {
        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/orders/resupply/apart/notPass?'+queryString.stringify(req.body),
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                res.redirect("/orders/resupplys/accept");
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })

    },
    doPassReApart: function (req, res) {
        var tid = req.params.tid;
        var resId = req.params.resId;
        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/orders/resupply/apart/pass?tid='+tid+'&resId='+resId,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                res.sendStatus(200);
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })

    },
    getTaskCheckReApart: function (req, res) {
        var tid = req.params.tid;
        var resId = req.params.resId;
        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/orders/resupply/apartReview/getTask?tid='+tid+'&resId='+resId,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                res.sendStatus(200);
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })

    },
    doUnlockCheckReApart: function (req, res) {
        var tid = req.params.tid;
        var resId = req.params.resId;
        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/orders/resupply/apartReview/unlock?tid='+tid+'&resId='+resId,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                res.sendStatus(200);
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })

    },
    notPassCheckReApart: function (req, res) {
        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/orders/resupply/apartReview/notPass?'+queryString.stringify(req.body),
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                res.redirect("/orders/resupplys/accept");
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })

    },
    doPassCheckReApart: function (req, res) {
        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/orders/resupply/apartReview/pass?tid='+tid+'&resId='+resId,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                res.redirect("/order/check/waitOrder");
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })

    },
    apartPage: function (req, res) {
        var paramObject = helper.genPaginationQuery(req);
        Base.multiDataRequest(req, res, [
            {url: '/api/orders/resupply/apart/gid', method: 'GET', resConfig: {keyName: 'apartingList', is_must: true}},
            {url: '/api/orders/resupply/apart?'+ (queryString.stringify(req.query)), method: 'GET', resConfig: {keyName: 'apartList', is_must: true}},
            {url: '/api/assist/brandinfo' , method: 'GET', resConfig: {keyName: 'brandInfo', is_must: true}},
            {url: '/api/assist/space/prod?spaceId=10', method: 'GET', resConfig: {keyName: 'prodList', is_must: true}},
            {url: '/api/assist/order/difficulty', method: 'GET', resConfig: {keyName: 'difficultyList', is_must: true}},
            {url: '/api/assist/deco/color', method: 'GET', resConfig: {keyName: 'colorList', is_must: true}},
        ], function (req, res, resultList) {

            var paginationInfoOne =  resultList.apartingList;
            var paginationInfTwo =  resultList.apartList;

            var boostrapPaginatorOne = new Pagination.TemplatePaginator(helper.genPageInfo({
                prelink: paramObject.withoutPageNo,
                current: paginationInfoOne.page,
                rowsPerPage: paginationInfoOne.pageSize,
                totalResult: paginationInfoOne.totalItems
            }));
            var boostrapPaginatorTwo = new Pagination.TemplatePaginator(helper.genPageInfo({
                prelink: paramObject.withoutPageNo,
                current: paginationInfTwo.page,
                rowsPerPage: paginationInfTwo.pageSize,
                totalResult: paginationInfTwo.totalItems
            }));


            var returnData = Base.mergeData(helper.mergeObject({
                title: '补单受理 ',
                paginationOne: boostrapPaginatorOne.render(),
                paginationTwo: boostrapPaginatorTwo.render(),
                Permission :Permissions,
            },resultList));
            res.render('order/order/resupplys_apart', returnData);
        });
    },
    resupplyDetailPage: function (req, res) {
        var tid = req.params.tid;
        var resId = req.params.resId;
        Base.multiDataRequest(req, res, [
                {url: '/api/orders/resupply/detail?tid='+tid+'&resId='+resId, method: 'GET', resConfig: {keyName: 'resupplyInfo', is_must: true}},
                {url: '/api/assist/resupply/stcodes', method: 'GET', resConfig: {keyName: 'stcodeInfo', is_must: true}},
                {url: '/api/assist/review/reson', method: 'GET', resConfig: {keyName: 'resonList', is_must: true}},
                {url: '/api/assist/resupply/reason', method: 'GET', resConfig: {keyName: 'resupplyReason', is_must: true}},
            ],
            function (req, res, resultList) {
                var returnData = Base.mergeData(helper.mergeObject({
                    title: ' ',
                    tid:tid,
                    resId:resId,
                    Permission :Permissions,
                }, resultList));
                res.render('order/order/resupply_detail', returnData);
            });
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
    //订单排料页面
    nestingPage: function (req, res) {
        var paramObject = helper.genPaginationQuery(req);
        Base.multiDataRequest(req, res, [
            {url: '/api/orders/schedule?'+(queryString.stringify(req.query)), method: 'GET', resConfig: {keyName: 'scheduleAllList', is_must: true}},
            {url: '/api/orders/schedule/gid', method: 'GET', resConfig: {keyName: 'scheduleList', is_must: true}},
            {url: '/api/assist/deco/color', method: 'GET', resConfig: {keyName: 'colorList', is_must: true}},
            {url: '/api/assist/space/prod?spaceId=10', method: 'GET', resConfig: {keyName: 'prodList', is_must: true}},
        ], function (req, res, resultList) {
            var paginationInfo =  resultList.scheduleAllList;
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
            res.render('order/order/nesting', returnData);

        });
    },
    //标记为排料中
    getNestingTask: function (req, res) {
        var ids = req.params.cid;
        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/orders/schedule/getTask?tids='+ids,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                res.sendStatus(200)
            }else{
                Base.handlerError(res, req, error, response, body);
            }
        })
    },
    getTaskSchedule: function (req, res) {
        var tid = req.params.tid;
        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/orders/schedule/getTask?tids='+tid,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                res.sendStatus(200);
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })
    },
    //修改批次号
    editBatchNum: function (req, res) {
        var cid = req.params.cid;
        var bid = req.params.bid;
        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/orders/schedule/edit/batchnumber?batchNumber='+cid+'&tids='+bid,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                res.sendStatus(200);
            }else {
                    Base.handlerError(res, req, error, response, body);
                }
            })
    },
    doUnlockSchedule: function (req, res) {
        var tid = req.params.tid;
        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/orders/schedule/unlock/'+tid,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                res.sendStatus(200);
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })
    },
    notPassSchedule: function (req, res) {
        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/orders/schedule/notPass?'+queryString.stringify(req.body),
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                console.log('statusCode')
                res.redirect("/orders/nesting");
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })
    },
    doPassSchedule: function (req, res) {
        var tid = req.params.tid;
        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/orders/schedule/pass?tid='+tid,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                res.sendStatus(200);
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })
    },
    packagePage: function (req, res) {
        res.render('order/order/package');
    },
};

module.exports = OrderController;

