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


var CustomerProductController = {
    customerProPage: function (req, res) {
            res.render('order/product/index_unselect');

    },
    customerProListPage: function (req, res) {
        // console.log("查询路径是什么", '/api/orders/completeSet?'+queryString.stringify(req.query));
        Base.multiDataRequest(req, res, [
            {url: '/api/orders/completeSet?'+queryString.stringify(req.query), method: 'GET', resConfig: {keyName: 'completeSetList', is_must: true}},
        ], function (req, res, resultList) {

            // console.log(5555,resultList.completeSetList);
            var returnData = Base.mergeData(helper.mergeObject({
                title: '',
                Permission :Permissions,
            }, resultList));

            res.render('order/product/index', returnData);

        });
    },

};

module.exports = CustomerProductController;

