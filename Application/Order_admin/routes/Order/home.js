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
 * 页面范围: 用户操作相关
 * 控制器:   UserController
 * */
var UserController = require('./Controller/UserController');

router.get('/userCenter', Middleware.AuthCheck, UserController.indexPage);

// 修改密码页面
router.get('/user/setPassword', Middleware.AuthCheck, UserController.passwordPage);

// 修改密码
router.post('/user/doPassword', Middleware.AuthCheck, UserController.doPassword);



/*
 * 页面范围: 客户相关
 * 控制器:   CustomerController
 * */
var CustomerController = require('./Controller/CustomerController');

// 获取客户列表
router.get('/customers', Middleware.AuthCheck, Middleware.FilterEmptyField, CustomerController.listPage);

// 获取客户详情页面
router.get('/customer/detail/:cid', Middleware.AuthCheck, CustomerController.detailPage);
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

// 标记为审核中
router.post('/orders/getTask/:tid', Middleware.AuthCheck, OrderController.getTask);
// 解锁订单
router.post('/orders/unlock/:tid', Middleware.AuthCheck, OrderController.doUnlock);

// 审核未通过（退单）
router.post('/orders/notPass', Middleware.AuthCheck, OrderController.notPass);
// 审核通过
router.post('/orders/doPass', Middleware.AuthCheck, OrderController.doPass);
// 设置难度等级
router.post('/orders/updateDifficultyLevel', Middleware.AuthCheck, OrderController.updateDifficultyLevel);



// 补单页面
router.get('/orders/resupplys', Middleware.AuthCheck, Middleware.FilterEmptyField, OrderController.resupplyPage);

// 补单受理页面
router.get('/orders/resupplys/accept', Middleware.AuthCheck, Middleware.FilterEmptyField, OrderController.acceptPage);

// 补单拆单页面
router.get('/orders/resupplys/apart', Middleware.AuthCheck, Middleware.FilterEmptyField, OrderController.apartPage);


// 补单详情页面   补单信息（已完成）
router.get('/order/resupply/detail', Middleware.AuthCheck, OrderController.resupplyDetailPage);


//  订单审核页面
router.get('/order/check/:type', Middleware.AuthCheck, OrderController.checkPage);

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
var ApartController = require('./Controller/ApartController');

// 拆单页面
router.get('/apart', Middleware.AuthCheck, Middleware.FilterEmptyField, ApartController.listPage);

// 拆单审核页面
router.get('/apart/check', Middleware.AuthCheck, Middleware.FilterEmptyField, ApartController.checkPage);

// 标记为审核中 (待拆单)
router.post('/apart/getTask/:tid', Middleware.AuthCheck, ApartController.getTask);
// 解锁订单
router.post('/apart/unlock/:tid', Middleware.AuthCheck, ApartController.doUnlock);

// 审核未通过（退单）
router.post('/apart/notPass', Middleware.AuthCheck, ApartController.notPass);
// 审核通过
router.post('/apart/doPass/:tid', Middleware.AuthCheck, ApartController.doPass);


// 标记为审核中 (待拆单审核)
router.post('/apartCheck/getTask/:tid', Middleware.AuthCheck, ApartController.getTaskCheck);
// 解锁订单
router.post('/apartCheck/unlock/:tid', Middleware.AuthCheck, ApartController.doUnlockCheck);

// 审核未通过（退单）
router.post('/apartCheck/notPass', Middleware.AuthCheck, ApartController.notPassCheck);
// 审核通过
router.post('/apartCheck/doPass/:tid', Middleware.AuthCheck, ApartController.doPassCheck);



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

// 禁用/解锁 门店
router.put('/storesManage/setStatus/:cid/:type', Middleware.AuthCheck, StoresController.setStatus);


/*
 * 页面范围: 物料管理相关
 * 控制器:   MaterialController
 * */
var  MaterialController = require('./Controller/MaterialController');

// 物料管理首页
router.get('/materialManage', Middleware.AuthCheck, MaterialController.indexPage);

// 物料详情页面
router.get('/materialManage/detail/:mid', Middleware.AuthCheck, MaterialController.detailPage);

// 物料出入库总计页面
router.get('/materialManage/summary', Middleware.AuthCheck, MaterialController.summaryPage);

//物料分类页面
router.get('/materialManage/materialType', Middleware.AuthCheck, MaterialController.materialTypePage);

//物料分类-新建一级分类页面
router.get('/materialManage/materialType/creOne', Middleware.AuthCheck, MaterialController.materialTypeCreOnePage);

//物料分类-新建二级分类页面
router.get('/materialManage/materialType/creTwo', Middleware.AuthCheck, MaterialController.materialTypeCreTwoPage);

//物料分类-新建三级分类页面
router.get('/materialManage/materialType/creThree', Middleware.AuthCheck, MaterialController.materialTypeCreThreePage);

//物料分类-修改一级分类页面
router.get('/materialManage/materialType/chagOne/:co', Middleware.AuthCheck, MaterialController.materialTypeChagOnePage);

