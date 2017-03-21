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
var InstallserviceController = {
    installServicePage: function (req, res) {
            var paramObject = helper.genPaginationQuery(req);
            Base.multiDataRequest(req, res, [
                {url: '/api/tasks/install?'+queryString.stringify(req.query), method: 'GET', resConfig: {keyName: 'installServiceList', is_must: true}},
                {url: '/api/stores/departments/installDepartments', method: 'GET', resConfig: {keyName: 'installGroup', is_must: true}},
            ], function (req, res, resultList) {
                var paginationInfo =  resultList.installServiceList;
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
                res.render('order/installService/index',returnData);
            });
        },
    getTask: function (req, res) {
        var tid = req.params.tid;
        var did = req.params.did;
        req.body.tid =tid;
        req.body.did =did;
        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/tasks/install/getTask?'+queryString.stringify(req.body),
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                res.redirect("/installService");
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })
    },
    registerDeliver: function (req, res) {
        var tid = req.params.tid;
        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/tasks/install/registerDeliver/'+tid,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                res.sendStatus(200);
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })
    },

};
module.exports = InstallserviceController;

