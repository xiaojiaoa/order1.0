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


var PurchaseController = {
    purchasePage: function (req, res) {
        res.render('order/purchase/index');
    },
    purchaseApplyCreatPage: function (req, res) {
        res.render('order/purchase/apply_creat');
    },
    purchaseApplyDetailPage: function (req, res) {
        res.render('order/purchase/apply_detail');
    },
    purchaseDetailPage: function (req, res) {
        res.render('order/purchase/detail');
    },
    purchaseOrderDetailPage: function (req, res) {
        res.render('order/purchase/order_detail');
    },

};

module.exports = PurchaseController;