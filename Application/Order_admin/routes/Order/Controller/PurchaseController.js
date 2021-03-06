//模板 供复制用
var Base = require('./BaseController');

//分页
var Pagination = require('pagination');

//生成请求query
var queryString = require('qs');

//自定义帮助函数
var helper = require('../config/helper');
var DWY_GLOBAL = require('../config/global');

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
                {url: '/api/purchase/request/suppfile?reqId='+tid, method: 'GET', resConfig: {keyName: 'suppsList', is_must: true}},
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
        // var purcIds = req.params.purcIds;
        var ids = req.body.roles?req.body.roles.toString(','):'';
        // console.log('idididididi',ids)
        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/purchase/request/delete?reqIds='+ids,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                Base.handlerSuccess(res, req);
                res.redirect("/purchase");
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
    //财务查看采购
    financePurchase:function(req,res){
        // res.redirect("/purchase/detail?payCode=10");
        var paramObject = helper.genPaginationQuery(req);
        if(!req.query.payCode){
            req.query.payCode = 10
        }
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
    downloadPurchaseFileZip: function (req, res) {
        var purcId=req.body.purcId;
       // console.log(1111,'/api/purchases/suppfile?purcId='+purcId);
        Base.multiDataRequest(req, res, [
              {url: '/api/purchases/suppfile?purcId='+purcId, method: 'GET', resConfig: {keyName: 'files', is_must: true}},
            ],
            function (req, res, resultList) {
          //  console.log(222,resultList.files);
                var fileTypeList = [];
                resultList.files.forEach(function(element,index){
                    fileTypeList.push({url:element.path,originalFileName:element.fileName});
                });

                var data = {
                    list:fileTypeList,
                    fileName:req.body.purcId+'-相关文件'
                }
              //   console.log('fileTypeList',JSON.stringify(data))
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
    //采购单付款上传凭证 type=10
    uploadProof: function (req, res) {
        var purchaseId = req.body.purchaseId;
        request(Base.mergeRequestOptions({
            method: 'post',
            url: '/api/purchase/reqmaterial/deposit',
            form:req.body,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                Base.handlerSuccess(res, req);
              //  res.redirect("/purchase/detail");
                res.redirect("/purchase/orderDetail/"+purchaseId);
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })
    },
    //采购单付款上传凭证 type=30
    uploadProof2: function (req, res) {
        var purchaseId = req.body.purchaseId;
        request(Base.mergeRequestOptions({
            method: 'post',
            url: '/api/purchase/reqmaterial/payment',
            form:req.body,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                Base.handlerSuccess(res, req);
                res.redirect("/purchase/orderDetail/"+purchaseId);
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })
    },
    //合并采购单
    purchaseMerge: function (req, res) {
        var ids = req.body.roles?req.body.roles.toString(','):'';
        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/purchases/merge?purcIds='+ids,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                Base.handlerSuccess(res, req);
                res.redirect("/purchase/detail/finance");
            }else{
                Base.handlerError(res, req, error, response, body);
            }
        })
    },
    //审核采购单
    purchaseReview: function (req, res) {
        var ids = req.body.roles?req.body.roles.toString(','):'';
        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/purchases/review?purcIds='+ids,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                Base.handlerSuccess(res, req);
                res.redirect("/purchase/detail/finance");
            }else{
                Base.handlerError(res, req, error, response, body);
            }
        })
    },
    //撤回采购单
    purchaseRecall: function (req, res) {
        var ids = req.body.roles?req.body.roles.toString(','):'';
        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/purchases/review/cancel?purcIds='+ids,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                Base.handlerSuccess(res, req);
                res.redirect("/purchase/detail/finance");
            }else{
                Base.handlerError(res, req, error, response, body);
            }
        })
    },
    //提交采购单
    purchaseSubmit: function (req, res) {
        var ids = req.body.roles?req.body.roles.toString(','):'';
        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/purchases/submit?purcIds='+ids,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                Base.handlerSuccess(res, req);
                res.redirect("/purchase/detail/finance");
            }else{
                Base.handlerError(res, req, error, response, body);
            }
        })
    },
    //删除采购单
    purchaseDel: function (req, res) {
        var ids = req.body.roles?req.body.roles.toString(','):'';
        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/purchases/delete?purcIds='+ids,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                Base.handlerSuccess(res, req);
                res.redirect("/purchase/detail/finance");
            }else{
                Base.handlerError(res, req, error, response, body);
            }
        })
    },

    // 打印采购单
    printPurchase: function (req, res) {
        var purcIds = req.params.purcIds;
        request(Base.mergeRequestOptions({
            method: 'get',
            url: '/api/purchases/print?purcIds=' + purcIds,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 200) {

                var bodyData =JSON.parse(body);
                for(var i =0;i<bodyData.length;i++) {
                      bodyData[i] = bodyData[i].replace(/\w+(,)/g, function (string, code, str) {
                          return string.slice(0, -1);
                      });
                }
                var returnData = Base.mergeData(helper.mergeObject({
                    purcIds: purcIds,
                    type: 'delivery',
                }, {printINfo: bodyData}));
                res.render('order/purchase/print', returnData);
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })
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
    // 新建采购单第一步
    purchaseMaterialCreat: function (req, res) {
        res.render('order/purchase/createMaterial');
    },
    // 新建采购单 添加物料数量+预计交期
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

    exportOutsource: function (req, res) {
        request(Base.mergeRequestOptions({
            method: 'get',
            url: '/api/orders/batchNumber/export/outsource?'+queryString.stringify(req.body),
        }, req, res)).pipe(res)
    },
    exportPurchase: function (req, res) {

        request(Base.mergeRequestOptions({
            method: 'get',
            url: '/api/orders/batchNumber/export/purchase?'+queryString.stringify(req.query),
        }, req, res)).pipe(res)
    },
    suppliersOutsource: function (req, res) {

        var id = req.params.id;
        request(Base.mergeRequestOptions({
            method: 'get',
            url: '/api/purchase/reqmaterial/supps/'+id,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 200) {
                res.status(200).json(body);

            }else{

                res.status(500).json(body)
                // Base.handlerError(res, req, error, response, body);
            }
        })
    },
    uploadSuppfile: function (req, res) {
     //   console.log(2222,JSON.stringify(req.body));
        request(Base.mergeRequestOptions({
            method: 'post',
            url: '/api/purchase/request/suppfile',
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