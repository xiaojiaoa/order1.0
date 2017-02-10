/**
 * Created by fangjiahui on 16/12/15.
 *
 */


var express = require('express');


//for multipart form data
var multer = require('multer');

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, __dirname + '/../../public/uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname.toLowerCase())
    }
});
var upload = multer({storage: storage});
// var upload = multer({dest: 'uploads/'});

var _ = require('lodash');

var router = express.Router();


var Base = require('./Controller/BaseController');

var helper = require('./config/helper');

var request = require('request');
/*
 * 中间件
 * */
var Middleware = {
    //检测SESSION 是否存在TOKEN (NODE),TODO 区分AJAX请求,以JSON格式返回
    AuthCheck: function (req, res, next) {
        if (!req.session.auth) {
            console.log('SESSION HAS NO AUTH');
            res.redirect('/login');
        } else {
            //增加token失效验证. token存在但过期时,自动发送refresh_token并保存新的token到用户session
            var user_auth = req.session.auth;

            if ((new Date().getTime() - user_auth.time) > 1600000) {

                //refresh_token request
                request(Base.mergeRequestOptions({
                    method: 'POST',
                    url: '/api/refresh',
                    form: {refreshToken: user_auth.refresh_token}
                }, req, res), function (error, response, body) {
                    if (!error && response.statusCode == 201) {
                        // Show the HTML for the Google homepage.
                        let $data = JSON.parse(body);
                        console.log(JSON.stringify($data));

                        //TOKEN 存入session
                        var user_session = req.session;
                        user_session.auth = {
                            access_token: $data.userTokenString,
                            refresh_token: $data.refreshTokenString,
                            time: new Date().getTime(),
                        };

                        next();
                    } else {
                        res.redirect('/login');
                    }
                })
            } else {
                next();
            }
        }
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

// 订单详情页面   订单信息（认领订单）
// router.get('/order/detail/:tid', Middleware.AuthCheck, OrderController.detailPage);
router.get('/order/detail', Middleware.AuthCheck, OrderController.detailPage);

// 补单页面
router.get('/orders/resupplys', Middleware.AuthCheck, Middleware.FilterEmptyField, OrderController.resupplyPage);

// 补单受理页面
router.get('/orders/resupplys/accept', Middleware.AuthCheck, Middleware.FilterEmptyField, OrderController.acceptPage);

// 补单拆单页面
router.get('/orders/resupplys/tears', Middleware.AuthCheck, Middleware.FilterEmptyField, OrderController.tearsPage);


// 补单详情页面   补单信息（已完成）
router.get('/order/resupply/detail', Middleware.AuthCheck, OrderController.resupplyDetailPage);


//  订单审核页面
router.get('/order/check', Middleware.AuthCheck, OrderController.checkPage);

//  订单流程记录页面
router.get('/order/process', Middleware.AuthCheck, OrderController.processPage);

//  订单许可页面
router.get('/order/permit', Middleware.AuthCheck, OrderController.permitPage);


/*
 * 页面范围: 拆单
 * 控制器:   TearController
 * */
var TearController = require('./Controller/TearController');

// 拆单页面
router.get('/tears', Middleware.AuthCheck, Middleware.FilterEmptyField, TearController.listPage);

// 拆单审核页面
router.get('/tears/check', Middleware.AuthCheck, Middleware.FilterEmptyField, TearController.checkPage);



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