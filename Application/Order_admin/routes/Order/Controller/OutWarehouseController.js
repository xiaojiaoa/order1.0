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


var OutWarehouseController = {

    waitSendPage: function (req, res) {
        res.render('order/shipments/wait_send');

    },
    deliveryNotePage: function (req, res) {
        res.render('order/shipments/deliver_note');

    },
    deliveryNoteDeatil: function (req, res) {
        res.render('order/enter/deliver_detail');

    },
    outMaterialPage: function (req, res) {
        res.render('order/enter/out_material');

    },
    outMaterialDeatil: function (req, res) {
        res.render('order/enter/out_material_detail');

    },
    canSendPage: function (req, res) {
        res.render('order/enter/can_send');

    },
    outProductPage: function (req, res) {
        res.render('order/enter/out_product');

    },
    outProductDeatil: function (req, res) {
        res.render('order/enter/out_product_detail');

    },
    outBredPage: function (req, res) {
        res.render('order/enter/out_bred');

    },
    outBredDeatil: function (req, res) {
        res.render('order/enter/out_bred_detail');

    },


};

module.exports = OutWarehouseController;

