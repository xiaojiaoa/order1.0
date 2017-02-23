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
        res.render('order/material/material_type_creOne');
    },
    materialTypeCreTwoPage: function (req, res) {
        res.render('order/material/material_type_creTwo');
    },
    materialTypeCreThreePage: function (req, res) {
        res.render('order/material/material_type_creThree');
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
};

module.exports = MaterialTypeController;
