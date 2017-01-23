/**
 * Created by fangjiahui on 16/12/15.
 *
 */


var express = require('express');


//for multipart form data
var multer = require('multer');
var upload = multer({dest: 'uploads/'});

var _ = require('lodash');

var router = express.Router();

/*
 * 中间件
 * */
var Middleware = {
    //检测SESSION 是否存在TOKEN (NODE),TODO 区分AJAX请求,以JSON格式返回
    AuthCheck: function (req, res, next) {
        if (!req.session.auth) {
            console.log('SESSION HAS NO AUTH');
            res.redirect('/login');
            return;
        }
        next();
    },
    //过滤去掉空字段
    FilterEmptyField: function (req, res, next) {

        _.each({body: req.body, query: req.query}, function (value, key) {
            if (!_.isEmpty(value)) {
                for (var i in req[key]) {
                    if (req[key][i] === "") {
                        delete req[key][i];
                    }
                }
            }
        });

        next();
    }
};

/*
 * 页面范围: 首页相关
 * 控制器:   IndexController
 * */
var IndexController = require('./Controller/IndexController');

// 首页页面
router.get('/', Middleware.AuthCheck, IndexController.indexPage);

/*
 * 页面范围: 客户相关
 * 控制器:   CustomerController
 * */
var CustomerController = require('./Controller/CustomerController');

// 获取客户列表
router.get('/customers', Middleware.AuthCheck, Middleware.FilterEmptyField, CustomerController.listPage);

// 获取客户详情页面
router.get('/customer/detail', Middleware.AuthCheck, CustomerController.detailPage);
// router.get('/customer/detail/:cid', Middleware.AuthCheck, CustomerController.detailPage);

/*
 * 页面范围: 订单相关
 * 控制器:   OrderController
 * */
var OrderController = require('./Controller/OrderController');

// 订单页面
router.get('/orders', Middleware.AuthCheck, Middleware.FilterEmptyField, OrderController.listPage);

// 订单详情页面
// router.get('/order/detail/:tid', Middleware.AuthCheck, OrderController.detailPage);
router.get('/order/detail', Middleware.AuthCheck, OrderController.detailPage);

// 补单详情页面
// router.get('/order/resupply/detail/:tid/:pid', Middleware.AuthCheck, OrderController.resupplyDetailPage);


/*
 * 页面范围: 任务序列相关
 * 控制器:   TaskseqController
 * */
var TaskseqController = require('./Controller/TaskseqController');

// 流水详情
router.get('/taskseq/index', Middleware.AuthCheck, TaskseqController.indexPage);


/*
 * 页面范围: *模板相关-参考用
 * 控制器:   TemplateController
 * */
var TemplateController = require('./Controller/TemplateController');

router.get('/template', TemplateController.createPage);

//单文件上传
router.post('/template/upload/single', [upload.single('file_name'), Middleware.FilterEmptyField], TemplateController.doSingleUpload);

//文件组上传
router.post('/template/upload/multi', upload.array('file_name'), TemplateController.doMultiUpload);

//自定义上传
router.post('/template/upload/custom', upload.fields([{name: 'file_name', maxCount: 2},
    {name: 'file_name2', maxCount: 1}]), TemplateController.doCustomUpload);

//任意文件组上传
router.post('/template/upload/any', upload.any(), TemplateController.doAnyUpload);

//级联请求统一处理 /cascade/api/areas
router.get('/cascade/*', TemplateController.getData);


module.exports = router;