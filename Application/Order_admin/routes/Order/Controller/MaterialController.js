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

var MaterialController = {
    indexPage: function (req, res) {
        var bid = req.query.bid? req.query.bid: req.session.user.bid;
        var stairCatId = req.query.stairCatId;
        if(!stairCatId){stairCatId='';}
        var paramObject = helper.genPaginationQuery(req);
        Base.multiDataRequest(req, res, [
            {url: '/api/materials?'+ queryString.stringify(req.query), method: 'GET', resConfig: {keyName: 'mateList', is_must: true}},
            {url: '/api/categories/list?parentId=0', method: 'GET', resConfig: {keyName: 'stairCategory', is_must: true}},
            {url: '/api/attributes/categories?categoryId='+stairCatId, method: 'GET', resConfig: {keyName: 'theadList', is_must: true}},
            {url: '/api/organizations/factory', method: 'GET', resConfig: {keyName: 'factoryList', is_must: true}},
        ], function (req, res, resultList) {

            //stairCatId 不存在，从菜单栏点击进入页面时
            if(resultList.stairCategory && resultList.stairCategory.length>0){
                if(!stairCatId){
                    var searchId = resultList.stairCategory[0].id;
                    // console.log('searchId',searchId)
                    res.redirect("/materialManage?stairCatId="+searchId);
                }
            }

            var paginationInfo =  resultList.mateList;

            var boostrapPaginator = new Pagination.TemplatePaginator(helper.genPageInfo({
                prelink: paramObject.withoutPageNo,
                current: paginationInfo.page,
                rowsPerPage: paginationInfo.pageSize,
                totalResult: paginationInfo.totalItems
            }));

            var returnData = Base.mergeData(helper.mergeObject({
                title: ' ',
                bid:bid,
                pagination: boostrapPaginator.render(),
                Permission :Permissions,
            },resultList));
            res.render('order/material/material_index',returnData);
        });
        //res.render('order/material/material_index');
    },
    detailPage: function (req, res) {
        var mid =req.params.mid;
        var bid = req.params.bid;
        //console.log( '/api/purchases/mate?bid='+bid+"&mateId="+mid);
        Base.multiDataRequest(req, res, [
            {url: '/api/materials/'+mid+"?bid="+bid, method: 'GET', resConfig: {keyName: 'mateInfo', is_must: true}},
            {url: '/api/organizations//factory', method: 'GET', resConfig: {keyName: 'factoryList', is_must: true}},
            {url: '/api/purchases/mate?bid='+bid+"&mateId="+mid, method: 'GET', resConfig: {keyName: 'purchasesMateList', is_must: true}},
            {url: '/api/whse/cargospace?mateId='+mid+"&isAll=1&bid="+bid, method: 'GET', resConfig: {keyName: 'whseCargospaceList', is_must: true}},
            {url: '/api/assist/stock/reasonTypes', method: 'GET', resConfig: {keyName: 'stockReasonTypes', is_must: true}},
            {url: '/api/materials/stockOperation/page?pageSize=6&mateId='+mid, method: 'GET', resConfig: {keyName: 'stockOperationList', is_must: true}},
        ], function (req, res, resultList) {
            var returnData = Base.mergeData(helper.mergeObject({
                title: ' ',
                mid:mid,
                bid:bid,
                Permission :Permissions,
            },resultList));
            res.render('order/material/material_detail',returnData);
        });
    //res.render('order/material/material_detail');
    },
    choiceFactory: function (req, res) {
        var fac=req.body.factory;
        var mid=req.body.mateId;
       res.redirect("/materialManage/detail/"+fac+"/"+mid);
    },
    summaryPage: function (req, res) {
        if(!req.query.type){
            req.query.type=1;
        }
        var paramObject = helper.genPaginationQuery(req);
        Base.multiDataRequest(req, res, [
            {url: '/api/materials/inandout/page?'+ queryString.stringify(req.query), method: 'GET', resConfig: {keyName: 'mateInAndOutList', is_must: true}},
        ], function (req, res, resultList) {

            var paginationInfo =  resultList.mateInAndOutList;

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
            res.render('order/material/material_summary',returnData);
        });
        //res.render('order/material/material_summary');
    },
    materialCreateOnePage: function (req, res) {
        var tid=req.params.tid;
         Base.multiDataRequest(req, res, [
             {url: '/api/categories/list?parentId=0', method: 'GET', resConfig: {keyName: 'stairCategory', is_must: true}},
         ], function (req, res, resultList) {
         var returnData = Base.mergeData(helper.mergeObject({
              title: ' ',
             tid:tid,
         },resultList));
         res.render('order/material/material_create_one',returnData);
         });
        //res.render('order/material/material_create_one');
    },
    selectMateCate:function(req,res){
        var pid=req.params.pid;
        request(Base.mergeRequestOptions({
            method: 'get',
            url: '/api/categories/list?parentId='+pid,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 200) {

                res.status(200).json(body);
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })
    },
    doNext: function (req, res) {
        var id = req.body.thirdlyCategory;
        console.log(id);
        res.redirect("/materialManage/material/creStepS/"+id);
    },
    materialCreateSecPage: function (req, res) {
         var id = req.params.id;
         console.log(id);
         Base.multiDataRequest(req, res, [
             {url: '/api/materials/attributes/'+id, method: 'GET', resConfig: {keyName: 'materialInfo', is_must: true}},
             {url: '/api/assist/material/units', method: 'GET', resConfig: {keyName: 'units', is_must: true}},
             {url: '/api/assist/package/types', method: 'GET', resConfig: {keyName: 'getPackageTypes', is_must: true}},
         ], function (req, res, resultList) {
             var returnData = Base.mergeData(helper.mergeObject({
                 title: ' ',
                 id:id,
             },resultList));
             res.render('order/material/material_create_second',returnData);
         });
       // res.render('order/material/material_create_second');
    },
    doCreate: function (req, res) {
        //console.log('物料创建'+ JSON.stringify(req.body));
        request(Base.mergeRequestOptions({
            method: 'post',
            url: '/api/materials',
            form:req.body,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {

                res.sendStatus(200);
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })
    },
    materialModifyPage: function (req, res) {
        var id = req.params.mid;
        console.log(id);
        Base.multiDataRequest(req, res, [
            {url: '/api/materials/'+id, method: 'GET', resConfig: {keyName: 'mateInfo', is_must: true}},
            {url: '/api/assist/material/units', method: 'GET', resConfig: {keyName: 'units', is_must: true}},
            {url: '/api/assist/package/types', method: 'GET', resConfig: {keyName: 'getPackageTypes', is_must: true}},
        ], function (req, res, resultList) {
            var returnData = Base.mergeData(helper.mergeObject({
                title: ' ',
                id:id,
            },resultList));
            res.render('order/material/material_modify',returnData);
        });
    },
    doModify: function (req, res) {
        //console.log('物料修改'+ JSON.stringify(req.body));
        var mid = req.body.id;
        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/materials/'+mid+"?"+queryString.stringify(req.body),
            form:req.body,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                Base.handlerSuccess(res, req);
                res.redirect("/materialManage");
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })
    },
    setMaterialStatus: function (req, res) {
        var mid = req.params.mid;
        var type = req.params.type;
        //console.log('ajx'+ JSON.stringify(req.params));
        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/materials/'+mid+'/stcode?stcode='+type,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {

                res.sendStatus(200);
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })

    },
    mateFacAddPage: function (req, res) {
        var mid = req.params.mid;
        var bid=req.params.bid;
        Base.multiDataRequest(req, res, [
            {url: '/api/materials/'+mid+"?bid="+bid, method: 'GET', resConfig: {keyName: 'mateInfo', is_must: true}},
        ], function (req, res, resultList) {
            var returnData = Base.mergeData(helper.mergeObject({
                title: ' ',
                mid:mid,
                bid:bid,
            },resultList));
            res.render('order/material/material_detail_add',returnData);
        });
    },
    doAdd: function (req, res) {
        //console.log('工厂物料完善物料'+ JSON.stringify(req.body));
    var mid=req.body.mateId;
    var bid=req.body.bid;
    request(Base.mergeRequestOptions({
        method: 'post',
        url: '/api/materials/stock',
        form:req.body,
    }, req, res), function (error, response, body) {
        if (!error && response.statusCode == 201) {
            Base.handlerSuccess(res, req);
            res.redirect("/materialManage/detail/"+bid+"/"+mid);
        } else {
            Base.handlerError(res, req, error, response, body);
        }
    })
},
    materialTypeCreateOnePage: function (req, res) {
        var tid=req.params.tid;
        Base.multiDataRequest(req, res, [
            {url: '/api/categories/attributes/'+ tid, method: 'GET', resConfig: {keyName: 'mateCategory', is_must: true}},
        ], function (req, res, resultList) {
            var returnData = Base.mergeData(helper.mergeObject({
                title: ' ',
                tid:tid,
            },resultList));
            res.render('order/material/material_create_one',returnData);
        });
        //res.render('order/material/material_create_one');
    },
    workpiecePage: function (req, res) {
        var mid =req.params.mid;
        Base.multiDataRequest(req, res, [
            {url: '/api/materials/workpiece/'+mid, method: 'GET', resConfig: {keyName: 'workpieceList', is_must: true}},
        ], function (req, res, resultList) {
            var returnData = Base.mergeData(helper.mergeObject({
                title: ' ',
                mid:mid,
            },resultList));
            res.render('order/material/material_workpiece',returnData);
        });
        //res.render('order/material/material_workpiece');
    },
    materiel_accessoryPage: function (req, res) {
         var mid =req.params.mid;
         Base.multiDataRequest(req, res, [
         {url: '/api/materials/accessory/'+mid, method: 'GET', resConfig: {keyName: 'accessoryList', is_must: true}},
         ], function (req, res, resultList) {
         var returnData = Base.mergeData(helper.mergeObject({
         title: ' ',
         mid:mid,
         },resultList));
         res.render('order/material/materiel_accessory',returnData);
         });
       // res.render('order/material/materiel_modal');
    },
    fileDoCreate: function (req, res) {
        console.log(req.body);
        request(Base.mergeRequestOptions({
            method: 'post',
            url: '/api/materials/accessory/workpiece',
            form:req.body,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {

                res.sendStatus(200);
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })
    },
    setMaterialAppStatus: function (req, res) {
        var mid = req.params.mid;
        var bid= req.params.bid;
        var type = req.params.type;
        //console.log('ajx'+ JSON.stringify(req.params));
        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/materials/stcode/'+bid+'/'+mid+'?stcode='+type,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {

                res.sendStatus(200);
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })

    },
    warningDoCreate: function (req, res) {
        var mid=req.body.mateId;
        var bid=req.body.bid;
        console.log(req.body);
        request(Base.mergeRequestOptions({
            method: 'post',
            url: '/api/materials/stock',
            form:req.body,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                Base.handlerSuccess(res, req);
                res.redirect("/materialManage/detail/"+bid+"/"+mid);
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })
    },
    stockDoCreate: function (req, res) {
        var mid=req.body.mateId;
        var bid=req.body.bid;
        console.log(req.body);
        request(Base.mergeRequestOptions({
            method: 'post',
            url: '/api/materials/stockOperation',
            form:req.body,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                Base.handlerSuccess(res, req);
                res.redirect("/materialManage/detail/"+bid+"/"+mid);
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })
    },
    stockRecordPage: function (req, res) {
      /*  var mid=req.query.mateId;
        if(!req.query.mateId){
            req.query.mateId=mid;
        }*/
        var ftyId = req.query.ftyId ? req.query.ftyId: req.session.user.ftyId;
        var whseId = req.query.whseId;
        var regionId = req.query.regionId;
        console.log('ftyId:'+ftyId+'whseId:'+whseId+'regionId:'+regionId);
        var multiDataRequest= [
            {url: '/api/materials/stockOperation/page?'+ queryString.stringify(req.query), method: 'GET', resConfig: {keyName: 'stockOperationList', is_must: true}},
            {url: '/api/whse/factory/list', method: 'GET', resConfig: {keyName: 'factoryList', is_must: true}},
        ];
        if(ftyId){
            //console.log('有whseId');
            multiDataRequest= [
                {url: '/api/materials/stockOperation/page?'+ queryString.stringify(req.query), method: 'GET', resConfig: {keyName: 'stockOperationList', is_must: true}},
                {url: '/api/whse/factory/list', method: 'GET', resConfig: {keyName: 'factoryList', is_must: true}},
                {url: '/api/whse/warehouse/list/'+ftyId, method: 'GET', resConfig: {keyName: 'warehouseList', is_must: true}},
            ];
        }
        if(whseId){
            //console.log('有whseId');
            multiDataRequest= [
                {url: '/api/materials/stockOperation/page?'+ queryString.stringify(req.query), method: 'GET', resConfig: {keyName: 'stockOperationList', is_must: true}},
                {url: '/api/whse/factory/list', method: 'GET', resConfig: {keyName: 'factoryList', is_must: true}},
                {url: '/api/whse/warehouse/list/'+ftyId, method: 'GET', resConfig: {keyName: 'warehouseList', is_must: true}},
                {url: '/api/whse/region/list/'+whseId, method: 'GET', resConfig: {keyName: 'regionList', is_must: true}},
            ];
        }
        var paramObject = helper.genPaginationQuery(req);
        Base.multiDataRequest(req, res, multiDataRequest, function (req, res, resultList) {

            var paginationInfo =  resultList.stockOperationList;

            var boostrapPaginator = new Pagination.TemplatePaginator(helper.genPageInfo({
                prelink: paramObject.withoutPageNo,
                current: paginationInfo.page,
                rowsPerPage: paginationInfo.pageSize,
                totalResult: paginationInfo.totalItems
            }));

            if(!ftyId){
                resultList.warehouseList = [];
            }
            if(!whseId){
                resultList.regionList = [];
            }

            var returnData = Base.mergeData(helper.mergeObject({
                title: ' ',
                userFtyId: ftyId,
                Permission :Permissions,
                pagination: boostrapPaginator.render()
            },resultList));
            res.render('order/material/stockRecord',returnData);
        });
        //res.render('order/material/stockRecord');
    },
};
module.exports = MaterialController;

