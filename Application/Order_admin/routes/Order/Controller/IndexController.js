//请求代理控制器
var Base = require('./BaseController');

var helper = require('../config/helper');

var request = require('request');


var IndexController = {

    indexPage: function (req, res) {
        res.render('order/index', Base.mergeData(helper.mergeObject({title: '订单登录系统'}, {})));
    }
};

module.exports = IndexController;

