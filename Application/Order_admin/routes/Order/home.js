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
 * 页面范围: 订单相关
 * 控制器:   OrderController
 * */
var OrderController = require('./Controller/OrderController');

// 订单页面
router.get('/orders', Middleware.AuthCheck,Middleware.FilterEmptyField, OrderController.listPage);

// 补单页面
router.get('/orders/resupplys', Middleware.AuthCheck, OrderController.resupplyPage);


/*
 * 页面范围: 员工相关
 * 控制器:   EmployeeController
 * */
var EmployeeController = require('./Controller/EmployeeController');

// 获取员工信息
router.get('/employees', Middleware.AuthCheck,Middleware.FilterEmptyField, EmployeeController.listPage);


/*
 * 页面范围: 客户相关
 * 控制器:   CustomerController
 * */
var CustomerController = require('./Controller/CustomerController');

// 获取客户信息
router.get('/customers', Middleware.AuthCheck,Middleware.FilterEmptyField, CustomerController.listPage);

// 获取新增客户页面
router.get('/customer/create/:type?', Middleware.AuthCheck, CustomerController.createPage);

router.post('/customer/create', Middleware.AuthCheck, CustomerController.doCreate);


/*
 * 页面范围: 用户操作相关
 * 控制器:   UserController
 * */
var UserController = require('./Controller/UserController');

router.get('/userCenter', Middleware.AuthCheck, UserController.indexPage);


/*
 * 页面范围: 任务序列相关
 * 控制器:   TaskseqController
 * */
var TaskseqController = require('./Controller/TaskseqController');

// 获取登记流水记录
router.get('/taskseqs', Middleware.AuthCheck,Middleware.FilterEmptyField, TaskseqController.listPage);

// 取消流水页面
router.get('/taskseq/cancel/:lid', Middleware.AuthCheck, TaskseqController.cancelPage);

//流水新增空间页面
router.get('/taskseq/space/:lid', Middleware.AuthCheck, TaskseqController.spacePage);

//流水沟通登记页面
router.get('/taskseq/follow/:lid', Middleware.AuthCheck, TaskseqController.followPage);

//流水查房意见
router.get('/taskseq/wardround/:lid', Middleware.AuthCheck, TaskseqController.wardroundPage);

// 流水详情
router.get('/taskseq/index/:lid', Middleware.AuthCheck, TaskseqController.indexPage);

// 新增流水页面
router.get('/taskseq/create/:cid', Middleware.AuthCheck, TaskseqController.createPage);

// 新增流水
router.post('/taskseq/doCreate', Middleware.AuthCheck, TaskseqController.doCreate);

// 取消流水动作
router.post('/taskseq/doCancel', Middleware.AuthCheck, TaskseqController.doCancel);

// 沟通登记动作
router.post('/taskseq/doFollow', Middleware.AuthCheck, TaskseqController.doFollow);

// 新增空间动作
router.post('/taskseq/doSpace', Middleware.AuthCheck, TaskseqController.doSpace);

// 新增查房
router.post('/taskseq/doWardround', Middleware.AuthCheck, TaskseqController.doWardround);


/*
 * 页面范围: 合同相关
 * 控制器:   ContractController
 * */
var ContractController = require('./Controller/ContractController');

// 新增合同页面
router.get('/contract/create/:lid', Middleware.AuthCheck, ContractController.createPage);

//新增合同
router.post('/contract/doCreate', Middleware.AuthCheck, ContractController.doCreate);

/*
 * 页面范围: 量尺相关
 * 控制器:   ContractController
 * */
var MeasureController = require('./Controller/MeasureController');

// 新增量尺页面
router.get('/measure/create/:lid', Middleware.AuthCheck, MeasureController.createPage);

// 新增量尺
router.post('/measure/doCreate', Middleware.AuthCheck, MeasureController.doCreate);


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