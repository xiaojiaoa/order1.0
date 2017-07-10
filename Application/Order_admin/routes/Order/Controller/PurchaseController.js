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


var PurchaseController = {
    //已请购列表
    purchasePage: function (req, res) {
        // if(!req.query.stcode){
        //     req.query.stcode=50;
        // }
        var paramObject = helper.genPaginationQuery(req);
        var tid=req.params.tid;
        Base.multiDataRequest(req, res, [
            {url: '/api/purchase/request?'+(queryString.stringify(req.query)), method: 'GET', resConfig: {keyName: 'purchasesList', is_must: true}},
            {url: '/api/assist/order/stcodes', method: 'GET', resConfig: {keyName: 'stcodeInfo', is_must: false}},
            {url: '/api/organizations//list?'+(queryString.stringify(req.query)), method: 'GET', resConfig: {keyName: 'factoryLists', is_must: true}},
            {url: '/api/suppliers/organ?'+(queryString.stringify(req.query)), method: 'GET', resConfig: {keyName: 'suppLists', is_must: true}},
        ], function (req, res, resultList) {
            var paginationInfo =  resultList.purchasesList;
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
                tid:tid,
            },resultList));
            res.render('order/purchase/index', returnData);

        });
    },
    //新建请购单页面
    purchaseApplyCreatPage: function (req, res) {
        var paramObject = helper.genPaginationQuery(req);
        var tid = req.params.tid;
        var bid = req.query.bid? req.query.bid: req.session.user.bid;
        Base.multiDataRequest(req, res, [
               {url: '/api/categories/list/usable', method: 'GET', resConfig: {keyName: 'suppliersMaterialList', is_must: true}},
                {url: '/api/purchase/request/mates?'+(queryString.stringify(req.query)), method: 'GET', resConfig: {keyName: 'supMaterialList', is_must: true}},
            ], function (req, res, resultList) {
                var paginationInfo =  resultList.supMaterialList;
                var boostrapPaginator = new Pagination.TemplatePaginator(helper.genPageInfo({
                    prelink: paramObject.withoutPageNo,
                    current: paginationInfo.page,
                    rowsPerPage: paginationInfo.pageSize,
                    totalResult: paginationInfo.totalItems
                }));

                var returnData = Base.mergeData(helper.mergeObject({
                    title: ' ',
                    Permission :Permissions,
                    pagination: boostrapPaginator.render(),
                    tid:tid,
                    bid:bid,
                }, resultList));
                res.render('order/purchase/apply_creat', returnData);
            });
    },
    //新建请购单第一步
    purchaseApplyMaterialCreat: function (req, res) {
        res.render('order/purchase/apply_createMaterial');
    },
    //新建请购单第二步--物料信息的添加--数量和日期
    applyMaterialCreatePage: function (req, res) {
        var tid=req.params.tid;
        var bid = req.query.bid? req.query.bid: req.session.user.bid;
        Base.multiDataRequest(req, res, [
                {url: '/api/materials/list?ids='+tid, method: 'GET', resConfig: {keyName: 'suppliersMaterialLists', is_must: true}},
            ],
            function (req, res, resultList) {
                var returnData = Base.mergeData(helper.mergeObject({
                    title: ' ',
                    Permission :Permissions,
                    bid:bid,
                }, resultList));
                res.render('order/purchase/apply_createMaterial', returnData);
            });
    },
    //新建请购单 添加物料数量+预计交期
    applyMaterialCreate: function (req, res) {
        request(Base.mergeRequestOptions({
            method: 'post',
            url: '/api/purchase/request/',
            headers:{'Content-type':'application/json'},
            body:JSON.stringify(req.body),
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {

                res.sendStatus(200);
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })
    },


    //请购单详情
    purchaseApplyDetailPage: function (req, res) {
        var tid = req.params.tid;
        var bid = req.query.bid? req.query.bid: req.session.user.bid;
        Base.multiDataRequest(req, res, [
                {url: '/api/purchase/request/'+tid, method: 'GET', resConfig: {keyName: 'purchaseRequestDetail', is_must: true}},
            ],
            function (req, res, resultList) {
                var returnData = Base.mergeData(helper.mergeObject({
                    title: ' ',
                    tid:tid,
                    bid:bid,
                    Permission :Permissions,
                }, resultList));
                res.render('order/purchase/apply_detail', returnData);
            });
    },
    //审核请购单
    purchaseApplyReview: function (req, res) {
        var tid = req.params.tid;
        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/purchase/request?id='+tid,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {

                res.sendStatus(200)
            }else{
                Base.handlerError(res, req, error, response, body);
            }
        })
    },
    //删除请购单
    applyPurchaseDel: function (req, res) {
        var purcIds = req.params.purcIds;
        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/purchase/request/delete?reqIds='+purcIds,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                res.sendStatus(200)
            }else{
                Base.handlerError(res, req, error, response, body);
            }
        })
    },

    //生成采购单
    purchaseOrder: function (req, res) {
        var tid = req.params.tid;
        request(Base.mergeRequestOptions({
            method: 'post',
            url: '/api/purchases?reqId='+tid,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {

                res.sendStatus(200)
            }else{
                Base.handlerError(res, req, error, response, body);
            }
        })
    },

    //外协请购修改供应商
    applyPurchaseModify: function (req, res) {
        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/purchase/reqmaterial',
            headers:{'Content-type':'application/json'},
            body:JSON.stringify(req.body),
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {

                res.sendStatus(200);
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })
    },


    //采购列表
    purchaseDetail: function (req, res) {
        var paramObject = helper.genPaginationQuery(req);
        Base.multiDataRequest(req, res, [
            {url: '/api/purchases?'+(queryString.stringify(req.query)), method: 'GET', resConfig: {keyName: 'purchasesLists', is_must: true}},
            {url: '/api/organizations//list?'+(queryString.stringify(req.query)), method: 'GET', resConfig: {keyName: 'factoryLists', is_must: true}},
            {url: '/api/suppliers/organ?'+(queryString.stringify(req.query)), method: 'GET', resConfig: {keyName: 'suppLists', is_must: true}},
        ], function (req, res, resultList) {
            var paginationInfo =  resultList.purchasesLists;
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
            res.render('order/purchase/detail', returnData);
        });
    },
    //采购单详情
    purchaseOrderDetail: function (req, res) {
        var tid = req.params.tid;
        Base.multiDataRequest(req, res, [
                {url: '/api/purchases/'+tid, method: 'GET', resConfig: {keyName: 'purchaseOrderList', is_must: true}},
            ],
            function (req, res, resultList) {
                var returnData = Base.mergeData(helper.mergeObject({
                    title: ' ',
                    tid:tid,
                    Permission :Permissions,
                }, resultList));
                res.render('order/purchase/order_detail', returnData);
            });
    },
    //采购单付款上传凭证 type=10
    uploadProof: function (req, res) {
        request(Base.mergeRequestOptions({
            method: 'post',
            url: '/api/purchase/reqmaterial/deposit',
            form:req.body,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                Base.handlerSuccess(res, req);
              //  res.redirect("/purchase/detail");
                res.redirect(req.session.backPath?req.session.backPath:"/purchase/detail");
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })
    },
    //采购单付款上传凭证 type=30
    uploadProof2: function (req, res) {
        request(Base.mergeRequestOptions({
            method: 'post',
            url: '/api/purchase/reqmaterial/payment',
            form:req.body,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                Base.handlerSuccess(res, req);
                //  res.redirect("/purchase/detail");
                res.redirect(req.session.backPath?req.session.backPath:"/purchase/detail");
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })
    },
    //合并采购单
    purchaseMerge: function (req, res) {
        var tid = req.params.tid;
        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/purchases/merge?purcIds='+tid,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {

                res.sendStatus(200)
            }else{
                Base.handlerError(res, req, error, response, body);
            }
        })
    },
    //审核采购单
    purchaseReview: function (req, res) {
        var tid = req.params.tid;
        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/purchases/review?purcIds='+tid,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {

                res.sendStatus(200)
            }else{
                Base.handlerError(res, req, error, response, body);
            }
        })
    },
    //撤回采购单
    purchaseRecall: function (req, res) {
        var tid = req.params.tid;
        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/purchases/review/cancel?purcIds='+tid,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                res.sendStatus(200)
            }else{
                Base.handlerError(res, req, error, response, body);
            }
        })
    },
    //提交采购单
    purchaseSubmit: function (req, res) {
        var tid = req.params.tid;
        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/purchases/submit?purcIds='+tid,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {

                res.sendStatus(200)
            }else{
                Base.handlerError(res, req, error, response, body);
            }
        })
    },
    //删除采购单
    purchaseDel: function (req, res) {
        var purcIds = req.params.purcIds;
        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/purchases/delete?purcIds='+purcIds,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {

                res.sendStatus(200)
            }else{
                Base.handlerError(res, req, error, response, body);
            }
        })
    },

    //打印采购单
    printPurchase: function (req, res) {
        // var batchNumber = req.params.batchNumber;
        // var factoryId = req.params.factoryId;
        // var type = req.query.type;
        // request(Base.mergeRequestOptions({
        //     method: 'get',
        //     url: '/api/orders/package/print/packagelist/' + batchNumber + '/' + factoryId,
        // }, req, res), function (error, response, body) {
        //     if (!error && response.statusCode == 200) {
        //         var returnData = Base.mergeData(helper.mergeObject({
        //             batchNumber: batchNumber,
        //             factoryId: factoryId,
        //             type: 'arry',
        //             showTYpe: type
        //         }, {printINfo: JSON.parse(body)}));
        //         res.render('order/system/print', returnData);
        //     } else {
        //         Base.handlerError(res, req, error, response, body);
        //     }
        // })
        res.render('order/purchase/print');
    },

    //新建采购单页面
    purchaseCreatePage: function (req, res) {
        var paramObject = helper.genPaginationQuery(req);
        var tid = req.params.tid;
        var bid = req.query.bid? req.query.bid: req.session.user.bid;
        Base.multiDataRequest(req, res, [
            {url: '/api/categories/list?parentId=0', method: 'GET', resConfig: {keyName: 'suppliersMaterialList', is_must: true}},
            {url: '/api/purchase/request/mates?'+(queryString.stringify(req.query)), method: 'GET', resConfig: {keyName: 'supMaterialList', is_must: true}},
            {url: '/api/suppliers/organ/mate?'+(queryString.stringify(req.query)), method: 'GET', resConfig: {keyName: 'suppList', is_must: true}},
        ], function (req, res, resultList) {
            var paginationInfo =  resultList.supMaterialList;
            var boostrapPaginator = new Pagination.TemplatePaginator(helper.genPageInfo({
                prelink: paramObject.withoutPageNo,
                current: paginationInfo.page,
                rowsPerPage: paginationInfo.pageSize,
                totalResult: paginationInfo.totalItems
            }));

            var returnData = Base.mergeData(helper.mergeObject({
                title: ' ',
                Permission :Permissions,
                pagination: boostrapPaginator.render(),
                tid:tid,
                bid:bid,
            }, resultList));
            res.render('order/purchase/create', returnData);
        });
    },
    //新建采购单第一步
    purchaseMaterialCreat: function (req, res) {
        res.render('order/purchase/createMaterial');
    },
    //新建采购单 添加物料数量+预计交期
    materialCreate: function (req, res) {
        request(Base.mergeRequestOptions({
            method: 'post',
            url: '/api/purchases/direct',
            headers:{'Content-type':'application/json'},
            body:JSON.stringify(req.body),
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {

                res.sendStatus(200);
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })
    },
};

module.exports = PurchaseController;