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
        res.render('order/material/material_index');
    },
    detailPage: function (req, res) {
    res.render('order/material/material_detail');
    },
    summaryPage: function (req, res) {
        res.render('order/material/material_summary');
    },
    materialTypePage: function (req, res) {
        res.render('order/material/material_type');
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
    materialCreatePage: function (req, res) {
        res.render('order/material/material_create');
    },
    materialModifyPage: function (req, res) {
        res.render('order/material/material_modify');
    },
    doCreate: function (req, res) {
        console.log('物料创建'+ JSON.stringify(req.body));
    },
    materialAttributePage:function (req, res) {
        var paramObject = helper.genPaginationQuery(req);
        Base.multiDataRequest(req, res, [
            {url: '/api/attributes?'+ queryString.stringify(req.query), method: 'GET', resConfig: {keyName: 'attributeList', is_must: true}}
        ], function (req, res, resultList) {

            var paginationInfo =  resultList.attributeList;

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
        res.render('order/material/material_attribute',returnData);
        });
    },
    attrCreate: function (req, res) {
        //console.log('增加物料属性'+ JSON.stringify(req.body));
        request(Base.mergeRequestOptions({
            method: 'post',
            url: '/api/attributes',
            form: req.body,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                res.redirect("/materialManage/materialAttribute");
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })
    },
    attrChange: function (req, res) {
        //console.log('修改物料属性'+ JSON.stringify(req.body));
        var mid = req.body.storeId;
        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/stores/' + cid + "?" + queryString.stringify(req.body),
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                res.redirect("/materialManage/materialAttribute");
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })

    },
    setAttrStatus: function (req, res) {
        var cid = req.params.aid;
        var type = req.params.type;
        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/attributes/stcode/'+cid+'?stcode='+type,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                res.sendStatus(200);
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })

    },
    mateAttrDetailPage: function (req, res) {
       /*  var mid =  req.params.mid;
         Base.multiDataRequest(req, res, [
         {url: '/api/attributes/'+mid, method: 'GET', resConfig: {keyName: 'attributeDetail', is_must: true}},
         ], function (req, res, resultList) {

         var returnData = Base.mergeData(helper.mergeObject({
         title: ' ',
         },resultList));
             res.render('order/material/material_attribute_detail',returnData);
         });*/
        res.render('order/material/material_attribute_detail');
    },
    attrValCreate: function (req, res) {
        //console.log('增加物料的属性值'+ JSON.stringify(req.body));
        request(Base.mergeRequestOptions({
            method: 'post',
            url: '/api/attributes/value',
            form: req.body,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                res.redirect("/materialManage/materialAttribute");
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })
    },
};

module.exports = MaterialController;

