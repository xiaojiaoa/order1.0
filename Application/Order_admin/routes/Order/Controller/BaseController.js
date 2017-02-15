//基础控制器

//站点全局配置
var globalConfig = require('../config/global');

var _ = require('lodash');

//求请处理
var request = require('request');

var helper = require('../config/helper');

var BaseController = {

    //合并站点配置
    mergeData: (data)=> {
        return helper.mergeObject(globalConfig.site, data);
    },

    //请求服务器配置以及共用请求头配置
    mergeRequestOptions: function (options, req, res) {

        if (options.host) {
            options.url = (options.https ? 'https://' : 'http://') + options.host + (options.port ? ":" + options.port : '') + options.url;
        } else {
            var remote_address = globalConfig.server.Order.remote_server();
            options.url = remote_address + options.url;
        }


        //添加请求token验证信息
        if (req.session.auth) {

            //TODO 打印TOKEN
            // console.log(req.session.auth.access_token);

            options.headers = {
                'access_token': req.session.auth.access_token
            };
        }

        return helper.mergeObject({
            method: 'GET',
            timeout: 2000
        }, options);
    },

    //处理错误
    handlerError: function (res, req, error, response, body) {
        //console.log('Error:');
        //console.log(response);

        var user_session = req.session;

        //返回错误信息
        var returnInfo = function (status, code, msg, redirect) {
            if (req.xhr) {
                res.status(500).send({code: code, msg: msg});
            } else {
                res.redirect(redirect || 'back');
            }
        };


        //检查是否可以解析出错误
        try {
            var $res = JSON.parse(response.body);
        } catch (e) {

            if (user_session) {
                user_session.DWY_message = {
                    type: 'error',
                    msg: '服务器错误',
                    sign: parseInt(Math.random() * 1000),
                };

                //如果有请求参数,参数放入到 DWY_last_request_param 结合入口文件使用
                if (user_session) {
                    user_session.DWY_last_request_param = _.isEmpty(req.body) ? _.isEmpty(req.query) ? "" : req.query  : req.body;
                }
            }

            returnInfo(500, '500', '服务器错误');
            return;
        }

        //错误信息放入session 结合入口文件使用
        if (user_session) {
            user_session.DWY_message = {
                type: 'error',
                msg: $res.msg,
                sign: parseInt(Math.random() * 1000),
            };
        }

        //如果有请求参数,参数放入到 DWY_last_request_param 结合入口文件使用
        if (user_session) {
            user_session.DWY_last_request_param = _.isEmpty(req.body) ? _.isEmpty(req.query) ? "" : req.query  : req.body;
        }

        //根据错误代码做对应处理
        switch ($res.code.toString()) {
            case '1015':
            case '1016':
                returnInfo(500, $res.code, $res.msg, '/login');
                break;
            default:
                returnInfo(500, $res.code, $res.msg);
        }
    },

    //多请求处理
    multiDataRequest: function (req, res, urls, callBack) {

        var count = 0;

        var resultLength = urls.length;

        var resultList = {};

        //是否出现失败请求
        var is_fail = false;

        urls.forEach(function (element, index, array) {
            request(BaseController.mergeRequestOptions(element, req, res), function (error, response, body) {

                if (is_fail == true) {
                    return;
                }

                count++;

                console.log('Expect to be ' + resultLength + ', Already got ' + count + '.');

                if (!BaseController._checkResponseStatus(error, response)) {
                    count--;
                    is_fail = true;

                    BaseController.handlerError(res, req, error, response, body);

                    //console.log('Error:');
                    //console.log(response);
                    //
                    //if (!response) {
                    //    res.status(500).send('没有收到服务器回复');
                    //    return;
                    //}
                    //
                    //var $res = JSON.parse(response.body);
                    //switch ($res.code.toString()) {
                    //    case '1015':
                    //        res.redirect('/login');
                    //        break;
                    //    case '1016':
                    //        res.redirect('/login');
                    //        break;
                    //    default:
                    //        res.status(404).send($res);
                    //}
                    return;
                }

                resultList[response.request.resConfig.keyName] = body ? JSON.parse(body) : '';

                if (count != resultLength) {

                } else {
                    //console.log('CallResult:');
                    //console.log(resultList);

                    //回调处理
                    callBack(req, res, resultList);
                }
            })
        });
    },

    //检查请求状态
    _checkResponseStatus: function (error, response) {
        return !!(!error && response.statusCode == 200);
    }
};


module.exports = BaseController;