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


var TaskseqController = {

    indexPage: function (req, res) {

        var paramObject = helper.genPaginationQuery(req);
        Base.multiDataRequest(req, res, [
            {url: '/api/assist/taskseq/status', method: 'GET', resConfig: {keyName: 'statusInfo', is_must: false}}
        ], function (req, res, resultList) {
            var returnData = Base.mergeData(helper.mergeObject({
                title: ' ',
                // lid:lid,
                Permission :Permissions,
            }, resultList));

            res.render('order/taskseq/index', returnData);
        });
    },
    listPage: function (req, res) {

    var paramObject = helper.genPaginationQuery(req);
    Base.multiDataRequest(req, res, [
        {url: '/api/ebis/measure/page?'+ queryString.stringify(req.query), method: 'GET', resConfig: {keyName: 'taskseqList', is_must: true}},
        {url: '/api/assist/taskseq/status', method: 'GET', resConfig: {keyName: 'statusInfo', is_must: false}}
    ], function (req, res, resultList) {
        console.log('communicate','/api/tasks/measure?'+ queryString.stringify(req.query))
        console.log('communicate',JSON.stringify(resultList))

        var paginationInfo =  resultList.taskseqList;

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
        res.render('order/taskseqs', returnData);
    });
}

};

module.exports = TaskseqController;

