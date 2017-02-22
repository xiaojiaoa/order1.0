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


var SupplierController = {
    supplierPage: function (req, res) {
        res.render('order/supplier/index');
    },
    supplierSortPage: function (req, res) {
        res.render('order/supplier/sort');
    },
    supplierDetailPage: function (req, res) {
        res.render('order/supplier/detail');
    },
    supplierCreatPage: function (req, res) {
        res.render('order/supplier/creat');
    },
    supplierModifyPage: function (req, res) {
        res.render('order/supplier/modify');
    },
    supplierSortCreatPage: function (req, res) {
        res.render('order/supplier/sort_creat');
    },
    supplierOfferProductPage: function (req, res) {
        res.render('order/supplier/offer_product');
    },
    supplierSortModifyPage: function (req, res) {
        res.render('order/supplier/sort_modify');
    },
};

module.exports = SupplierController;