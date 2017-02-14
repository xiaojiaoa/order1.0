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
router.get('/order/detail/:tid', Middleware.AuthCheck, OrderController.detailPage);

// 补单页面
router.get('/orders/resupplys', Middleware.AuthCheck, Middleware.FilterEmptyField, OrderController.resupplyPage);

// 补单受理页面
router.get('/orders/resupplys/accept', Middleware.AuthCheck, Middleware.FilterEmptyField, OrderController.acceptPage);

// 补单拆单页面
router.get('/orders/resupplys/tears', Middleware.AuthCheck, Middleware.FilterEmptyField, OrderController.tearsPage);


// 补单详情页面   补单信息（已完成）
router.get('/order/resupply/detail/:tid/:pid', Middleware.AuthCheck, OrderController.resupplyDetailPage);


//  订单审核页面
router.get('/order/check', Middleware.AuthCheck, OrderController.checkPage);

//  订单流程记录页面
router.get('/order/process', Middleware.AuthCheck, OrderController.processPage);

//  订单许可页面
router.get('/order/permit', Middleware.AuthCheck, OrderController.permitPage);

// 订单排料页面
router.get('/orders/nesting', Middleware.AuthCheck, OrderController.nestingPage);

// 订单包装页面
router.get('/orders/package', Middleware.AuthCheck, OrderController.packagePage);


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
 * 页面范围: 门店管理
 * 控制器:   SroresController
 * */
var StoresController = require('./Controller/StoresController');

// 门店管理页面
router.get('/storesManage', Middleware.AuthCheck, Middleware.FilterEmptyField, StoresController.listPage);

// 门店详情页面
router.get('/storesManage/detail/:cid', Middleware.AuthCheck, StoresController.detailPage);

// 新建门店页面
router.get('/storesManage/create', Middleware.AuthCheck, StoresController.createPage);

// 新建门店
router.post('/storesManage/doCreate', Middleware.AuthCheck, StoresController.doCreate);

// 修改门店页面
router.get('/storesManage/modify/:cid', Middleware.AuthCheck, StoresController.modifyPage);

// 修改门店
router.post('/storesManage/doModify', Middleware.AuthCheck, StoresController.doModify);


/*
 * 页面范围: 机构相关
 * 控制器:   AgencyController
 * */

var AgencyController = require('./Controller/AgencyController');

// 获取机构信息
router.get('/agency', Middleware.AuthCheck, Middleware.FilterEmptyField, AgencyController.listPage);

// 机构详情页面
router.get('/agency/detail/:cid', Middleware.AuthCheck, AgencyController.detailPage);

// 新建门店页面
router.get('/agency/create', Middleware.AuthCheck, AgencyController.createPage);

// 新增机构
router.post('/agency/doCreate', Middleware.AuthCheck, AgencyController.doCreate);

// 修改机构页面
router.get('/agency/modify/:cid', Middleware.AuthCheck, AgencyController.modifyPage);

// 修改机构信息
router.post('/agency/doModify', Middleware.AuthCheck, AgencyController.doModify);

// 禁用机构
router.delete('/agency/doDelete/:id', Middleware.AuthCheck, AgencyController.doDelete);



/*
 * 页面范围: 部门相关
 * 控制器:   DepartmentController
 * */

var DepartmentController = require('./Controller/DepartmentController');

// 获取部门信息
router.get('/department/:bid', Middleware.AuthCheck, Middleware.FilterEmptyField, DepartmentController.listPage);

// 新增门店部门
router.post('/department/doCreate', Middleware.AuthCheck, DepartmentController.doCreate);

// 更新部门信息
router.post('/department/doModify', Middleware.AuthCheck, DepartmentController.doModify);

// 删除部门
router.delete('/department/doDelete/:id', Middleware.AuthCheck, DepartmentController.doDelete);




/*
 * 页面范围: 角色相关
 * 控制器:   RolesController
 * */

var RolesController = require('./Controller/RolesController');

// 获取角色信息
router.get('/roles/:bid/:scope', Middleware.AuthCheck, Middleware.FilterEmptyField, RolesController.listPage);

// 新增角色页面
router.get('/roles/create/:bid/:scope/:type', Middleware.AuthCheck, RolesController.createPage);

// 新增角色
router.post('/roles/doCreate', Middleware.AuthCheck, RolesController.doCreate);

// 更新角色页面
router.get('/roles/modify', Middleware.AuthCheck, RolesController.modifyPage);

// 更新角色
router.post('/roles/doModify', Middleware.AuthCheck, RolesController.doModify);



// 更新自定义角色页面
router.get('/roles/modifyDiy', Middleware.AuthCheck, RolesController.modifyDiyPage);

// 更新自定义角色
router.post('/roles/doDiyModify', Middleware.AuthCheck, RolesController.doDiyModify);

// 删除部门
router.delete('/roles/doDelete', Middleware.AuthCheck, RolesController.doDelete);


/*
 * 页面范围: 任务序列相关
 * 控制器:   TaskseqController
 * */
var TaskseqController = require('./Controller/TaskseqController');

// 流水详情
router.get('/taskseq/index/:lid', Middleware.AuthCheck, TaskseqController.indexPage);


/*
 * 页面范围: 文件上传相关
 * 控制器:   FileController
 * */
var FileController = require('./Controller/FileController');

// 新增文件上传地址
router.get('/file/create/:lid/:type', Middleware.AuthCheck, FileController.createPage);

// 新增文件上传地址
router.get('/file/order/create/:lid/:type/:tid', Middleware.AuthCheck, FileController.createOrderFilePage);
// router.get('/file/order/create/:lid/:stcode/:tid/:type', Middleware.AuthCheck, FileController.createOrderFilePage);

// 显示所有效果图
router.get('/file/pic/:lid', Middleware.AuthCheck, FileController.picPage);

//
router.get('/file/order/detail/:lid', Middleware.AuthCheck, FileController.orderFileDetail);

// 新增上传文件
router.post('/file/doCreate', Middleware.AuthCheck, FileController.doCreate);

// 新增订单文件上传
router.post('/file/order/doCreate', Middleware.AuthCheck, FileController.doCreateOrderFile);

// 删除上传文件
router.delete('/file/doDelete/:id', Middleware.AuthCheck, FileController.doDelete);

// 删除订单上传文件
router.delete('/file/order/doDelete/:id', Middleware.AuthCheck, FileController.doDeleteOrderFile);



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