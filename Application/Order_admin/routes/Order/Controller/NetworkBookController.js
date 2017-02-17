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


var NetworkBookController = {
    indexPage: function (req, res) {
        var paramObject = helper.genPaginationQuery(req);
        Base.multiDataRequest(req, res, [
            {url: '/api/tasks/measure', method: 'GET', resConfig: {keyName: 'measureList', is_must: true}},
        ], function (req, res, resultList) {

            var paginationInfo = resultList.measureList;

            var boostrapPaginator = new Pagination.TemplatePaginator(helper.genPageInfo({
                prelink: paramObject.withoutPageNo,
                current: paginationInfo.page,
                rowsPerPage: paginationInfo.pageSize,
                totalResult: paginationInfo.totalItems
            }));

            var returnData = Base.mergeData(helper.mergeObject({
                title: '预约列表',
                pagination: boostrapPaginator.render()
            }, resultList));

            res.render('order/networkBook/index', returnData);

        });
    },

};

module.exports = NetworkBookController;

