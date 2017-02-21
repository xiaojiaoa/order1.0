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
};

module.exports = MaterialController;

