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

var MaterialTypeController = {
    materialTypePage: function (req, res) {
        var paramObject = helper.genPaginationQuery(req);
        Base.multiDataRequest(req, res, [
            {url: '/api/categories?'+ queryString.stringify(req.query), method: 'GET', resConfig: {keyName: 'mateTypeList', is_must: true}}
        ], function (req, res, resultList) {

            var paginationInfo =  resultList.mateTypeList;

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
            res.render('order/material/material_type',returnData);
        });
       // res.render('order/material/material_type');
    },
    materialTypeCreOnePage: function (req, res) {
        Base.multiDataRequest(req, res, [
            {url: '/api/attributes/list/usable?'+ queryString.stringify(req.query), method: 'GET', resConfig: {keyName: 'usableAttrList', is_must: true}}
        ], function (req, res, resultList) {
            var returnData = Base.mergeData(helper.mergeObject({
                title: ' ',
            },resultList));
            res.render('order/material/material_type_creOne',returnData);
        });
       // res.render('order/material/material_type_creOne');
    },
    materialTypeCreTwoPage: function (req, res) {
        var pid =  req.params.pid;
        Base.multiDataRequest(req, res, [
            {},
        ], function (req, res, resultList) {
            var returnData = Base.mergeData(helper.mergeObject({
                title: ' ',
                mid:pid,
            },resultList));
            res.render('order/material/material_type_creTwo',returnData);
        });
        //res.render('order/material/material_type_creTwo');
    },
    materialTypeCreThreePage: function (req, res) {
        var pid =  req.params.pid;
        Base.multiDataRequest(req, res, [
            {},
        ], function (req, res, resultList) {
            var returnData = Base.mergeData(helper.mergeObject({
                title: ' ',
                pid:pid,
            },resultList));
            res.render('order/material/material_type_creThree',returnData);
        });
       // res.render('order/material/material_type_creThree');
    },
    materialTypeChagOnePage: function (req, res) {
        res.render('order/material/material_type_chagOne');
    },
    materialTypeChagTwoPage: function (req, res) {
        res.render('order/material/material_type_chagTwo');
    },
    materialTypeChagThreePage: function (req, res) {
        res.render('order/material/material_type_chagThree');
    },
    materialTypeCreOneDo: function (req, res) {
       // console.log('新建物料一级分类'+ JSON.stringify(req.body));
        request(Base.mergeRequestOptions({
            method: 'post',
            url: '/api/categories',
            form: req.body,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                res.redirect("/materialManage/materialType");
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })

    },
    materialTypeCreTwoDo: function (req, res) {
         console.log('新建物料一级分类'+ JSON.stringify(req.body));
        request(Base.mergeRequestOptions({
            method: 'post',
            url: '/api/categories',
            form: req.body,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                res.redirect("/materialManage/materialType");
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })

    },
    materialTypeCreThreeDo: function (req, res) {
        console.log('新建物料一级分类'+ JSON.stringify(req.body));
        request(Base.mergeRequestOptions({
            method: 'post',
            url: '/api/categories',
            form: req.body,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                res.redirect("/materialManage/materialType");
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })

    },
};

module.exports = MaterialTypeController;

