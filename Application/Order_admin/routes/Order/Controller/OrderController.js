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
                {url: '/api/assist/review/reson', method: 'GET', resConfig: {keyName: 'resonList', is_must: true}},
                {url: '/api/assist/order/difficulty', method: 'GET', resConfig: {keyName: 'difficultyList', is_must: true}},
                {url: '/api/cofficient', method: 'GET', resConfig: {keyName: 'cofficientInfo', is_must: true}},
                {url: '/api/orders/chgback/'+tid, method: 'GET', resConfig: {keyName: 'chgbackInfo', is_must: true}},
                {url: '/api/orders/progress/'+tid, method: 'GET', resConfig: {keyName: 'progressInfo', is_must: true}},
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
    chgbackeAllPage: function (req, res) {
        var tid = req.params.tid;
        var paramObject = helper.genPaginationQuery(req);
        Base.multiDataRequest(req, res, [
            {url: '/api/orders/chgback?tid='+tid, method: 'GET', resConfig: {keyName: 'chgbackList', is_must: true}},
        ], function (req, res, resultList) {

            var paginationInfo = resultList.chgbackList;

            var boostrapPaginator = new Pagination.TemplatePaginator(helper.genPageInfo({
                prelink: paramObject.withoutPageNo,
                current: paginationInfo.page,
                rowsPerPage: paginationInfo.pageSize,
                totalResult: paginationInfo.totalItems
            }));

            var returnData = Base.mergeData(helper.mergeObject({
                title: ' ',
                tid: tid,
                pagination: boostrapPaginator.render()
            }, resultList));
            res.render('order/order/back', returnData);
        });

    },
    communicatePage: function (req, res) {
        var tid = req.params.tid;
        var returnData = {
            title: ' ',
            tid: tid,
        }
        res.render('order/order/communicate_create', returnData);
    },
    doCreateCommunicate: function (req, res) {
        var tid = req.body.tid;
        request(Base.mergeRequestOptions({
            method: 'post',
            url: '/api/orders/progress',
            form: req.body,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {

                res.redirect("/order/detail/" + tid);
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })
    },
    communicateAllPage: function (req, res) {
        var tid = req.params.tid;
        var paramObject = helper.genPaginationQuery(req);
        Base.multiDataRequest(req, res, [
            {url: '/api/orders/progress?tid='+tid, method: 'GET', resConfig: {keyName: 'progressList', is_must: true}},
        ], function (req, res, resultList) {

            var paginationInfo = resultList.progressList;

            var boostrapPaginator = new Pagination.TemplatePaginator(helper.genPageInfo({
                prelink: paramObject.withoutPageNo,
                current: paginationInfo.page,
                rowsPerPage: paginationInfo.pageSize,
                totalResult: paginationInfo.totalItems
            }));

            var returnData = Base.mergeData(helper.mergeObject({
                title: ' ',
                tid: tid,
                pagination: boostrapPaginator.render()
            }, resultList));
            res.render('order/order/communicate', returnData);
        });

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
        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/orders/resupply/accept/getTask?tid='+tid,
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
        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/orders/resupply/accept/unlock?tid='+tid,
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
            url: '/api/orders/resupply/accept/pass?'+queryString.stringify(req.body),
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                res.redirect("/orders/resupplys/apart");
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })

    },
    // getTaskReApart: function (req, res) {
    //     var tid = req.params.tid;
    //     request(Base.mergeRequestOptions({
    //         method: 'put',
    //         url: '/api/orders/apart/getTask/'+tid,
    //     }, req, res), function (error, response, body) {
    //         if (!error && response.statusCode == 201) {
    //             res.sendStatus(200);
    //         } else {
    //             Base.handlerError(res, req, error, response, body);
    //         }
    //     })
    //
    // },
    // doUnlockReApart: function (req, res) {
    //     var tid = req.params.tid;
    //     request(Base.mergeRequestOptions({
    //         method: 'put',
    //         url: '/api/orders/resupply/apart/unlock?tid='+tid,
    //     }, req, res), function (error, response, body) {
    //         if (!error && response.statusCode == 201) {
    //             res.sendStatus(200);
    //         } else {
    //             Base.handlerError(res, req, error, response, body);
    //         }
    //     })
    //
    // },
    notPassReApart: function (req, res) {
        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/orders/apart/notPass?'+queryString.stringify(req.body),
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                res.redirect("/orders/resupplys/accept");
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })

    },
    // doPassReApart: function (req, res) {
    //     var tid = req.params.tid;
    //     request(Base.mergeRequestOptions({
    //         method: 'put',
    //         url: '/api/orders/resupply/apart/pass?tid='+tid,
    //     }, req, res), function (error, response, body) {
    //         if (!error && response.statusCode == 201) {
    //             res.sendStatus(200);
    //         } else {
    //             Base.handlerError(res, req, error, response, body);
    //         }
    //     })
    //
    // },
    apartCheckPage: function (req, res) {
        var paramObject = helper.genPaginationQuery(req);
        Base.multiDataRequest(req, res, [
            {url: '/api/orders/apartReview/gid?orderType=20', method: 'GET', resConfig: {keyName: 'apartReviewingList', is_must: true}},
            {url: '/api/orders/apartReview?orderType=20&'+ (queryString.stringify(req.query)), method: 'GET', resConfig: {keyName: 'apartReviewList', is_must: true}},
            {url: '/api/assist/brandinfo' , method: 'GET', resConfig: {keyName: 'brandInfo', is_must: true}},
            {url: '/api/assist/space/prod?spaceId=10', method: 'GET', resConfig: {keyName: 'prodList', is_must: true}},
            {url: '/api/assist/order/difficulty', method: 'GET', resConfig: {keyName: 'difficultyList', is_must: true}},
            {url: '/api/assist/deco/color', method: 'GET', resConfig: {keyName: 'colorList', is_must: true}},
        ], function (req, res, resultList) {

            var paginationInfoOne =  resultList.apartReviewingList;
            var paginationInfTwo =  resultList.apartReviewList;

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
                title: '补单拆单审核 ',
                paginationOne: boostrapPaginatorOne.render(),
                paginationTwo: boostrapPaginatorTwo.render(),
                Permission :Permissions,
            },resultList));
            res.render('order/order/resupplys_apart_check', returnData);
        });
    },
    // getTaskCheckReApart: function (req, res) {
    //     var tid = req.params.tid;
    //     request(Base.mergeRequestOptions({
    //         method: 'put',
    //         url: '/api/orders/resupply/apartReview/getTask?tid='+tid,
    //     }, req, res), function (error, response, body) {
    //         if (!error && response.statusCode == 201) {
    //             res.sendStatus(200);
    //         } else {
    //             Base.handlerError(res, req, error, response, body);
    //         }
    //     })
    //
    // },
    // doUnlockCheckReApart: function (req, res) {
    //     var tid = req.params.tid;
    //     request(Base.mergeRequestOptions({
    //         method: 'put',
    //         url: '/api/orders/resupply/apartReview/unlock?tid='+tid,
    //     }, req, res), function (error, response, body) {
    //         if (!error && response.statusCode == 201) {
    //             res.sendStatus(200);
    //         } else {
    //             Base.handlerError(res, req, error, response, body);
    //         }
    //     })
    //
    // },
    notPassCheckReApart: function (req, res) {
        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/orders/apartReview/notPass?'+queryString.stringify(req.body),
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                res.redirect("/orders/resupplys/apartCheck");
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })
    },
    // doPassCheckReApart: function (req, res) {
    //     var tid = req.params.tid;
    //     request(Base.mergeRequestOptions({
    //         method: 'put',
    //         url: '/api/orders/resupply/apartReview/pass?tid='+tid,
    //     }, req, res), function (error, response, body) {
    //         if (!error && response.statusCode == 201) {
    //             res.redirect("/order/check/waitOrder");
    //         } else {
    //             Base.handlerError(res, req, error, response, body);
    //         }
    //     })
    //
    // },
    apartPage: function (req, res) {
        var paramObject = helper.genPaginationQuery(req);
        Base.multiDataRequest(req, res, [
            {url: '/api/orders/apart/gid?orderType=20', method: 'GET', resConfig: {keyName: 'apartingList', is_must: true}},
            {url: '/api/orders/resupply/apart?orderType=20&'+ (queryString.stringify(req.query)), method: 'GET', resConfig: {keyName: 'apartList', is_must: true}},
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
                title: '补单拆单 ',
                paginationOne: boostrapPaginatorOne.render(),
                paginationTwo: boostrapPaginatorTwo.render(),
                Permission :Permissions,
            },resultList));
            res.render('order/order/resupplys_apart', returnData);
        });
    },
    resupplyDetailPage: function (req, res) {
        var tid = req.params.tid;
        Base.multiDataRequest(req, res, [
                {url: '/api/orders/resupply/detail?tid='+tid, method: 'GET', resConfig: {keyName: 'resupplyInfo', is_must: true}},
                {url: '/api/orders/statusInfo/'+tid, method: 'GET', resConfig: {keyName: 'orderStatusInfo', is_must: false}},
                {url: '/api/assist/resupply/stcodes', method: 'GET', resConfig: {keyName: 'stcodeInfo', is_must: true}},
                {url: '/api/assist/review/reson', method: 'GET', resConfig: {keyName: 'resonList', is_must: true}},
                {url: '/api/assist/resupply/reason', method: 'GET', resConfig: {keyName: 'resupplyReason', is_must: true}},
                {url: '/api/assist/orderfile/type', method: 'GET', resConfig: {keyName: 'allFileTypeInfo', is_must: true}},
            ],
            function (req, res, resultList) {

                var resupplyReason = [];
                var resupplyLeveTwo = [];
                resultList.resupplyReason.forEach(function(element,index){
                    if(element.levelType == 1){
                        resupplyReason[element.id] = element;
                        resupplyReason[element.id].data = [];
                    }else if(element.levelType == 2){
                        resupplyReason[element.parentId].data.push(element);
                        resupplyLeveTwo[element.id] = element;
                        resupplyLeveTwo[element.id].dataChild = [];
                    }else{
                        resupplyLeveTwo[element.parentId].dataChild.push(element);
                    }
                });

                resultList.resupplyReason = resupplyReason;

// console.log('resupplyReason',JSON.stringify(resupplyReason))
// console.log('resupplyReason222',JSON.stringify(resupplyLeveTwo))

                var returnData = Base.mergeData(helper.mergeObject({
                    title: ' ',
                    tid:tid,
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
            {url: '/api/orders/assess?'+queryString.stringify(req.query), method: 'GET', resConfig: {keyName: 'assessList', is_must: true}},
            {url: '/api/assist/brandinfo', method: 'GET', resConfig: {keyName: 'brandinfoList', is_must: true}},
            {url: '/api/assist/order/difficulty', method: 'GET', resConfig: {keyName: 'difficultyList', is_must: true}},
            {url: '/api/assist/space/prod', method: 'GET', resConfig: {keyName: 'prodList', is_must: true}},
        ], function (req, res, resultList) {

            var paginationInfo =  resultList.assessList;

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
    packagePage:function (req, res) {
        var paramObject = helper.genPaginationQuery(req);
        Base.multiDataRequest(req, res, [
            {url: '/api/orders/package/list?'+(queryString.stringify(req.query)), method: 'GET', resConfig: {keyName: 'toBePackedList', is_must: true}},
        ], function (req, res, resultList) {
            var paginationInfo =  resultList.toBePackedList;
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
            res.render('order/order/package', returnData);
        });
        //res.render('order/order/package');
    },
    packedListPage:function(req,res){
        var tid=req.params.tid;
        var pid=req.query.packageLid;
        Base.multiDataRequest(req, res, [
            {url: '/api/orders/package/pcaketview/'+tid+"?"+(queryString.stringify(req.query)), method: 'GET', resConfig: {keyName: 'packedListDetail', is_must: true}},
        ], function (req, res, resultList) {
            var returnData = Base.mergeData(helper.mergeObject({
                title: ' ',
                tid:tid,
                pid:pid,
            },resultList));
            res.render('order/order/packedList', returnData);
        });
       // res.render('order/order/packedList');
    },
    unpacket:function(req,res){
        var tid=req.params.tid;
        console.log("撤销包装"+tid);
        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/orders/package/unpacket/'+tid,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                res.sendStatus(200);
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })
    },
    doPacket:function(req,res){
        var tid=req.params.tid;
        console.log("生成包装"+tid);
        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/orders/package/packet/'+tid,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                res.sendStatus(200);
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })
    },
    movePacket:function(req,res){
        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/orders/package/packet/move?'+queryString.stringify(req.body),
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                res.sendStatus(200);
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })
    },
    deletePacket:function(req,res){
        var mid = req.params.pid;
        var type = req.params.type;
        console.log('删除包装'+ JSON.stringify(req.params));
      /*  request(Base.mergeRequestOptions({
         method: 'put',
         url: '/api/orders/package/packet/delete/'+mid+'?packageType='+type,
         }, req, res), function (error, response, body) {
         if (!error && response.statusCode == 201) {
         res.sendStatus(200);
         } else {
         Base.handlerError(res, req, error, response, body);
         }
         })*/
    },
    //订单详情--订单物料--工件
    workpiecePage:function (req, res) {
        var paramObject = helper.genPaginationQuery(req);
        var tid=req.params.tid;
        Base.multiDataRequest(req, res, [
            {url: '/api/orders/package/workpiece/list/'+tid+'?'+queryString.stringify(req.query), method: 'GET', resConfig: {keyName: 'workpieceList', is_must: true}},
            {url: '/api/orders/'+tid, method: 'GET', resConfig: {keyName: 'orderDetail', is_must: true}},
            {url: '/api/assist/order/stcodes', method: 'GET', resConfig: {keyName: 'stcodeInfo', is_must: false}},
        ], function (req, res, resultList) {
            var paginationInfo =  resultList.workpieceList;
            var boostrapPaginator = new Pagination.TemplatePaginator(helper.genPageInfo({
                prelink: paramObject.withoutPageNo,
                current: paginationInfo.page,
                rowsPerPage: paginationInfo.pageSize,
                totalResult: paginationInfo.totalItems
            }));
            var returnData = Base.mergeData(helper.mergeObject({
                title: ' ',
                pagination: boostrapPaginator.render(),
                tid:tid
            },resultList));
            res.render('order/order/workpiece', returnData);
        });
    },

    //订单详情--订单物料--配件
    partsPage:function (req, res) {
        var paramObject = helper.genPaginationQuery(req);
        var tid=req.params.tid;
        Base.multiDataRequest(req, res, [
            {url: '/api/orders/package/accessory/list/'+tid+'?'+queryString.stringify(req.query), method: 'GET', resConfig: {keyName: 'partsList', is_must: true}},
            {url: '/api/orders/'+tid, method: 'GET', resConfig: {keyName: 'orderDetail', is_must: true}},
            {url: '/api/assist/order/stcodes', method: 'GET', resConfig: {keyName: 'stcodeInfo', is_must: false}},
        ], function (req, res, resultList) {
            var paginationInfo =  resultList.partsList;
            var boostrapPaginator = new Pagination.TemplatePaginator(helper.genPageInfo({
                prelink: paramObject.withoutPageNo,
                current: paginationInfo.page,
                rowsPerPage: paginationInfo.pageSize,
                totalResult: paginationInfo.totalItems
            }));
            var returnData = Base.mergeData(helper.mergeObject({
                title: ' ',
                pagination: boostrapPaginator.render(),
                tid:tid
            },resultList));
            res.render('order/order/materiel_modal', returnData);
        });
     },
};

module.exports = OrderController;

