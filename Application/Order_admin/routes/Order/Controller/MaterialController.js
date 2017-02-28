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
        var paramObject = helper.genPaginationQuery(req);
        Base.multiDataRequest(req, res, [
            {url: '/api/materials?'+ queryString.stringify(req.query), method: 'GET', resConfig: {keyName: 'mateList', is_must: true}},
            {url: '/api/categories/list?parentId=0', method: 'GET', resConfig: {keyName: 'stairCategory', is_must: true}}
        ], function (req, res, resultList) {

            var paginationInfo =  resultList.mateList;

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
            res.render('order/material/material_index',returnData);
        });
        //res.render('order/material/material_index');
    },
    detailPage: function (req, res) {
        var mid =  req.params.mid;
        Base.multiDataRequest(req, res, [
            {url: '/api/materials/'+mid, method: 'GET', resConfig: {keyName: 'mateInfo', is_must: true}},
        ], function (req, res, resultList) {
            var returnData = Base.mergeData(helper.mergeObject({
                title: ' ',
                mid:mid,
            },resultList));
            res.render('order/material/material_detail',returnData);
        });
    //res.render('order/material/material_detail');
    },
    summaryPage: function (req, res) {
        res.render('order/material/material_summary');
    },
    materialCreateOnePage: function (req, res) {

         Base.multiDataRequest(req, res, [
         {url: '/api/categories/list?parentId=0', method: 'GET', resConfig: {keyName: 'stairCategory', is_must: true}}
         ], function (req, res, resultList) {
         var returnData = Base.mergeData(helper.mergeObject({
         title: ' ',
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
        console.log('物料创建'+ JSON.stringify(req.body));
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
        ], function (req, res, resultList) {
            var returnData = Base.mergeData(helper.mergeObject({
                title: ' ',
                id:id,
            },resultList));
            res.render('order/material/material_modify',returnData);
        });
    },
    setMaterialStatus: function (req, res) {
        var mid = req.params.mid;
        var type = req.params.type;
        console.log('ajx'+ JSON.stringify(req.params));
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
};

module.exports = MaterialController;