//物料分类-修改二级分类页面
router.get('/materialManage/materialType/chagTwo/:cs', Middleware.AuthCheck, MaterialController.materialTypeChagTwoPage);

//物料分类-修改三级分类页面
router.get('/materialManage/materialType/chagThree/:ct', Middleware.AuthCheck, MaterialController.materialTypeChagThreePage);

//物料新建页面
router.get('/materialManage/material/create', Middleware.AuthCheck, MaterialController.materialCreatePage);

// 新建物料
router.post('/materialManage/material/doCreate', Middleware.AuthCheck, MaterialController.doCreate);

//物料修改页面
router.get('/materialManage/material/modify', Middleware.AuthCheck, MaterialController.materialModifyPage);

//物料属性页面
router.get('/materialManage/materialAttribute', Middleware.AuthCheck, MaterialController.materialAttributePage);

//增加物料属性接口
router.post('/material/attrCreate', Middleware.AuthCheck, MaterialController.attrCreate);

//修改物料属性接口
router.post('/material/attrChange', Middleware.AuthCheck, MaterialController.attrChange);

//物料属性详情页面
router.get('/materialManage/mateAttri/detail/:mid', Middleware.AuthCheck, MaterialController.mateAttriDetailPage);


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

// 禁用/解锁 机构
router.put('/agency/setStatus/:cid/:type', Middleware.AuthCheck, AgencyController.setStatus);



/*
 * 页面范围: 部门相关
 * 控制器:   DepartmentController
 * */

var DepartmentController = require('./Controller/DepartmentController');

// 获取某个 角色/机构 部门信息
router.get('/department/:type/:bid', Middleware.AuthCheck, Middleware.FilterEmptyField, DepartmentController.listPage);


// 新增门店部门
router.post('/department/doCreate', Middleware.AuthCheck, DepartmentController.doCreate);

// 更新部门信息
router.post('/department/doModify', Middleware.AuthCheck, DepartmentController.doModify);

// 删除部门
router.delete('/department/doDelete/:type/:id', Middleware.AuthCheck, DepartmentController.doDelete);




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
router.get('/roles/modify/:bid/:scope/:stcode', Middleware.AuthCheck, RolesController.modifyPage);

// 更新角色
router.post('/roles/doModify', Middleware.AuthCheck, RolesController.doModify);

// 删除角色
router.put('/roles/setStatus/:stcode', Middleware.AuthCheck, RolesController.setStatus);



/*
 * 页面范围: 员工相关
 * 控制器:   EmployeeController
 * */
var EmployeeController = require('./Controller/EmployeeController');

// 获取门店下的员工信息
router.get('/:type/employees', Middleware.AuthCheck, Middleware.FilterEmptyField, EmployeeController.listPage);

// 员工详情页面
router.get('/:type/employees/detail/:bid/:cid', Middleware.AuthCheck, EmployeeController.detailPage);
// router.get('/getEmployeesByMobile/:mobile', Middleware.AuthCheck, EmployeeController.ifHaved);

// 新增员工页面
router.get('/:type/employees/create/:bid', Middleware.AuthCheck, Middleware.FilterEmptyField, EmployeeController.createPage);

// 新增员工
router.post('/employees/doCreate', Middleware.AuthCheck, EmployeeController.doCreate);

// 修改员工详情页面
router.get('/:type/employees/modify/:bid/:cid', Middleware.AuthCheck, EmployeeController.modifyPage);

// 修改员工信息
router.post('/employees/doModify', Middleware.AuthCheck, EmployeeController.doModify);

// 重置员工密码
router.put('/:type/employees/resetPassword/:cid', Middleware.AuthCheck, EmployeeController.resetPassword);

// 关闭/解锁 员工账号
router.put('/:bidtype/employees/setStatus/:cid/:type', Middleware.AuthCheck, EmployeeController.setStatus);




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



/*
 * 页面范围: 供应商相关
 * 控制器:   supplierController
 * */
var supplierController = require('./Controller/supplierController');

// 供应商详情
router.get('/supplier', Middleware.AuthCheck,supplierController.supplierPage);
//供应商分类
router.get('/supplier/sort', Middleware.AuthCheck,supplierController.supplierSortPage);
//供应商分类
router.get('/supplier/create', Middleware.AuthCheck,supplierController.supplierCreatPage);
//供应商分类
router.get('/supplier/sort_create', Middleware.AuthCheck,supplierController.supplierSortCreatPage);

/*
 * 页面范围: 网络预约相关
 * 控制器:   networkBookController
 * */
var NetworkBookController = require('./Controller/NetworkBookController');

// 流水详情
router.get('/networkBook', Middleware.AuthCheck, NetworkBookController.indexPage);

// 分配门店创建量尺任务
router.post('/networkBook/doMeasure', Middleware.AuthCheck, NetworkBookController.doMeasure);



module.exports = router;