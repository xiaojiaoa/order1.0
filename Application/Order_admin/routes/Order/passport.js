/**
 * Created by fangjiahui on 16/12/15.
 */
var express = require('express');
var router = express.Router();


var PassportController = require('./Controller/PassportController');

// 获取登录页面
router.get('/login', PassportController.loginPage);

// 登录系统
router.post('/login', PassportController.doLogin);

// 退出登陆
router.get('/logout', PassportController.doLogout);


// 获取登录验证信息
router.get('/validateInfo', PassportController.getLoginValidate);


var ProxyController = require('./Controller/ProxyController');

///* Proxy Request 统一代理请求 测试用 */
router.all('/common/*', ProxyController.commonProxy);


//增加数据获取代理方式
//先从REDIS中获取,获取失败再调用代理去获取


module.exports = router;