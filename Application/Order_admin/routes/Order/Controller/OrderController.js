// 模板 供复制用
var Base = require('./BaseController');

// 分页
var Pagination = require('pagination');

// 生成请求query
var queryString = require('qs');

// 自定义帮助函数
var helper = require('../config/helper');
var DWY_GLOBAL = require('../config/global');

// 请求模块
var request = require('request');

// 引入权限
var Permissions = require('../config/permission');

// 引入文件处理系统
var fs = require("fs");

var _ = require('lodash');

var OrderController = {
    listPage: function (req, res) {

        var paramObject = helper.genPaginationQuery(req);
        req.query.regionTypes=req.query.regionTypes?req.query.regionTypes.toString(','):'';
        Base.multiDataRequest(req, res, [
            {url: '/api/orders?'+ queryString.stringify(req.query), method: 'GET', resConfig: {keyName: 'orderList', is_must: true}},
            {url: '/api/assist/order/stcodes', method: 'GET', resConfig: {keyName: 'stcodeInfo', is_must: false}},
            {url: '/api/assist/brandinfo', method: 'GET', resConfig: {keyName: 'brandInfo', is_must: false}},
            // {url: '/api/assist/space/prod', method: 'GET', resConfig: {keyName: 'prodInfo', is_must: false}},
            {url: '/api/organizations/list', method: 'GET', resConfig: {keyName: 'organizationsList', is_must: false}},
            {url: '/api/stores/list', method: 'GET', resConfig: {keyName: 'storesList', is_must: false}},
            {url: '/api/orders/getRegionTypeByGid', method: 'GET', resConfig: {keyName: 'TypesList', is_must: true}},
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
                pagination: boostrapPaginator.render(),
                Permission :Permissions,
            },resultList));
            res.render('order/orders', returnData);
        });

    },
    detailPage: function (req, res) {
        var tid = req.params.tid;

        var paramObject = helper.genPaginationQuery(req);
        Base.multiDataRequest(req, res, [
                {url: '/api/orders/'+tid, method: 'GET', resConfig: {keyName: 'orderInfo', is_must: true}},
                {url: '/api/orders/statusInfo/'+tid, method: 'GET', resConfig: {keyName: 'orderStatusInfo', is_must: false}},
                {url: '/api/assist/order/stcodes', method: 'GET', resConfig: {keyName: 'stcodeInfo', is_must: false}},
                {url: '/api/orders/package/delivery/'+tid+'?'+queryString.stringify(req.query), method: 'GET', resConfig: {keyName: 'deliveryInfo', is_must: true}},
                {url: '/api/assist/order/difficulty', method: 'GET', resConfig: {keyName: 'difficultyList', is_must: true}},
                {url: '/api/cofficient', method: 'GET', resConfig: {keyName: 'cofficientInfo', is_must: true}},
                {url: '/api/orders/chgback/'+tid, method: 'GET', resConfig: {keyName: 'chgbackInfo', is_must: true}},
                {url: '/api/orders/progress/'+tid, method: 'GET', resConfig: {keyName: 'progressInfo', is_must: true}},
                {url: '/api/assist/space/prod', method: 'GET', resConfig: {keyName: 'spaceInfo', is_must: true}},
                {url: '/api/assist/review/reviewReason', method: 'GET', resConfig: {keyName: 'reviewReason', is_must: true}},
                {url: '/api/assist/review/apartReason', method: 'GET', resConfig: {keyName: 'apartReason', is_must: true}},
                {url: '/api/assist/review/apartReviewReason', method: 'GET', resConfig: {keyName: 'apartReviewReason', is_must: true}},
                {url: '/api/assist/review/scheduleReason', method: 'GET', resConfig: {keyName: 'scheduleReason', is_must: true}},
                {url: '/api/assist/deco/color', method: 'GET', resConfig: {keyName: 'colorList', is_must: true}},
                {url: '/api/assist/order/orderType', method: 'GET', resConfig: {keyName: 'typeList', is_must: true}},
                {url: '/api/orders/priceLog/'+tid, method: 'GET', resConfig: {keyName: 'priceLog', is_must: true}}
            ],
            function (req, res, resultList) {

                var spaceInfo = [];
                resultList.spaceInfo.forEach(function (element, index) {

                    if (element.spaceId == resultList.orderInfo.spaceId) {
                        spaceInfo.push({id: element.id, name: element.name})
                    }
                });

                resultList.spaceInfo = spaceInfo;


                var paginationInfo =  resultList.deliveryInfo;

                var boostrapPaginator = new Pagination.TemplatePaginator(helper.genPageInfo({
                    prelink: paramObject.withoutPageNo,
                    current: paginationInfo.page,
                    rowsPerPage: paginationInfo.pageSize,
                    totalResult: paginationInfo.totalItems
                }));

                var returnData = Base.mergeData(helper.mergeObject({
                    title: ' ',
                    tid:tid,
                    Permission :Permissions,
                    orderType: 'order',
                    pagination: boostrapPaginator.render()
                }, resultList));
                res.render('order/order/order_detail', returnData);
            });
    },
    detailDoModify: function (req, res) {
        var id = req.body.tid
        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/orders/'+id+'?'+queryString.stringify(req.body),
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                Base.handlerSuccess(res, req);
                res.redirect("/order/detail/" + id);
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })

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
    getTaskAgain: function (req, res) {
        var tid = req.params.tid;
        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/orders/review/reSubmit/'+tid,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                res.sendStatus(200);
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })

    },
    returnOrder: function (req, res) {
        var tid = req.params.tid;
        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/orders/assess/returnOrder/'+tid,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                res.sendStatus(200);
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
        req.body.causeStr =  req.body.causeStr.toString(',');

        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/orders/review/notPass?'+queryString.stringify(req.body),
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                Base.handlerSuccess(res, req);
                if(req.body.orderType == 'resupply'){
                   // res.redirect("/orders/resupplys/review");
                    res.redirect(req.session.backPath?req.session.backPath:"/orders/resupplys/review");
                }else{
                    //res.redirect("/order/check/waitOrder");
                    res.redirect(req.session.backPath?req.session.backPath:"/order/check/waitOrder");
                }
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
                Base.handlerSuccess(res, req);
                if(req.body.orderType == 'order'){
                    //res.redirect("/order/check/waitOrder");
                    res.redirect(req.session.backPath?req.session.backPath:"/order/check/waitOrder");
                }else{
                    // res.redirect("/orders/resupplys/review");
                    res.redirect(req.session.backPath?req.session.backPath:"/orders/resupplys/review");
                }
            } else {
                Base.handlerError(res, req, error, response, body);
            }

        })

    },
    updateDifficultyLevel: function (req, res) {
        // console.log('editor:::::'+JSON.stringify( req.body))
        var rehref = req.body.rehref;
        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/orders/review/updateDifficultyLevel?'+queryString.stringify(req.body),
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                if(rehref == 1){
                    Base.handlerSuccess(res, req);
                   // res.redirect("/order/permit");
                    res.redirect(req.session.backPath?req.session.backPath:"/order/permit");
                }else{
                    res.sendStatus(200);
                }
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })

    },
    chgbackeAllPage: function (req, res) {
        var tid = req.params.tid;
        var type = req.params.type;
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
                type: type,
                pagination: boostrapPaginator.render()
            }, resultList));
            res.render('order/order/back', returnData);
        });

    },
    getPriceInfo: function (req, res) {
        var tid = req.params.tid;
        request(Base.mergeRequestOptions({
            method: 'get',
            url: '/api/orders/apart/getPriceInfo/'+tid,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 200) {
                res.status(200).json(body);
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })
    },
    modifyPriceInfo: function (req, res) {
        request(Base.mergeRequestOptions({
            method: 'put',
            // url: '/api/orders/apart/updatePrice?'+queryString.stringify(req.body),
            url: '/api/orders/review/updatePrice?'+queryString.stringify(req.body),
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                Base.handlerSuccess(res, req);
                if(req.body.orderType == 'order'){
                  //  res.redirect("/order/check/getOrder");
                    res.redirect(req.session.backPath?req.session.backPath:"/order/check/getOrder");
                }else{
                   //  res.redirect("/orders/resupplys/apart");
                    res.redirect(req.session.backPath?req.session.backPath:"/orders/resupplys/apart");
                }
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })

    },
    priceLogAllPage: function (req, res) {
        var tid = req.params.tid;
        var type = req.params.type;
        var paramObject = helper.genPaginationQuery(req);
        Base.multiDataRequest(req, res, [
            {url: '/api/orders/priceLog?tid='+tid, method: 'GET', resConfig: {keyName: 'priceLogList', is_must: true}},
        ], function (req, res, resultList) {

            var paginationInfo = resultList.priceLogList;

            var boostrapPaginator = new Pagination.TemplatePaginator(helper.genPageInfo({
                prelink: paramObject.withoutPageNo,
                current: paginationInfo.page,
                rowsPerPage: paginationInfo.pageSize,
                totalResult: paginationInfo.totalItems
            }));

            var returnData = Base.mergeData(helper.mergeObject({
                title: ' ',
                tid: tid,
                type: type,
                pagination: boostrapPaginator.render()
            }, resultList));
            res.render('order/order/priceLog', returnData);
        });

    },
    communicatePage: function (req, res) {
        var tid = req.params.tid;
        var type = req.params.type;
        var returnData = {
            title: ' ',
            tid: tid,
            type: type,
        }
        res.render('order/order/communicate_create', returnData);
    },
    doCreateCommunicate: function (req, res) {
        var reload = req.body.reload;
        var tid = req.body.tid;
        var type = req.params.type;
        request(Base.mergeRequestOptions({
            method: 'post',
            url: '/api/orders/progress',
            form: req.body,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                Base.handlerSuccess(res, req);
                if(reload == 1){
                    res.redirect("/"+type+"/communicateAll/" + tid);
                }else{
                    if(type == 'order'){
                        res.redirect("/order/detail/" + tid);
                    }else{
                        res.redirect("/order/resupply/detail/" + tid);
                    }
                }


            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })
    },
    communicateAllPage: function (req, res) {
        var tid = req.params.tid;
        var type = req.params.type;
        var paramObject = helper.genPaginationQuery(req);
        Base.multiDataRequest(req, res, [
            {url: '/api/orders/progress?tid='+tid+'&'+queryString.stringify(req.query), method: 'GET', resConfig: {keyName: 'progressList', is_must: true}},
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
                type: type,
                pagination: boostrapPaginator.render()
            }, resultList));
            res.render('order/order/communicate', returnData);
        });

    },
    resupplyPage: function (req, res) {
        var paramObject = helper.genPaginationQuery(req);
        req.query.regionTypes=req.query.regionTypes?req.query.regionTypes.toString(','):'';
        Base.multiDataRequest(req, res, [
                {url: '/api/orders/resupply?'+queryString.stringify(req.query), method: 'GET', resConfig: {keyName: 'resupplyList', is_must: false}},
                {url: '/api/assist/brandinfo' , method: 'GET', resConfig: {keyName: 'brandInfo', is_must: true}},
                {url: '/api/assist/space/prod?spaceId=10', method: 'GET', resConfig: {keyName: 'prodList', is_must: true}},
                {url: '/api/assist/resupply/reason', method: 'GET', resConfig: {keyName: 'reasonList', is_must: true}},
                {url: '/api/assist/order/stcodes', method: 'GET', resConfig: {keyName: 'stcodesList', is_must: true}},
                {url: '/api/orders/resupply/getRegionTypeByGid', method: 'GET', resConfig: {keyName: 'TypesList', is_must: true}},
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
        var paramObjectOne = helper.genPaginationQuery(req, 'pageNoGid');
        var paramObject = helper.genPaginationQuery(req);

        var pageNoGid = req.query.pageNoGid?req.query.pageNoGid:'1';
        delete req.query.pageNoGid

        Base.multiDataRequest(req, res, [
            {url: '/api/orders/resupply/accept/gid?pageNo='+pageNoGid, method: 'GET', resConfig: {keyName: 'acceptingList', is_must: true}},
            {url: '/api/orders/resupply/accept?'+ (queryString.stringify(req.query)), method: 'GET', resConfig: {keyName: 'acceptList', is_must: true}},
            {url: '/api/assist/order/difficulty', method: 'GET', resConfig: {keyName: 'difficultyList', is_must: true}},
        ], function (req, res, resultList) {

            var paginationInfoOne =  resultList.acceptingList;
            var paginationInfTwo =  resultList.acceptList;

            var boostrapPaginatorOne = new Pagination.TemplatePaginator(helper.genPageInfo({
                prelink: paramObjectOne.withoutPageNo,
                current: paginationInfoOne.page,
                rowsPerPage: paginationInfoOne.pageSize,
                totalResult: paginationInfoOne.totalItems,
                pageNoName: paramObjectOne.pageNoName
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
    getTaskResupplysAgain: function (req, res) {
        var tid = req.params.tid;
        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/orders/resupply/accept/reSubmit?tid='+tid,
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
        req.body.causeStr =  req.body.causeStr.toString(',');

        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/orders/resupply/accept/notPass?'+queryString.stringify(req.body),
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                Base.handlerSuccess(res, req);
                // res.redirect("/orders/resupplys/accept");
                res.redirect(req.session.backPath?req.session.backPath:"/orders/resupplys/accept");
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })

    },
    doPassResupplys: function (req, res) {
        var tid = req.params.tid;
        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/orders/resupply/accept/pass?tid='+tid,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                res.sendStatus(200);
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })
    },
    saveResupplyReason: function (req, res) {
        var tid =  req.body.tid;
        req.body.causeStr =  req.body.causeStr.toString(',');

        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/orders/resupply/accept/saveResupplyReason?'+queryString.stringify(req.body),
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                Base.handlerSuccess(res, req);
                res.redirect("/order/resupply/detail/"+tid);
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })

    },
    reviewPage: function (req, res) {
        var paramObject = helper.genPaginationQuery(req);
        var paramObjectOne = helper.genPaginationQuery(req, 'pageNoGid');
        var paramObjectTwo = helper.genPaginationQuery(req, 'pageNoNext');

        var pageNoGid = req.query.pageNoGid?req.query.pageNoGid:'1';
        delete req.query.pageNoGid
        var pageNoNext = req.query.pageNoNext?req.query.pageNoNext:'1';
        delete req.query.pageNoNext

        Base.multiDataRequest(req, res, [
            {url: '/api/orders/resupply/review/gid?pageNo='+pageNoGid, method: 'GET', resConfig: {keyName: 'apartingList', is_must: true}},
            {url: '/api/orders/review/waitApart/gid?orderType=20&pageNo='+pageNoNext, method: 'GET', resConfig: {keyName: 'waitReviewList', is_must: true}},
            {url: '/api/orders/resupply/review?'+ (queryString.stringify(req.query)), method: 'GET', resConfig: {keyName: 'apartList', is_must: true}},
            {url: '/api/assist/brandinfo' , method: 'GET', resConfig: {keyName: 'brandInfo', is_must: true}},
            {url: '/api/assist/space/prod?spaceId=10', method: 'GET', resConfig: {keyName: 'prodList', is_must: true}},
            {url: '/api/assist/order/difficulty', method: 'GET', resConfig: {keyName: 'difficultyList', is_must: true}},
            {url: '/api/assist/deco/color', method: 'GET', resConfig: {keyName: 'colorList', is_must: true}},

        ], function (req, res, resultList) {
            var paginationInfoOne =  resultList.apartingList;
            var paginationInfTwo =  resultList.waitReviewList;
            var paginationInf =  resultList.apartList;

            var boostrapPaginatorOne = new Pagination.TemplatePaginator(helper.genPageInfo({
                prelink: paramObjectOne.withoutPageNo,
                current: paginationInfoOne.page,
                rowsPerPage: paginationInfoOne.pageSize,
                totalResult: paginationInfoOne.totalItems,
                pageNoName: paramObjectOne.pageNoName
            }));
            var boostrapPaginatorTwo = new Pagination.TemplatePaginator(helper.genPageInfo({
                prelink: paramObjectTwo.withoutPageNo,
                current: paginationInfTwo.page,
                rowsPerPage: paginationInfTwo.pageSize,
                totalResult: paginationInfTwo.totalItems,
                pageNoName: paramObjectTwo.pageNoName
            }));
            var boostrapPaginator = new Pagination.TemplatePaginator(helper.genPageInfo({
                prelink: paramObject.withoutPageNo,
                current: paginationInf.page,
                rowsPerPage: paginationInf.pageSize,
                totalResult: paginationInf.totalItems
            }));




            var returnData = Base.mergeData(helper.mergeObject({
                title: '补单审核 ',
                paginationOne: boostrapPaginatorOne.render(),
                paginationTwo: boostrapPaginatorTwo.render(),
                pagination: boostrapPaginator.render(),
                Permission :Permissions,
            },resultList));
            res.render('order/order/resupplys_check', returnData);
        });
    },
    getTaskResupplysCheck: function (req, res) {
        var tid = req.params.tid;
        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/orders/resupply/review/getTask/'+tid,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                res.sendStatus(200);
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })

    },
    doUnlockResupplysCheck: function (req, res) {
        var tid = req.params.tid;
        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/orders/resupply/review/unlock/'+tid,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                res.sendStatus(200);
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })

    },
    notPassReApart: function (req, res) {
        req.body.causeStr =  req.body.causeStr.toString(',');

        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/orders/apart/notPass?'+queryString.stringify(req.body),
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                Base.handlerSuccess(res, req);
                // res.redirect("/orders/resupplys/review");
                res.redirect(req.session.backPath?req.session.backPath:"/orders/resupplys/review");
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })

    },

    apartCheckPage: function (req, res) {
        var paramObject = helper.genPaginationQuery(req);
        var paramObjectOne = helper.genPaginationQuery(req, 'pageNoGid');
        var paramObjectTwo = helper.genPaginationQuery(req, 'pageNoNext');
        var pageNoGid = req.query.pageNoGid?req.query.pageNoGid:'1';
        delete req.query.pageNoGid
        var pageNoNext = req.query.pageNoNext?req.query.pageNoNext:'1';
        delete req.query.pageNoNext

        Base.multiDataRequest(req, res, [
            {url: '/api/orders/apartReview/gid?orderType=20&pageNo='+pageNoGid, method: 'GET', resConfig: {keyName: 'apartReviewingList', is_must: true}},
            {url: '/api/orders/apartReview/waitApartReview/gid?orderType=20&pageNo='+pageNoNext, method: 'GET', resConfig: {keyName: 'waitApartReview', is_must: true}},
            {url: '/api/orders/apartReview?orderType=20&'+ (queryString.stringify(req.query)), method: 'GET', resConfig: {keyName: 'apartReviewList', is_must: true}},
            {url: '/api/assist/brandinfo' , method: 'GET', resConfig: {keyName: 'brandInfo', is_must: true}},
            {url: '/api/assist/space/prod?spaceId=10', method: 'GET', resConfig: {keyName: 'prodList', is_must: true}},
            {url: '/api/assist/order/difficulty', method: 'GET', resConfig: {keyName: 'difficultyList', is_must: true}},
            {url: '/api/assist/deco/color', method: 'GET', resConfig: {keyName: 'colorList', is_must: true}},
        ], function (req, res, resultList) {

            var paginationInfoOne =  resultList.apartReviewingList;
            var paginationInfTwo =  resultList.waitApartReview;
            var paginationInf =  resultList.apartReviewList;

            var boostrapPaginatorOne = new Pagination.TemplatePaginator(helper.genPageInfo({
                prelink: paramObjectOne.withoutPageNo,
                current: paginationInfoOne.page,
                rowsPerPage: paginationInfoOne.pageSize,
                totalResult: paginationInfoOne.totalItems,
                pageNoName: paramObjectOne.pageNoName
            }));
            var boostrapPaginatorTwo = new Pagination.TemplatePaginator(helper.genPageInfo({
                prelink: paramObjectTwo.withoutPageNo,
                current: paginationInfTwo.page,
                rowsPerPage: paginationInfTwo.pageSize,
                totalResult: paginationInfTwo.totalItems,
                pageNoName: paramObjectTwo.pageNoName
            }));
            var boostrapPaginator = new Pagination.TemplatePaginator(helper.genPageInfo({
                prelink: paramObject.withoutPageNo,
                current: paginationInf.page,
                rowsPerPage: paginationInf.pageSize,
                totalResult: paginationInf.totalItems
            }));


            var returnData = Base.mergeData(helper.mergeObject({
                title: '补单拆单审核 ',
                paginationOne: boostrapPaginatorOne.render(),
                paginationTwo: boostrapPaginatorTwo.render(),
                pagination: boostrapPaginator.render(),
                Permission :Permissions,
            },resultList));
            res.render('order/order/resupplys_apart_check', returnData);
        });
    },

    notPassCheckReApart: function (req, res) {
        req.body.causeStr =  req.body.causeStr.toString(',');

        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/orders/apartReview/notPass?'+queryString.stringify(req.body),
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                Base.handlerSuccess(res, req);
                // res.redirect("/orders/resupplys/apartCheck");
                res.redirect(req.session.backPath?req.session.backPath:"/orders/resupplys/apartCheck");
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })
    },

    apartPage: function (req, res) {
        var paramObject = helper.genPaginationQuery(req);
        var paramObjectOne = helper.genPaginationQuery(req, 'pageNoGid');
        var paramObjectTwo = helper.genPaginationQuery(req, 'pageNoNext');

        var pageNoGid = req.query.pageNoGid?req.query.pageNoGid:'1';
        delete req.query.pageNoGid
        var pageNoNext = req.query.pageNoNext?req.query.pageNoNext:'1';
        delete req.query.pageNoNext

        Base.multiDataRequest(req, res, [
            {url: '/api/orders/apart/gid?orderType=20&pageNo='+pageNoGid, method: 'GET', resConfig: {keyName: 'apartingList', is_must: true}},
            {url: '/api/orders/apart/waitReview/gid?orderType=20&pageNo='+pageNoNext, method: 'GET', resConfig: {keyName: 'waitReviewList', is_must: true}},
            {url: '/api/orders/resupply/apart?orderType=20&'+ (queryString.stringify(req.query)), method: 'GET', resConfig: {keyName: 'apartList', is_must: true}},
            {url: '/api/assist/brandinfo' , method: 'GET', resConfig: {keyName: 'brandInfo', is_must: true}},
            {url: '/api/assist/space/prod?spaceId=10', method: 'GET', resConfig: {keyName: 'prodList', is_must: true}},
            {url: '/api/assist/order/difficulty', method: 'GET', resConfig: {keyName: 'difficultyList', is_must: true}},
            {url: '/api/assist/deco/color', method: 'GET', resConfig: {keyName: 'colorList', is_must: true}},
        ], function (req, res, resultList) {

            var paginationInfoOne =  resultList.apartingList;
            var paginationInfTwo =  resultList.waitReviewList;
            var paginationInf =  resultList.apartList;

            var boostrapPaginatorOne = new Pagination.TemplatePaginator(helper.genPageInfo({
                prelink: paramObjectOne.withoutPageNo,
                current: paginationInfoOne.page,
                rowsPerPage: paginationInfoOne.pageSize,
                totalResult: paginationInfoOne.totalItems,
                pageNoName: paramObjectOne.pageNoName
            }));
            var boostrapPaginatorTwo = new Pagination.TemplatePaginator(helper.genPageInfo({
                prelink: paramObjectTwo.withoutPageNo,
                current: paginationInfTwo.page,
                rowsPerPage: paginationInfTwo.pageSize,
                totalResult: paginationInfTwo.totalItems,
                pageNoName: paramObjectTwo.pageNoName
            }));
            var boostrapPaginator = new Pagination.TemplatePaginator(helper.genPageInfo({
                prelink: paramObject.withoutPageNo,
                current: paginationInf.page,
                rowsPerPage: paginationInf.pageSize,
                totalResult: paginationInf.totalItems
            }));




            var returnData = Base.mergeData(helper.mergeObject({
                title: '补单拆单 ',
                paginationOne: boostrapPaginatorOne.render(),
                paginationTwo: boostrapPaginatorTwo.render(),
                pagination: boostrapPaginator.render(),
                Permission :Permissions,
            },resultList));
            res.render('order/order/resupplys_apart', returnData);
        });
    },
    resupplyDetailPage: function (req, res) {
        var tid = req.params.tid;

        var paramObject = helper.genPaginationQuery(req);
        Base.multiDataRequest(req, res, [
                {url: '/api/orders/resupply/detail?tid='+tid, method: 'GET', resConfig: {keyName: 'resupplyInfo', is_must: true}},
                {url: '/api/orders/statusInfo/'+tid, method: 'GET', resConfig: {keyName: 'orderStatusInfo', is_must: false}},
                {url: '/api/assist/resupply/stcodes', method: 'GET', resConfig: {keyName: 'stcodeInfo', is_must: true}},
                // {url: '/api/assist/review/reson', method: 'GET', resConfig: {keyName: 'resonList', is_must: true}},
                {url: '/api/assist/resupply/reason', method: 'GET', resConfig: {keyName: 'resupplyReason', is_must: true}},
                {url: '/api/assist/review/acceptReason', method: 'GET', resConfig: {keyName: 'acceptReason', is_must: true}},
                {url: '/api/assist/review/apartReason', method: 'GET', resConfig: {keyName: 'apartReason', is_must: true}},
                {url: '/api/assist/review/apartReviewReason', method: 'GET', resConfig: {keyName: 'apartReviewReason', is_must: true}},
                {url: '/api/assist/review/scheduleReason', method: 'GET', resConfig: {keyName: 'scheduleReason', is_must: true}},
                {url: '/api/cofficient', method: 'GET', resConfig: {keyName: 'cofficientInfo', is_must: true}},

                // {url: '/api/assist/orderfile/type', method: 'GET', resConfig: {keyName: 'allFileTypeInfo', is_must: true}},
                {url: '/api/orders/chgback/'+tid, method: 'GET', resConfig: {keyName: 'chgbackInfo', is_must: true}},
                {url: '/api/orders/progress/'+tid, method: 'GET', resConfig: {keyName: 'progressInfo', is_must: true}},
                {url: '/api/orders/package/delivery/'+tid, method: 'GET', resConfig: {keyName: 'deliveryInfo', is_must: true}},
                {url: '/api/orders/priceLog/'+tid, method: 'GET', resConfig: {keyName: 'priceLog', is_must: true}}
            ],
            function (req, res, resultList) {

                var resupplyReason = [];
                var resupplyLeveTwo = [];
                resultList.resupplyReason.forEach(function(element,index){
                    // console.log(element.id)
                    if(element.levelType == 1){
                        resupplyReason[element.id] = element;
                        resupplyReason[element.id].data = [];
                    }else if(element.levelType == 2){
                        if(resupplyReason[element.parentId]){
                            resupplyReason[element.parentId].data.push(element);
                            resupplyLeveTwo[element.id] = element;
                            resupplyLeveTwo[element.id].dataChild = [];
                        }

                    }else{
                        if(resupplyLeveTwo[element.parentId]){
                            resupplyLeveTwo[element.parentId].dataChild.push(element);
                        }
                    }
                });

                resultList.resupplyReason = resupplyReason;


                var paginationInfo =  resultList.deliveryInfo;

                var boostrapPaginator = new Pagination.TemplatePaginator(helper.genPageInfo({
                    prelink: paramObject.withoutPageNo,
                    current: paginationInfo.page,
                    rowsPerPage: paginationInfo.pageSize,
                    totalResult: paginationInfo.totalItems
                }));

                var returnData = Base.mergeData(helper.mergeObject({
                    title: ' ',
                    tid:tid,
                    Permission :Permissions,
                    pagination: boostrapPaginator.render(),
                    orderType: 'resupply'
                }, resultList));
                res.render('order/order/resupply_detail', returnData);
            });
    },
    checkPage: function (req, res) {
        var type = req.params.type;


        var paramObjectOne = helper.genPaginationQuery(req, 'pageNoGid');
        var paramObjectTwo = helper.genPaginationQuery(req, 'pageNoNext');
        var paramObjectThr = helper.genPaginationQuery(req);

        var pageNoGid = req.query.pageNoGid?req.query.pageNoGid:'1';
        delete req.query.pageNoGid
        var pageNoNext = req.query.pageNoNext?req.query.pageNoNext:'1';
        delete req.query.pageNoNext


        if(type == 'getOrder'){
            Base.multiDataRequest(req, res, [
                {url: '/api/orders/review/gid?pageNo='+pageNoGid, method: 'GET', resConfig: {keyName: 'selfList', is_must: true}},
                {url: '/api/orders/review?'+ (queryString.stringify(req.query)), method: 'GET', resConfig: {keyName: 'orderList', is_must: true}},
                {url: '/api/orders/review/waitApart/gid?pageNo='+pageNoNext, method: 'GET', resConfig: {keyName: 'waitApart', is_must: true}},
                {url: '/api/assist/brandinfo', method: 'GET', resConfig: {keyName: 'brandinfoList', is_must: true}},
                {url: '/api/assist/order/difficulty', method: 'GET', resConfig: {keyName: 'difficultyList', is_must: true}},
                {url: '/api/assist/space/prod', method: 'GET', resConfig: {keyName: 'prodList', is_must: true}},
                {url: '/api/orders/review/reviewNumber', method: 'GET', resConfig: {keyName: 'reviewNumber', is_must: true}},
            ], function (req, res, resultList) {

                var paginationOne =  resultList.selfList;
                var paginationTwo =  resultList.waitApart;
                var paginationThr =  resultList.orderList;


                var boostrapPaginatorOne = new Pagination.TemplatePaginator(helper.genPageInfo({
                    prelink: paramObjectOne.withoutPageNo,
                    current: paginationOne.page,
                    rowsPerPage: paginationOne.pageSize,
                    totalResult: paginationOne.totalItems,
                    pageNoName: paramObjectOne.pageNoName
                }));
                var boostrapPaginatorTwo = new Pagination.TemplatePaginator(helper.genPageInfo({
                    prelink: paramObjectTwo.withoutPageNo,
                    current: paginationTwo.page,
                    rowsPerPage: paginationTwo.pageSize,
                    totalResult: paginationTwo.totalItems,
                    pageNoName: paramObjectTwo.pageNoName
                }));
                var boostrapPaginatorThr = new Pagination.TemplatePaginator(helper.genPageInfo({
                    prelink: paramObjectThr.withoutPageNo,
                    current: paginationThr.page,
                    rowsPerPage: paginationThr.pageSize,
                    totalResult: paginationThr.totalItems,
                }));


                var returnData = Base.mergeData(helper.mergeObject({
                    title: '订单审核 ',
                    paginationOne: boostrapPaginatorOne.render(),
                    paginationTwo: boostrapPaginatorTwo.render(),
                    paginationThr: boostrapPaginatorThr.render(),
                    Permission :Permissions,
                    type :type,
                },resultList));
                res.render('order/order/order_check', returnData);
            });
        }else{
            Base.multiDataRequest(req, res, [
                {url: '/api/orders/review/gid?pageNo='+pageNoGid, method: 'GET', resConfig: {keyName: 'selfList', is_must: true}},
                {url: '/api/orders/review/waitApart/gid?pageNo='+pageNoNext, method: 'GET', resConfig: {keyName: 'waitApart', is_must: true}},
                {url: '/api/assist/brandinfo', method: 'GET', resConfig: {keyName: 'brandinfoList', is_must: true}},
                {url: '/api/assist/order/difficulty', method: 'GET', resConfig: {keyName: 'difficultyList', is_must: true}},
                {url: '/api/assist/space/prod', method: 'GET', resConfig: {keyName: 'prodList', is_must: true}},
                {url: '/api/orders/review/reviewNumber', method: 'GET', resConfig: {keyName: 'reviewNumber', is_must: true}},
            ], function (req, res, resultList) {

                var paginationOne =  resultList.selfList;
                var paginationTwo =  resultList.waitApart;


                var boostrapPaginatorOne = new Pagination.TemplatePaginator(helper.genPageInfo({
                    prelink: paramObjectOne.withoutPageNo,
                    current: paginationOne.page,
                    rowsPerPage: paginationOne.pageSize,
                    totalResult: paginationOne.totalItems,
                    pageNoName: paramObjectOne.pageNoName
                }));
                var boostrapPaginatorTwo = new Pagination.TemplatePaginator(helper.genPageInfo({
                    prelink: paramObjectTwo.withoutPageNo,
                    current: paginationTwo.page,
                    rowsPerPage: paginationTwo.pageSize,
                    totalResult: paginationTwo.totalItems,
                    pageNoName: paramObjectTwo.pageNoName
                }));

                var returnData = Base.mergeData(helper.mergeObject({
                    title: '订单审核 ',
                    paginationOne: boostrapPaginatorOne.render(),
                    paginationTwo: boostrapPaginatorTwo.render(),
                    Permission :Permissions,
                    type :type,
                },resultList));
                res.render('order/order/order_check', returnData);
            });
        }

    },
    processPage: function (req, res) {
        res.render('order/order/order_process');
    },
    urgentPage: function (req, res) {
        if(!req.query.urgentVal){
            req.query.urgent=0;
            req.query.urgentVal=0;
        }
        if(req.query.urgentVal==2){
            req.query.urgent="";
        }
        if(req.query.urgentVal==1){
            req.query.urgent=1;
        }
        if(req.query.urgentVal==0){
            req.query.urgent=0;
        }
        var paramObject = helper.genPaginationQuery(req);
        req.query.regionTypes=req.query.regionTypes?req.query.regionTypes.toString(','):'';
        Base.multiDataRequest(req, res, [
            {url: '/api/orders/urgent?'+ queryString.stringify(req.query), method: 'GET', resConfig: {keyName: 'orderList', is_must: true}},
            {url: '/api/assist/order/stcodes', method: 'GET', resConfig: {keyName: 'stcodeInfo', is_must: false}},
            {url: '/api/assist/brandinfo', method: 'GET', resConfig: {keyName: 'brandInfo', is_must: false}},
            // {url: '/api/assist/space/prod', method: 'GET', resConfig: {keyName: 'prodInfo', is_must: false}},
            {url: '/api/organizations/list', method: 'GET', resConfig: {keyName: 'organizationsList', is_must: false}},
            {url: '/api/stores/list', method: 'GET', resConfig: {keyName: 'storesList', is_must: false}},
            {url: '/api/orders/getRegionTypeByGid', method: 'GET', resConfig: {keyName: 'TypesList', is_must: true}},
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
                pagination: boostrapPaginator.render(),
                Permission :Permissions,
            },resultList));
            res.render('order/order/order_urgent', returnData);
        });
    },
    updateOrderUrgent: function (req, res) {
     //   console.log("测试",req.body);
        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/orders/urgent/updateUrgent?'+queryString.stringify(req.body),
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                Base.handlerSuccess(res, req);
                res.redirect(req.session.backPath?req.session.backPath:"/order/urgent");
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })
    },
    // 订单排料页面
    nestingPage: function (req, res) {

        var paramObject = helper.genPaginationQuery(req);
        var paramObjectForGet = helper.genPaginationQuery(req, 'pageNoGid');

        var pageNoGid = req.query.pageNoGid?req.query.pageNoGid:'1';
        delete req.query.pageNoGid

        Base.multiDataRequest(req, res, [
            {url: '/api/orders/schedule?'+(queryString.stringify(req.query)), method: 'GET', resConfig: {keyName: 'scheduleAllList', is_must: true}},
            {url: '/api/orders/schedule/gid?pageNo='+pageNoGid, method: 'GET', resConfig: {keyName: 'scheduleList', is_must: true}},
            {url: '/api/assist/deco/color', method: 'GET', resConfig: {keyName: 'colorList', is_must: true}},
            {url: '/api/assist/space/prod?spaceId=10', method: 'GET', resConfig: {keyName: 'prodList', is_must: true}},
            {url: '/api/assist/order/orderType', method: 'GET', resConfig: {keyName: 'orderTypeList', is_must: true}},
        ], function (req, res, resultList) {
            var paginationInfo =  resultList.scheduleAllList;
            var paginationInfoForGet =  resultList.scheduleList;

            var boostrapPaginator = new Pagination.TemplatePaginator(helper.genPageInfo({
                prelink: paramObject.withoutPageNo,
                current: paginationInfo.page,
                rowsPerPage: paginationInfo.pageSize,
                totalResult: paginationInfo.totalItems
            }));
            var boostrapPaginatorForGet = new Pagination.TemplatePaginator(helper.genPageInfo({
                prelink: paramObjectForGet.withoutPageNo,
                current: paginationInfoForGet.page,
                rowsPerPage: paginationInfoForGet.pageSize,
                totalResult: paginationInfoForGet.totalItems,
                pageNoName: paramObjectForGet.pageNoName
            }));

            var returnData = Base.mergeData(helper.mergeObject({
                title: ' ',
                pagination: boostrapPaginator.render(),
                paginationForGet: boostrapPaginatorForGet.render(),
                Permission :Permissions,
            },resultList));
            res.render('order/order/nesting', returnData);



        });
    },
    // 标记为排料中
    getNestingTask: function (req, res) {
        var ids = req.body.roles?req.body.roles.toString(','):'';
        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/orders/schedule/getTask?tids='+ids,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                Base.handlerSuccess(res, req);
                res.redirect(req.session.backPath?req.session.backPath:"/order/nesting");
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
    // 修改批次号
    editBatchNum: function (req, res) {
        // console.log(req.body)
        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/orders/schedule/edit/batchnumber?'+queryString.stringify(req.body),
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                Base.handlerSuccess(res, req);
                res.redirect(req.session.backPath?req.session.backPath:"/order/nesting");
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
        req.body.causeStr =  req.body.causeStr.toString(',');

        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/orders/schedule/notPass?'+queryString.stringify(req.body),
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                Base.handlerSuccess(res, req);
               // console.log('statusCode')
                // res.redirect("/orders/nesting");
                res.redirect(req.session.backPath?req.session.backPath:"/orders/nesting");
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
    getTaskCheckAgain: function (req, res) {
        var tid = req.params.tid;
        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/orders/schedule/reSubmit/'+tid,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {

                res.sendStatus(200);

            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })

    },
    packagePage:function (req, res) {
        if(!req.query.packageStatusaaa){
            req.query.packageStatus=0;
            req.query.packageStatusaaa=0;
        }
        if(req.query.packageStatusaaa==2){
            req.query.packageStatus="";
        }
        if(req.query.packageStatusaaa==1){
            req.query.packageStatus=1;
        }
        if(req.query.packageStatusaaa==0){
            req.query.packageStatus=0;
        }
        var paramObject = helper.genPaginationQuery(req);
        Base.multiDataRequest(req, res, [
            {url: '/api/orders/package/list?'+(queryString.stringify(req.query)), method: 'GET', resConfig: {keyName: 'toBePackedList', is_must: true}},
            {url: '/api/stores/list', method: 'GET', resConfig: {keyName: 'storesList', is_must: true}},
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
                Permission :Permissions,
            },resultList));
            res.render('order/order/package', returnData);
        });
    },
    packedListPage:function(req,res){
        var tid=req.params.tid;
        var pid=req.query.packageLid;
        Base.multiDataRequest(req, res, [
            {url: '/api/orders/package/pcaketview/'+tid+"?"+(queryString.stringify(req.query)), method: 'GET', resConfig: {keyName: 'packedListDetail', is_must: true}},
            {url: '/api/assist/package/types', method: 'GET', resConfig: {keyName: 'packageTypeList', is_must: true}},
        ], function (req, res, resultList) {

            var packageTypeList={};
            helper.setChildDate(resultList.packageTypeList,packageTypeList);
            resultList.packageTypeList=_.orderBy(packageTypeList,['id'],['asc']);

            var returnData = Base.mergeData(helper.mergeObject({
                title: ' ',
                tid:tid,
                pid:pid,
                Permission :Permissions,
            },resultList));
            res.render('order/order/packedList', returnData);
        });
        // res.render('order/order/packedList');
    },
    allInfoPage:function(req,res){
        var paramObject = helper.genPaginationQuery(req);
        Base.multiDataRequest(req, res, [
            {url: '/api/orders/package?'+queryString.stringify(req.query), method: 'GET', resConfig: {keyName: 'packageAll', is_must: true}},
            {url: '/api/organizations/list', method: 'GET', resConfig: {keyName: 'organizationsList', is_must: true}},
        ], function (req, res, resultList) {
            var paginationInfo =  resultList.packageAll;
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
            res.render('order/order/package_all', returnData);
        });
       // res.render('order/order/packedList');
    },
    doPacket:function(req,res){
        var tid=req.params.tid;
        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/orders/package/batch/packet/'+tid,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {

                res.sendStatus(200);
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })
    },
    unPacket:function(req,res){
        var tid=req.params.tid;
        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/orders/package/batch/unpacket/'+tid,
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
        var pid = req.params.pid;
        var type = req.params.type;
        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/orders/package/packet/delete/'+pid+'?packageType='+type,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {

                res.sendStatus(200);
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })
    },
    exportPacket: function (req, res) {
        var tid = req.params.tid;
        // console.log("包装导出"+tid);
        request(Base.mergeRequestOptions({
            method: 'post',
            url: '/api/orders/package/export/'+tid,
        }, req, res)).pipe(res)
    },
    addPacket: function (req, res) {
        var tid = req.body.tid;
        var pid=req.body.pid
        // console.log("增加包装"+queryString.stringify(req.body));
        request(Base.mergeRequestOptions({
            method: 'post',
            url: '/api/orders/package/packet/add/'+tid,
            form:req.body
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                Base.handlerSuccess(res, req);
                if(pid){
                   res.redirect("/orders/package/"+tid+"?packageLid="+pid);
                }
                else{
                    res.redirect("/orders/package/"+tid);
                }
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })
    },
    // 订单详情--订单物料--非标件
    workpiecePage:function (req, res) {
        var paramObject = helper.genPaginationQuery(req);
        var tid=req.params.tid;
        var type=req.query.type;
        Base.multiDataRequest(req, res, [
            {url: '/api/orders/package/workpiece/list/'+tid+'?'+queryString.stringify(req.query), method: 'GET', resConfig: {keyName: 'workpieceList', is_must: true}},
            {url: '/api/orders/'+tid, method: 'GET', resConfig: {keyName: 'orderDetail', is_must: true}},
            {url: '/api/orders/package/workpiece/amount/'+tid, method: 'GET', resConfig: {keyName: 'workpieceAmount', is_must: true}},
            {url: '/api/assist/order/stcodes', method: 'GET', resConfig: {keyName: 'stcodeInfo', is_must: false}},
            {url: '/api/orders/workPieceHistory/'+tid, method: 'GET', resConfig: {keyName: 'workPieceHistory', is_must: false}},
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
                tid:tid,
                type:type
            },resultList));
            res.render('order/order/workpiece', returnData);
        });
    },
    // 订单详情--订单物料--配件
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
    // 订单详情--订单物料--工件导出
    exportWorkpiece: function (req, res) {
        var tid = req.params.tid;
        request(Base.mergeRequestOptions({
            method: 'post',
            url: '/api/orders/package/workpiece/export/'+tid,
        }, req, res)).pipe(res)
    },

    // 订单详情--订单物料--配件导出
    exportParts: function (req, res) {
        var tid = req.params.tid;
        request(Base.mergeRequestOptions({
            method: 'post',
            url: '/api/orders/package/accessory/export/'+tid,
        }, req, res)).pipe(res)
    },
    receiptMoneyPage: function (req, res) {
        var cid =  req.params.cid;

        if(!req.query.type){
            req.query.type = 0;
        }

        var paramObject = helper.genPaginationQuery(req);
        Base.multiDataRequest(req, res, [
            {url: '/api/stores/money/page?'+queryString.stringify(req.query), method: 'GET', resConfig: {keyName: 'moneyList', is_must: true}},
            {url: '/api/organizations/list', method: 'GET', resConfig: {keyName: 'organizationsList', is_must: true}},
            {url: '/api/assist/space/prod', method: 'GET', resConfig: {keyName: 'prodList', is_must: true}},

        ], function (req, res, resultList) {
            var paginationInfo =  resultList.moneyList;

            var boostrapPaginator = new Pagination.TemplatePaginator(helper.genPageInfo({
                prelink: paramObject.withoutPageNo,
                current: paginationInfo.page,
                rowsPerPage: paginationInfo.pageSize,
                totalResult: paginationInfo.totalItems
            }));
            var returnData = Base.mergeData(helper.mergeObject({
                title: ' ',
                cid:cid,
                pagination: boostrapPaginator.render(),
                Permission :Permissions,
                type:'receiptMoney'
            },resultList));
            res.render('order/order/money_receipt', returnData);
        });
    },
    confirmMoneyPage: function (req, res) {
        var cid =  req.params.cid;

        if(!req.query.type){
            req.query.type = 2;
        }

        var paramObject = helper.genPaginationQuery(req);
        Base.multiDataRequest(req, res, [
            {url: '/api/stores/money/page?'+queryString.stringify(req.query), method: 'GET', resConfig: {keyName: 'moneyList', is_must: true}},
            {url: '/api/organizations/list', method: 'GET', resConfig: {keyName: 'organizationsList', is_must: true}},
            {url: '/api/assist/space/prod', method: 'GET', resConfig: {keyName: 'prodList', is_must: true}},

        ], function (req, res, resultList) {
            var paginationInfo =  resultList.moneyList;

            var boostrapPaginator = new Pagination.TemplatePaginator(helper.genPageInfo({
                prelink: paramObject.withoutPageNo,
                current: paginationInfo.page,
                rowsPerPage: paginationInfo.pageSize,
                totalResult: paginationInfo.totalItems
            }));
            var returnData = Base.mergeData(helper.mergeObject({
                title: ' ',
                cid:cid,
                pagination: boostrapPaginator.render(),
                Permission :Permissions,
                type:'confirmMoney'
            },resultList));
            res.render('order/order/money_receipt', returnData);
        });
    },
    receiptCheck: function (req, res) {
        // console.log('money',JSON.stringify(req.body))
        request(Base.mergeRequestOptions({
            method: 'post',
            url: '/api/stores/money/review',
            form: req.body,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                Base.handlerSuccess(res, req);
               // res.redirect('/collection')
                res.redirect(req.session.backPath?req.session.backPath:'/collection');
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })


    },
    receiptCheckPass: function (req, res) {
        request(Base.mergeRequestOptions({
            method: 'post',
            url: '/api/stores/money/review/pass',
            form: req.body,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                Base.handlerSuccess(res,req);
                res.redirect(req.session.backPath?req.session.backPath:'/collection');
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })
    },
    receiptCheckConfirm: function (req, res) {
        request(Base.mergeRequestOptions({
            method: 'post',
            url: '/api/stores/money/confirm',
            form: req.body,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                Base.handlerSuccess(res,req);
                res.redirect(req.session.backPath?req.session.backPath:'/reconciliation');
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })
    },
    receiptCheckNotPass: function (req, res) {
        request(Base.mergeRequestOptions({
            method: 'post',
            url: '/api/stores/money/review/notpass',
            form: req.body,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                res.sendStatus(200);
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })


    },
    reconciliation: function (req, res) {
        request(Base.mergeRequestOptions({
            method: 'post',
            url: '/api/stores/money/reconciliation',
            form: req.body,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                res.sendStatus(200);
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })


    },
    reconciliationNotPass: function (req, res) {
        request(Base.mergeRequestOptions({
            method: 'post',
            url: '/api/stores/money/reconciliation/notPass',
            form: req.body,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                res.sendStatus(200);
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })


    },
    batchPage: function (req, res) {
        var paramObject = helper.genPaginationQuery(req);
        Base.multiDataRequest(req, res, [
            {url: '/api/orders/batchNumber?'+queryString.stringify(req.query), method: 'GET', resConfig: {keyName: 'batchNumber', is_must: true}},
            {url: '/api/organizations/list', method: 'GET', resConfig: {keyName: 'organizationsList', is_must: true}},
        ], function (req, res, resultList) {
            var paginationInfo =  resultList.batchNumber;

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
            res.render('order/order/batchNumber', returnData);
        });
    },
    batchDetail: function (req, res){
        var batchNumber =  req.params.batchNumber;
        var factoryId =  req.params.factoryId;

        var paramObject = helper.genPaginationQuery(req);
        Base.multiDataRequest(req, res, [
                {url: '/api/orders/batchNumber/detail?batchNumber='+batchNumber+'&factoryId='+ factoryId, method: 'GET', resConfig: {keyName: 'batchInfo', is_must: true}},
                {url: '/api/orders/batchNumber/orderDetail?batchNumber='+batchNumber+'&factoryId='+ factoryId+'&'+queryString.stringify(req.query), method: 'GET', resConfig: {keyName: 'orderDetail', is_must: true}},
            ],
            function (req, res, resultList) {
                var paginationInfo =  resultList.orderDetail;

                var boostrapPaginator = new Pagination.TemplatePaginator(helper.genPageInfo({
                    prelink: paramObject.withoutPageNo,
                    current: paginationInfo.page,
                    rowsPerPage: paginationInfo.pageSize,
                    totalResult: paginationInfo.totalItems
                }));
                var returnData = Base.mergeData(helper.mergeObject({
                    title: ' ',
                    batchNumber:batchNumber,
                    pagination: boostrapPaginator.render(),
                }, resultList));
                res.render('order/order/batchNumber_detail', returnData);

            });
    },
    doPacketBatchNumber:function(req,res){
        request(Base.mergeRequestOptions({
            method: 'post',
            url: '/api/orders/package/batch/packet/batchNumber',
            form: req.body
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                res.sendStatus(200);
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })
    },
    doUnpacketBatchNumber:function(req,res){
        request(Base.mergeRequestOptions({
            method: 'post',
            url: '/api/orders/package/batch/unpacket/batchNumber',
            form: req.body
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                res.sendStatus(200);
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })
    },
    doScheduleBatchNumber:function(req,res){
        request(Base.mergeRequestOptions({
            method: 'post',
            url: '/api/orders/schedule/batchNumber/pass',
            form: req.body
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                res.sendStatus(200);
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })
    },
    getBatchNumberFiles:function(req,res){
        request(Base.mergeRequestOptions({
            method: 'get',
            url: '/api/orders/batchNumber/files/number?'+queryString.stringify(req.body),
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 200) {
                res.status(200).json(body);
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })
    },
    downloadZip: function (req, res) {
        var batchNumber =  req.params.batchNumber;
        var factoryId =  req.params.factoryId;

        Base.multiDataRequest(req, res, [
                {url: '/api/orders/batchNumber/files?batchNumber='+batchNumber+'&factoryId='+ factoryId, method: 'GET', resConfig: {keyName: 'files', is_must: true}},
            ],
            function (req, res, resultList) {
                var fileTypeList = [];
                resultList.files.forEach(function(element,index){
                    fileTypeList.push({url:element.savePath,originalFileName:element.fileName});
                });

                var data = {
                    list:fileTypeList,
                    fileName:batchNumber+'-拆单dwg文件'
                }
                // console.log('fileTypeList',JSON.stringify(data))
                request(Base.mergeRequestOptions({
                    http: DWY_GLOBAL.server.Static.http,
                    host: DWY_GLOBAL.server.Static.host,
                    port: DWY_GLOBAL.server.Static.port,
                    headers:{'Content-type':'application/json'},
                    method: 'post',
                    url: '/zipDownload',
                    body:JSON.stringify(data),
                }, req, res)).pipe(res)

            });

    },
    downloadPackage: function (req, res) {
        var batchNumber =  req.params.batchNumber;
        var factoryId =  req.params.factoryId;
        request(Base.mergeRequestOptions({
            method: 'get',
            url: '/api/orders/batchNumber/export?batchNumber='+batchNumber+'&factoryId='+factoryId,
        }, req, res)).pipe(res)
    },
};

module.exports = OrderController;

