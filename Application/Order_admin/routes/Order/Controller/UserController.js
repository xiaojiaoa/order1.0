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


var UserController = {
    indexPage: function (req, res) {

        var returnData = Base.mergeData(helper.mergeObject(
            {
                title: '个人中心',
            },
            //Customize Data
            {}
        ));


        res.render('order/user/index', returnData);

    }
};

module.exports = UserController;

