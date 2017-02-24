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
  /*      var paramObject = helper.genPaginationQuery(req);
        Base.multiDataRequest(req, res, [
            {url: '/api/materials?'+ queryString.stringify(req.query), method: 'GET', resConfig: {keyName: 'mateList', is_must: true}}
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
        });*/
        res.render('order/material/material_index');
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
    materialCreatePage: function (req, res) {
        res.render('order/material/material_create');
    },
    materialModifyPage: function (req, res) {
        res.render('order/material/material_modify');
    },
    doCreate: function (req, res) {
        console.log('物料创建'+ JSON.stringify(req.body));
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

