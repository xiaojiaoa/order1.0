/**
 * Created by fangjiahui on 16/12/15.
 *
 */


var express = require('express');
var RateLimit = require('express-rate-limit');


//  for multipart form data
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



// 把USER信息加入到全局
router.use(function (req, res, next) {
    // 登录用户信息
    res.locals.user = req.session.user;
    // 菜单信息
    res.locals.menu = req.session.menu;
    // 权限信息
    res.locals.permission = req.session.permission;
    // 请求本身
    res.locals.DWYRequest = req;
    next();
});

// 错误或者正确信息处理
router.use(function (req, res, next) {

    if (req.session.DWY_message) {
        res.locals.DWY_message = req.session.DWY_message;
        req.session.DWY_message = '';
    } else {
        res.locals.DWY_message = '';
    }

    next();
});

// 取回上一次错误提交时的请求参数
router.use(function (req, res, next) {
    if (req.session.DWY_last_request_param) {
        res.locals.DWY_last_request_param = req.session.DWY_last_request_param;
        req.session.DWY_last_request_param = '';
    } else {
        res.locals.DWY_last_request_param = '';
    }
    next();
});


var Base = require('./Controller/BaseController');

var helper = require('./config/helper');

var request = require('request');



/*
 * 中间件
 * */
var Middleware = {
    // 检测SESSION 是否存在TOKEN (NODE),TODO 区分AJAX请求,以JSON格式返回
    AuthCheck: function (req, res, next) {
        if(req.method.toLowerCase() == 'get'){
            // req.session.preventPath = req.path;
            req.session.preventPath = req.url;
        }
        if (!req.session.auth) {
            //console.log('SESSION HAS NO AUTH');
            res.redirect('/login');
        } else {
            // 增加token失效验证. token存在但过期时,自动发送refresh_token并保存新的token到用户session
            var user_auth = req.session.auth;
            if ((new Date().getTime() - user_auth.time) > 1600000) {

                // refresh_token request
                request(Base.mergeRequestOptions({
                    method: 'POST',
                    url: '/api/refresh',
                    form: {refreshToken: user_auth.refresh_token}
                }, req, res), function (error, response, body) {
                    if (!error && response.statusCode == 200) {
                        // Show the HTML for the Google homepage.
                        let $data = JSON.parse(body);

                        // TOKEN 存入session
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
    // 过滤去掉空字段
    FilterEmptyField: function (req, res, next) {

        _.each({body: req.body, query: req.query}, function (value, key) {
            if (!_.isEmpty(value)) {

                for (var i in req[key]) {
                    if (req[key][i] === "") {
                        delete req[key][i];
                    }else{
                        //  去掉首尾空字符 包括空格，制表符(Tab)，换行符，中文全角空格等
                        req[key][i] =  req[key][i].replace(/\s*$|^\s*/g,"")
                    }
                }
            }
        });

        next();
    },
    apiLimiter: new RateLimit({
        windowMs: 1*1000, // 时间段 1 秒
        max: 1, // 时间段内限制每个IP的请求数
        delayMs: 0 ,// 禁用延迟
        skip: function (req, res) {
            // if(req.method.toLowerCase() == 'get'){
            //     return true;
            // }
        },
        handler: function (req, res, next) {
            if(req.xhr){
                res.status(500).send({code: 500, msg: '请勿重复提交数据'});
            }else{
                res.redirect('back');
            }
            // res.status(500).end('请勿重复提交数据');
            // next();
        },
    }),
    // 保存路由路径
    SetBackPath: function (req, res, next) {
            req.session.backPath = req.url;
            next();
    },
};

//
// var limiter = new RateLimit({
//     windowMs: 3*1000, // 时间段 1 minutes
//     max: 1, // 时间段内限制每个IP的请求数
//     delayMs: 0 ,// 禁用延迟
//     skip: function (req, res) {
//         if(req.method.toLowerCase() == 'get'){
//             return true;
//         }
//     },
//     handler: function (req, res) {
//         // res.sendStatus(304);
//         console.log('submit!!!!!!!')
//         if (req.xhr) {
//             // res.end();
//             res.status(500).send({code: 500, msg: '请勿重复提交数据'});
//         } else {
//             // res.end();
//             res.status(500).send({code: 500, msg: '请勿重复提交数据'});
//             Base.handlerError(res, req, error);
//             // res.redirect('back');
//         }
//     }
// });

//  apply to all requests
// router.use(limiter);


/*
 * 页面范围: 首页相关
 * 控制器:   IndexController
 * */
var IndexController = require('./Controller/IndexController');

// 首页页面
router.get('/', Middleware.AuthCheck, IndexController.indexPage);

// 客户跟进统计
router.get('/countCustomer', Middleware.AuthCheck, IndexController.countCustomerPage);

// 获取门店列表
router.put('/getDepartList/:sid', Middleware.AuthCheck, IndexController.getDepartList);

// 获取部门列表
router.put('/getHomeAdviserList/:sid/:did', Middleware.AuthCheck, IndexController.getHomeAdviserList);

// 成交情况统计
router.get('/countDeal', Middleware.AuthCheck, IndexController.countDealPage);


router.get('/download', Middleware.AuthCheck, IndexController.getDownload);



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
router.get('/companyCustomers', Middleware.AuthCheck, Middleware.FilterEmptyField, CustomerController.companyCustomersPage);

// 获取客户详情页面
router.get('/customer/detail/:cid', Middleware.AuthCheck, CustomerController.detailPage);

/*
 * 页面范围: 订单相关
 * 控制器:   OrderController
 * */
var OrderController = require('./Controller/OrderController');


// 订单页面
router.get('/orders', Middleware.AuthCheck, Middleware.FilterEmptyField, OrderController.listPage);

// 订单详情页面   订单信息（认领订单）
router.get('/order/detail/:tid', Middleware.AuthCheck, OrderController.detailPage);

router.post('/order/detail/doModify', Middleware.AuthCheck, OrderController.detailDoModify);

// 标记为审核中
router.put('/orders/getTask/:tid', Middleware.AuthCheck, OrderController.getTask);
// 审核-退单重新提交
router.put('/orders/getTaskAgain/:tid', Middleware.AuthCheck, OrderController.getTaskAgain);
// 解锁订单
router.put('/orders/unlock/:tid', Middleware.AuthCheck, OrderController.doUnlock);
// 评估退回
router.put('/orders/returnOrder/:tid', Middleware.AuthCheck, OrderController.returnOrder);
// 审核未通过（退单）
router.post('/orders/notPass', Middleware.AuthCheck, OrderController.notPass);
// 审核通过
router.post('/orders/doPass', Middleware.AuthCheck, OrderController.doPass);
// router.put('/orders/doPass/:tid', Middleware.AuthCheck, OrderController.doPass);
// 设置难度等级
router.post('/orders/updateDifficultyLevel', Middleware.AuthCheck, OrderController.updateDifficultyLevel);

// 获取审核价格
router.put('/orders/getPriceInfo/:tid', Middleware.AuthCheck, OrderController.getPriceInfo);
// 修改审核价格
router.post('/orders/getPriceInfo/modify', Middleware.AuthCheck, OrderController.modifyPriceInfo);

// 所有修改价格记录
router.get('/:type/priceLog/:tid', Middleware.AuthCheck, OrderController.priceLogAllPage);

// 所有退回信息页面
router.get('/:type/chgback/:tid', Middleware.AuthCheck, OrderController.chgbackeAllPage);
// 新增交流信息页面
router.get('/:type/communicate/create/:tid', Middleware.AuthCheck, OrderController.communicatePage);

// 所有交流信息页面
router.get('/:type/communicateAll/:tid', Middleware.AuthCheck, OrderController.communicateAllPage);

// 新增交流信息
router.post('/:type/communicate/doCreate', Middleware.AuthCheck, OrderController.doCreateCommunicate);

// 补单页面
router.get('/orders/resupplys', Middleware.AuthCheck, Middleware.FilterEmptyField, OrderController.resupplyPage);

// 补单受理页面
router.get('/orders/resupplys/accept', Middleware.AuthCheck, Middleware.FilterEmptyField,Middleware.SetBackPath, OrderController.acceptPage);

// 标记为审核中
router.put('/resupplys/getTask/:tid', Middleware.AuthCheck, OrderController.getTaskResupplys);
// 重新提交
router.put('/resupplys/getTaskAgain/:tid', Middleware.AuthCheck, OrderController.getTaskResupplysAgain);
// 解锁补单
router.put('/resupplys/unlock/:tid', Middleware.AuthCheck, OrderController.doUnlockResupplys);

// 审核未通过（退单）
router.post('/resupplys/notPass', Middleware.AuthCheck, OrderController.notPassResupplys);
// 审核通过

router.put('/resupplys/doPass/:tid', Middleware.AuthCheck, OrderController.doPassResupplys);
// 补单原因
router.post('/resupplys/saveResupplyReason', Middleware.AuthCheck, OrderController.saveResupplyReason);

// 补单审核页面
router.get('/orders/resupplys/review', Middleware.AuthCheck, Middleware.FilterEmptyField,Middleware.SetBackPath, OrderController.reviewPage);
// 补单审核-标记为审核中
router.put('/resupplys/check/getTask/:tid', Middleware.AuthCheck, OrderController.getTaskResupplysCheck);
//  补单审核-解锁补单
router.put('/resupplys/check/unlock/:tid', Middleware.AuthCheck, OrderController.doUnlockResupplysCheck);

// 补单拆单页面
router.get('/orders/resupplys/apart', Middleware.AuthCheck, Middleware.FilterEmptyField,Middleware.SetBackPath,OrderController.apartPage);

// 标记为审核中 (待拆单)
// router.put('/resupplys/apart/getTask/:tid', Middleware.AuthCheck, OrderController.getTaskReApart);

// 解锁订单
// router.put('/resupplys/apart/unlock/:tid', Middleware.AuthCheck, OrderController.doUnlockReApart);

// 审核未通过（退单）
router.post('/resupplys/apart/notPass', Middleware.AuthCheck, OrderController.notPassReApart);

// 审核通过
// router.put('/resupplys/apart/doPass/:tid', Middleware.AuthCheck, OrderController.doPassReApart);

// 补单拆单审核页面
router.get('/orders/resupplys/apartCheck', Middleware.AuthCheck, Middleware.FilterEmptyField,Middleware.SetBackPath, OrderController.apartCheckPage);

// 标记为审核中 (待拆单审核)
// router.put('/resupplys/apartCheck/getTask/:tid', Middleware.AuthCheck, OrderController.getTaskCheckReApart);
// 解锁订单
// router.put('/resupplys/apartCheck/unlock/:tid', Middleware.AuthCheck, OrderController.doUnlockCheckReApart);

// 审核未通过（退单）
router.post('/resupplys/apartCheck/notPass', Middleware.AuthCheck, OrderController.notPassCheckReApart);
// 审核通过
// router.put('/resupplys/apartCheck/doPass/:tid', Middleware.AuthCheck, OrderController.doPassCheckReApart);

// 补单详情页面
router.get('/order/resupply/detail/:tid', Middleware.AuthCheck, OrderController.resupplyDetailPage);




//  订单审核页面
router.get('/order/check/:type', Middleware.AuthCheck, Middleware.FilterEmptyField,Middleware.SetBackPath,OrderController.checkPage);

//  订单流程记录页面
router.get('/order/process', Middleware.AuthCheck, OrderController.processPage);

//  订单许可页面
router.get('/order/permit', Middleware.AuthCheck,Middleware.FilterEmptyField,Middleware.SetBackPath, OrderController.permitPage);

// 订单排料页面
router.get('/orders/nesting', Middleware.AuthCheck,Middleware.FilterEmptyField,Middleware.SetBackPath, OrderController.nestingPage);
// 标记排料中页面
router.post('/orders/getNestingTask/:cid', Middleware.AuthCheck, OrderController.getNestingTask);
// 修改批次页面
router.post('/order/editBatchNum/:cid/:bid', Middleware.AuthCheck, OrderController.editBatchNum);
// 标记为审核中 (待排料)
router.put('/schedule/getTask/:tid', Middleware.AuthCheck, OrderController.getTaskSchedule);

// 解锁订单
router.put('/schedule/unlock/:tid', Middleware.AuthCheck, OrderController.doUnlockSchedule);

// 审核未通过（退单）
router.post('/schedule/notPass', Middleware.AuthCheck, OrderController.notPassSchedule);

// 审核通过
router.put('/schedule/doPass/:tid', Middleware.AuthCheck, OrderController.doPassSchedule);

// 重新提交 (排料审核退回)
router.put('/schedule/getTaskAgain/:tid', Middleware.AuthCheck, OrderController.getTaskCheckAgain);


// 订单包装页面
router.get('/orders/package', Middleware.AuthCheck,Middleware.FilterEmptyField,OrderController.packagePage);
router.get('/orders/package/allInfo', Middleware.AuthCheck,Middleware.FilterEmptyField,OrderController.allInfoPage);

// 查询订单生成包装后的包装详情
router.get('/orders/package/:tid', Middleware.AuthCheck,OrderController.packedListPage);

// 生成包装操作
router.put('/orders/package/packet/:tid', Middleware.apiLimiter,Middleware.AuthCheck,OrderController.doPacket);

// 撤销包装操作
router.put('/orders/package/unpacket/:tid', Middleware.AuthCheck,OrderController.unPacket);

// 移动包装操作
router.post('/orders/package/packet/move',Middleware.AuthCheck,OrderController.movePacket);

// 删除空包装操作
router.put('/orders/package/packet/delete/:pid/:type',Middleware.AuthCheck,OrderController.deletePacket);

// 导出包装清单
router.get('/orders/package/export/:tid',Middleware.AuthCheck,OrderController.exportPacket);

// 增加包装
router.post('/orders/package/packet/add',Middleware.AuthCheck,OrderController.addPacket);


// 订单详情--订单物料--非标件
router.get('/order/workpiece/:tid',Middleware.AuthCheck,OrderController.workpiecePage);
// 订单详情--订单物料--配件
 router.get('/order/materiel_modal/:tid',Middleware.AuthCheck,OrderController.partsPage);

// 订单详情--订单物料--非标件导出
router.get('/order/exportWorkpiece/:tid',Middleware.AuthCheck,OrderController.exportWorkpiece);
// 订单详情--订单物料--配件导出
router.get('/order/exportParts/:tid',Middleware.AuthCheck,OrderController.exportParts);

// 收款页面
router.get('/collection', Middleware.AuthCheck,Middleware.FilterEmptyField,Middleware.SetBackPath, OrderController.receiptMoneyPage);
// 付款
router.post('/collection/receiptCheck', Middleware.AuthCheck, OrderController.receiptCheck);
// 确认收款
router.post('/collection/receiptCheck/pass', Middleware.AuthCheck, OrderController.receiptCheckPass);
// 审核不通过
router.post('/collection/receiptCheck/notpass', Middleware.AuthCheck, OrderController.receiptCheckNotPass);
// 对账
router.post('/collection/reconciliation', Middleware.AuthCheck, OrderController.reconciliation);

// 批次号管理
router.get('/orders/batchNumber', Middleware.AuthCheck,Middleware.SetBackPath,OrderController.batchPage);
router.get('/orders/batchNumber/detail/:batchNumber/:factoryId', Middleware.AuthCheck, OrderController.batchDetail);

router.get('/orders/batchNumber/downloadZip/:batchNumber/:factoryId', Middleware.AuthCheck, OrderController.downloadZip);
router.get('/orders/batchNumber/downloadPackage/:batchNumber/:factoryId', Middleware.AuthCheck, OrderController.downloadPackage);

// 生成包装操作
router.post('/orders/batchNumber/package/packet', Middleware.apiLimiter,Middleware.AuthCheck,OrderController.doPacketBatchNumber);
// 撤销包装操作
router.post('/orders/batchNumber/unpacket/packet', Middleware.apiLimiter,Middleware.AuthCheck,OrderController.doUnpacketBatchNumber);
router.post('/orders/batchNumber/schedule', Middleware.apiLimiter,Middleware.AuthCheck,OrderController.doScheduleBatchNumber);
/*
 * 页面范围: 拆单
 * 控制器:   TearController
 * */
var ApartController = require('./Controller/ApartController');

// 拆单页面
router.get('/apartPage/:type', Middleware.AuthCheck, Middleware.FilterEmptyField,Middleware.SetBackPath, ApartController.listPage);

// 拆单审核页面
router.get('/apartCheckPage/:type', Middleware.AuthCheck, Middleware.FilterEmptyField,Middleware.SetBackPath, ApartController.checkPage);

// 标记为审核中 (待拆单)
router.put('/apart/getTask/:tid', Middleware.AuthCheck, ApartController.getTask);

// 解锁订单
router.put('/apart/unlock/:tid', Middleware.AuthCheck, ApartController.doUnlock);

// 审核未通过（退单）
router.post('/apart/notPass', Middleware.AuthCheck, ApartController.notPass);

// 审核通过
router.put('/apart/doPass/:tid', Middleware.AuthCheck, ApartController.doPass);

router.post('/apart/doPass/byMoney', Middleware.AuthCheck, ApartController.doPassByMoney);

// 标记为审核中 (待拆单审核)
router.put('/apartCheck/getTask/:tid', Middleware.AuthCheck, ApartController.getTaskCheck);

// 重新提交 (拆单审核退回)
router.put('/apartCheck/getTaskAgain/:tid', Middleware.AuthCheck, ApartController.getTaskCheckAgain);

// 解锁订单
router.put('/apartCheck/unlock/:tid', Middleware.AuthCheck, ApartController.doUnlockCheck);

// 审核未通过（退单）
router.post('/apartCheck/notPass', Middleware.AuthCheck, ApartController.notPassCheck);
// 审核通过
router.put('/apartCheck/doPass/:tid', Middleware.AuthCheck, ApartController.doPassCheck);



/*
 * 页面范围: 门店管理
 * 控制器:   SroresController
 * */
var StoresController = require('./Controller/StoresController');

// 门店管理页面
router.get('/storesManage', Middleware.AuthCheck, Middleware.FilterEmptyField,Middleware.SetBackPath, StoresController.listPage);

// 门店详情页面
router.get('/storesManage/detail/:cid', Middleware.AuthCheck, StoresController.detailPage);

// 门店详情页面-充值
router.post('/storesManage/doRecharge', Middleware.AuthCheck, StoresController.doRecharge);


// 所有门店资金页面
router.get('/storesManage/all/money', Middleware.AuthCheck, Middleware.FilterEmptyField,Middleware.SetBackPath, StoresController.allMoneyPage);

// 新建门店页面
router.get('/storesManage/create', Middleware.AuthCheck, StoresController.createPage);

// 门店资金预充值页面
router.get('/storesManage/preRecharge/:bid', Middleware.AuthCheck, StoresController.preRechargePage);
// 门店预充值通过
router.post('/storesManage/passPrerecharge', Middleware.AuthCheck, StoresController.passPrerecharge);
// 门店预充值退回
router.post('/storesManage/backPrerecharge', Middleware.AuthCheck, StoresController.backPrerecharge);

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
router.get('/materialManage', Middleware.AuthCheck,Middleware.FilterEmptyField,Middleware.SetBackPath,MaterialController.indexPage);

// 物料详情页面
router.get('/materialManage/detail/:bid/:mid', Middleware.AuthCheck, Middleware.SetBackPath,MaterialController.detailPage);

// 根据工厂选择物料详情页面
router.post('/materialManage/choiceFactory', Middleware.AuthCheck, MaterialController.choiceFactory);

// 物料出入库总计页面
router.get('/materialManage/summary', Middleware.AuthCheck,Middleware.FilterEmptyField,MaterialController.summaryPage);

// 物料分类一物料新建
router.get('/materialManage/material/:tid/creStepO', Middleware.AuthCheck, MaterialController.materialTypeCreateOnePage);

// 物料新建页面一
router.get('/materialManage/material/creStepO', Middleware.AuthCheck, MaterialController.materialCreateOnePage);

// 物料新建页面一-第一步传值
router.post('/materialCreate/doNext', Middleware.AuthCheck, MaterialController.doNext);

// 物料新建页面二
router.get('/materialManage/material/creStepS/:id', Middleware.AuthCheck, MaterialController.materialCreateSecPage);

// 物料分类三级联动菜单接口
router.put('/materialManage/material/selectMateCate/:pid', Middleware.AuthCheck, MaterialController.selectMateCate);

// 新建物料-提交数据接口
router.post('/materialManage/material/doCreate', Middleware.AuthCheck, MaterialController.doCreate);

// 修改物料
router.get('/materialManage/material/modify/:mid', Middleware.AuthCheck, MaterialController.materialModifyPage);

// 修改物料-提交数据接口
router.post('/materialManage/material/doModify', Middleware.AuthCheck, MaterialController.doModify);

// 禁用/解锁 物料详情
router.put('/material/setStatus/:mid/:type', Middleware.AuthCheck, MaterialController.setMaterialStatus);

// 物料管理--物料详情-完善物料
router.get('/materialManage/add/:bid/:mid', Middleware.AuthCheck, MaterialController.mateFacAddPage);

// 禁用/解锁 物料详情-完善物料
router.put('/material/add/setStatus/:bid/:mid/:type', Middleware.AuthCheck, MaterialController.setMaterialAppStatus);

// 物料管理--物料详情-完善物料--提交数据接口
router.post('/materialManage/doAdd', Middleware.AuthCheck, MaterialController.doAdd);

// 物料管理--成品关联物料--工件
router.get('/materialManage/workpiece/:mid', Middleware.AuthCheck, MaterialController.workpiecePage);

// 物料管理--成品关联物料--配件
router.get('/materialManage/accessory/:mid', Middleware.AuthCheck, MaterialController.materiel_accessoryPage);

// 物料管理--成品关联物料--上传工件、配件文件
router.post('/api/materials/accessory/workpiece', Middleware.AuthCheck, MaterialController.fileDoCreate);

// 物料管理--修改预警
router.post('/materials/doWarning', Middleware.AuthCheck, MaterialController.warningDoCreate);

// 物料管理--修改库存
router.post('/materials/doStock', Middleware.AuthCheck, MaterialController.stockDoCreate);

// 物料管理--新增物料
router.post('/materials/doCreate', Middleware.AuthCheck, MaterialController.materialDoCreate);

// 物料管理--库存记录
router.get('/stockRecord', Middleware.AuthCheck,Middleware.FilterEmptyField,MaterialController.stockRecordPage);

// 物料管理--是否为外协
router.post('/materials/outSourcing', Middleware.AuthCheck, MaterialController.outSourcingDoCreate);


/*
 * 页面范围: 物料属性相关
 * 控制器:   MaterialAttrController
 * */
var MaterialAttrController = require('./Controller/MaterialAttrController');
// 物料属性页面
router.get('/materialManage/materialAttribute', Middleware.AuthCheck,Middleware.FilterEmptyField,MaterialAttrController.materialAttributePage);

// 新建物料属性接口
router.post('/material/attrCreate', Middleware.AuthCheck, MaterialAttrController.attrCreate);

// 修改物料属性接口
router.post('/material/attrChange', Middleware.AuthCheck, MaterialAttrController.attrChange);

// 禁用/解锁 物料属性状态
router.put('/mateAttr/setStatus/:aid/:type', Middleware.AuthCheck, MaterialAttrController.setAttrStatus);

// 新建物料属性值接口
router.post('/material/attrValCreate', Middleware.AuthCheck, MaterialAttrController.attrValCreate);

// 修改物料属性值接口
router.post('/material/attrValChange', Middleware.AuthCheck, MaterialAttrController.attrValChange);

// 物料属性值详情页面
router.get('/materialManage/mateAttr/detail/:mid', Middleware.AuthCheck, MaterialAttrController.mateAttrDetailPage);

// 禁用/解锁 物料属性值状态
router.put('/mateAttrVal/setStatus/:code/:type/:aid', Middleware.AuthCheck, MaterialAttrController.setAttrValStatus);

/*
 * 页面范围: 物料分类相关
 * 控制器:  MaterialTypeController
 * */
var MaterialTypeController = require('./Controller/MaterialTypeController');

// 物料分类页面
router.get('/materialManage/materialType', Middleware.AuthCheck,Middleware.FilterEmptyField,Middleware.SetBackPath,MaterialTypeController.materialTypePage);

// 物料分类-新建一级分类页面
router.get('/materialManage/materialType/creOne', Middleware.AuthCheck, MaterialTypeController.materialTypeCreOnePage);

// 物料分类-新建二级、三级分类页面
router.get('/materialManage/materialType/creOther/:id', Middleware.AuthCheck, MaterialTypeController.materialTypeCreOtherPage);

// 物料分类-新建一级分类页面--数据接口
router.post('/materialManage/materialType/creOneDo', Middleware.AuthCheck, MaterialTypeController.materialTypeCreOneDo);

// 物料分类-新建二级、三级分类--数据接口
router.post('/materialManage/materialType/creOtherDo', Middleware.AuthCheck, MaterialTypeController.materialTypeCreOtherDo);

// 物料分类-修改分类页面
router.get('/materialManage/materialType/modify/:id', Middleware.AuthCheck, MaterialTypeController.materialTypeModify);

// 物料分类-修改分类页面--数据接口
router.post('/materialManage/materialType/modify', Middleware.AuthCheck, MaterialTypeController.materialTypeDoModify);

// 禁用/解锁 物料分类状态
router.put('/materialType/setStatus/:id/:type', Middleware.AuthCheck, MaterialTypeController.setMaterialTypeStatus);


/*
 * 页面范围: 机构相关
 * 控制器:   AgencyController
 * */

var AgencyController = require('./Controller/AgencyController');

// 获取机构信息
router.get('/agency', Middleware.AuthCheck, Middleware.FilterEmptyField,Middleware.SetBackPath, AgencyController.listPage);

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

// 删除部门
router.put('/department/doOpen/:type/:id', Middleware.AuthCheck, DepartmentController.doOpen);



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

// 登陆解锁 员工账号
router.put('/employees/openLogin/:cid', Middleware.AuthCheck, EmployeeController.openLogin);
/*
 * 页面范围: 仓储管理
 * 控制器:   FactoryController
 * */
var FactoryController = require('./Controller/FactoryController');

// 获取工厂列表
router.get('/factory', Middleware.AuthCheck, Middleware.FilterEmptyField,Middleware.SetBackPath, FactoryController.listPage);

// 工厂详情页面
router.get('/factory/detail/:ftyId', Middleware.AuthCheck, FactoryController.detailPage);

// 新增工厂页面
router.get('/factory/create', Middleware.AuthCheck, FactoryController.createPage);
router.get('/getFactoryByID/:id', Middleware.AuthCheck, FactoryController.ifHaved);
// 新增工厂
router.post('/factory/doCreate', Middleware.AuthCheck, FactoryController.doCreate);

// 修改工厂详情页面
router.get('/factory/modify/:ftyId', Middleware.AuthCheck, FactoryController.modifyPage);

// 修改工厂信息
router.post('/factory/doModify', Middleware.AuthCheck, FactoryController.doModify);

// 关闭 工厂
router.delete('/factory/doClose/:ftyId', Middleware.AuthCheck, FactoryController.doClose);

// 解锁 工厂
router.put('/factory/doOpen/:ftyId', Middleware.AuthCheck, FactoryController.doOpen);


// 获取仓库列表
router.get('/warehouse', Middleware.AuthCheck, Middleware.FilterEmptyField, FactoryController.listWarehousePage);

// 新增仓库页面
router.get('/warehouse/create/:ftyId', Middleware.AuthCheck, FactoryController.createWarehousePage);

// 新增仓库
router.post('/warehouse/doCreate', Middleware.AuthCheck,  FactoryController.doWarehouseCreate);

// 修改仓库详情页面
router.get('/warehouse/modify/:whseId', Middleware.AuthCheck, FactoryController.modifyWarehousePage);

// 修改仓库信息
router.post('/warehouse/doModify', Middleware.AuthCheck, FactoryController.doModifyWarehouse);

// 关闭 仓库
router.delete('/warehouse/doClose/:whseId', Middleware.AuthCheck, FactoryController.doCloseWarehouse);

// 解锁 仓库
router.put('/warehouse/doOpen/:whseId', Middleware.AuthCheck, FactoryController.doOpenWarehouse);




// 获取仓库区域列表
router.get('/region', Middleware.AuthCheck, Middleware.FilterEmptyField, FactoryController.listRegionPage);

// 新增仓库区域页面
router.get('/region/create/:ftyId/:whseId', Middleware.AuthCheck, FactoryController.createRegionPage);

// 新增仓库区域
router.post('/region/doCreate', Middleware.AuthCheck, FactoryController.doRegionCreate);

// 修改区域详情页面
router.get('/region/modify/:whseId/:regionId', Middleware.AuthCheck, FactoryController.modifyRegionPage);

// 修改区域信息
router.post('/region/doModify', Middleware.AuthCheck, FactoryController.doModifyRegion);

// 关闭 区域
router.delete('/region/doClose/:regionId', Middleware.AuthCheck, FactoryController.doCloseRegion);

// 解锁 区域
router.put('/region/doOpen/:regionId', Middleware.AuthCheck, FactoryController.doOpenRegion);

/*
 * 页面范围: 货位管理
 * 控制器:   CargospaceController
 * */

var CargospaceController = require('./Controller/CargospaceController');

// 获取货位列表-菜单栏直接进入
router.get('/cargospaceList', Middleware.AuthCheck, Middleware.FilterEmptyField, CargospaceController.unlistPage);

// 取工厂列表
router.get('/getFactoryList', Middleware.AuthCheck, CargospaceController.getFactory);
// 取工厂下仓库列表
router.put('/getWarehouseList/:ftyId', Middleware.AuthCheck, CargospaceController.getWarehouse);
// 带角色筛选
router.put('/getWarehouseList/perm/:ftyId', Middleware.AuthCheck, CargospaceController.getWarehousePerm);

// 取仓库下区域列表
router.put('/getRegionList/:whseId', Middleware.AuthCheck, CargospaceController.getRegion);
// 带角色筛选
router.put('/getRegionList/perm/:whseId', Middleware.AuthCheck, CargospaceController.getRegionPerm);


// 获取货位列表
router.get('/cargospace', Middleware.AuthCheck, Middleware.FilterEmptyField, CargospaceController.listPage);

// 货位详情页面
router.get('/:type/cargospace/detail/:spaceId', Middleware.AuthCheck, CargospaceController.detailPage);

// 新增货位页面
router.get('/cargospace/create', Middleware.AuthCheck, CargospaceController.createPage);

// 新增货位页面-第一步传值
router.post('/cargospace/doNext', Middleware.AuthCheck, CargospaceController.doNext);

// 新增货位页面-下一步
router.get('/cargospace/createNext/:ftyId/:whseId/:regionId', Middleware.AuthCheck, CargospaceController.createNextPage);

// 新增货位
router.post('/cargospace/doCreate', Middleware.AuthCheck, CargospaceController.doCreate);

// 修改货位详情页面
router.get('/cargospace/modify/:spaceId', Middleware.AuthCheck, CargospaceController.modifyPage);

// 修改货位信息
router.post('/cargospace/doModify', Middleware.AuthCheck, CargospaceController.doModify);

// 关闭 货位
router.delete('/cargospace/doClose/:spaceId', Middleware.AuthCheck, CargospaceController.doClose);

// 解锁 货位
router.put('/cargospace/doOpen/:spaceId', Middleware.AuthCheck, CargospaceController.doOpen);



/*
 * 页面范围: 入库管理相关
 * 控制器:   EnterController
 * */

var EnterController = require('./Controller/EnterController');

// 原料入库页面
router.get('/enterMaterial', Middleware.AuthCheck, Middleware.FilterEmptyField, EnterController.enterMaterialPage);

// 原料入库-审核
router.put('/enterMaterial/doPass/:inId/:purId/:stcode', Middleware.AuthCheck, EnterController.doPassMaterial);

// 原料入库-撤审
router.put('/enterMaterial/notPass/:id', Middleware.AuthCheck, EnterController.notPassMaterial);

// 原料入库详情页面
router.get('/enterMaterial/detail/:id', Middleware.AuthCheck, EnterController.enterMaterialDetailPage);

// 原料入库-采购完成单 页面
router.get('/enterMaterial/stockOver', Middleware.AuthCheck, EnterController.stockOverPage);

// 原料入库-采购完成单-入库 页面
router.get('/enterMaterial/stockOver/toEnter', Middleware.AuthCheck, EnterController.stockEnterPage);

// 原料入库-采购完成单-入库-入库
router.post('/enterMaterial/stockOver/toEnter/doEnter', Middleware.AuthCheck, EnterController.doEnter);
router.post('/enterMaterial/reqmaterialModify', Middleware.AuthCheck, EnterController.reqmaterialModify);

// 原料入库-采购完成单-入库-获取空货位
router.post('/enterMaterial/stockOver/getEmptyOne', Middleware.AuthCheck, EnterController.getEmptyOne);

// 原料入库-采购完成单-入库-判断仓库是否可以放入
router.post('/enterMaterial/stockOver/toEnter/ifCanEnter', Middleware.AuthCheck, EnterController.ifCanEnter);
// 成品入库分配货位
router.post('/enter/findWhse', Middleware.AuthCheck, EnterController.findWhse);

// 成品入库页面
router.get('/enterProduct', Middleware.AuthCheck, EnterController.enterProductPage);

// 成品入库详情页面
router.get('/enterProduct/detail/:id', Middleware.AuthCheck, EnterController.enterProductDetailPage);

// 成品-入库页面
router.get('/enterProduct/notin', Middleware.AuthCheck,Middleware.FilterEmptyField, EnterController.enterNotinPage);

// 成品扫描入库-入库
router.put('/enterProduct/scanning/doEnter/:id', Middleware.AuthCheck, EnterController.doEnterProduct);



/*
 * 页面范围: 出库管理相关
 * 控制器:   OutWarehouseController
 * */

var OutWarehouseController = require('./Controller/OutWarehouseController');

// 待发货流水页面
router.get('/waitSend', Middleware.AuthCheck, Middleware.FilterEmptyField, OutWarehouseController.waitSendPage);

//填写发货通知单-list
router.get('/delivery/tidList/:lid',OutWarehouseController.deliveryTidList);

// 发货通知单页面
router.post('/doDelivery', Middleware.AuthCheck, OutWarehouseController.doDelivery);

// 发货通知单页面
router.get('/deliveryNote', Middleware.AuthCheck,Middleware.FilterEmptyField,Middleware.SetBackPath, OutWarehouseController.deliveryNotePage);

// 发货通知单-审核
router.put('/deliveryNote/doChecked/:id/:stcode', Middleware.AuthCheck, OutWarehouseController.doDeliveryChecked);

// 发货通知单-作废
router.put('/deliveryNote/cancel/:id', Middleware.AuthCheck, OutWarehouseController.doDeliveryCancel);

// 发货通知单-详情 页面
router.get('/deliveryNote/deatil/:id', Middleware.AuthCheck, OutWarehouseController.deliveryNoteDeatil);

// 原料出库页面
router.get('/outMaterial', Middleware.AuthCheck, OutWarehouseController.outMaterialPage);

// 原料出库-审核
router.put('/outMaterial/doChecked/:id', Middleware.AuthCheck, OutWarehouseController.outMaterialChecked);

// 原料出库详情页面
router.get('/outMaterial/deatil/:id', Middleware.AuthCheck, OutWarehouseController.outMaterialDeatil);

// 可发货订单 页面
router.get('/:type/canSend', Middleware.AuthCheck, OutWarehouseController.canSendPage);

// 可发货订单-发货 页面
router.get('/:type/canSend/sendPage/:id', Middleware.AuthCheck, OutWarehouseController.sendPage);

// 可发货订单-发货
router.post('/canSend/doSend', Middleware.AuthCheck, OutWarehouseController.doSend);

// 可发货订单详情  页面
router.get('/canSend/deatil/:id', Middleware.AuthCheck, OutWarehouseController.canSendDeatil);

// 成品出库页面
router.get('/outProduct', Middleware.AuthCheck, OutWarehouseController.outProductPage);

// 成品出库-审核
router.put('/outProduct/doChecked/:id', Middleware.AuthCheck, OutWarehouseController.outProductChecked);

// 成品出库详情页面
router.get('/outProduct/deatil/:id', Middleware.AuthCheck, OutWarehouseController.outProductDeatil);

// 成品出库详情页面-出库
router.post('/outProduct/doCargoout', Middleware.AuthCheck, OutWarehouseController.outProducDoCargoout);

// 成品备货页面
router.get('/productStock', Middleware.AuthCheck,Middleware.FilterEmptyField,Middleware.SetBackPath, OutWarehouseController.productStock);

// 备货-领取发货通知单
router.get('/stock/receive/:diId', Middleware.AuthCheck, OutWarehouseController.stockReceive);

// 备货-解锁发货通知单
router.get('/stock/unlock/:diId', Middleware.AuthCheck, OutWarehouseController.stockUnlock);

// 备货-可备货货订单
router.get('/productStock/order', Middleware.AuthCheck, OutWarehouseController.productStockOrder);

router.get('/productStock/pakg/:tid', Middleware.AuthCheck, OutWarehouseController.productPakgList);

router.get('/productOut/pakg/:tid', Middleware.AuthCheck, OutWarehouseController.productOutPakgList);

// 大板领料单页面
router.get('/outBred', Middleware.AuthCheck, OutWarehouseController.outBredPage);

// 大板领料单-导入
router.post('/outBred/upload', Middleware.AuthCheck, OutWarehouseController.outBredUpload);

// 大板领料详情单页面
router.get('/outBred/deatil/:id', Middleware.AuthCheck, OutWarehouseController.outBredDeatil);

// 可发货订单-审核
router.put('/outBred/doCheck/:id/:stcode', Middleware.AuthCheck, OutWarehouseController.doCheckBred);


router.post('/outBred/plateOut', Middleware.AuthCheck, OutWarehouseController.plateOut);
router.post('/outBred/accessoryOut', Middleware.AuthCheck, OutWarehouseController.accessoryOut);


router.post('/outBred/batchnumber/ifCan', Middleware.AuthCheck, OutWarehouseController.ifCanBatchnumber);

/*
 * 页面范围: 任务序列相关
 * 控制器:   TaskseqController
 * */
var TaskseqController = require('./Controller/TaskseqController');

// 获取登记流水记录
router.get('/taskseqs', Middleware.AuthCheck, Middleware.FilterEmptyField, TaskseqController.listPage);

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
// router.get('/file/order/create/:lid/:type/:tid', Middleware.AuthCheck, FileController.createOrderFilePage);
router.get('/file/order/create/:lid/:stcode/:type/:tid', Middleware.AuthCheck, FileController.createOrderFilePage);

router.get('/file/resupply/create/:lid/:stcode/:type/:tid', Middleware.AuthCheck, FileController.createResupplyFilePage);


// 新增文件上传地址(拆单)
// router.get('/file/order/apart/:lid/:type/:tid', Middleware.AuthCheck, FileController.createApartFilePage);

// 显示所有效果图
router.get('/file/pic/:lid', Middleware.AuthCheck, FileController.picPage);

router.get('/file/order/detail/:lid', Middleware.AuthCheck, FileController.orderFileDetail);

// 新增上传文件
router.post('/file/doCreate', Middleware.AuthCheck, FileController.doCreate);

// 新增订单文件上传
router.post('/file/order/doCreate', Middleware.AuthCheck, FileController.doCreateOrderFile);

// 批次号文件上传
router.post('/file/batchNumber/doCreate', Middleware.AuthCheck, FileController.doCreateBatchNumberFile);

// 删除上传文件
router.delete('/file/doDelete/:id', Middleware.AuthCheck, FileController.doDelete);

// 删除订单上传文件
router.delete('/file/order/doDelete/:id', Middleware.AuthCheck, FileController.doDeleteOrderFile);

router.post('/file/zipDownload', Middleware.AuthCheck, FileController.zipDownload);
/*
 * 页面范围: *模板相关-参考用
 * 控制器:   TemplateController
 * */
var TemplateController = require('./Controller/TemplateController');

router.get('/template', TemplateController.createPage);

// 单文件上传
router.post('/template/upload/single/:type', [upload.single('file_name'), Middleware.FilterEmptyField], TemplateController.doSingleUpload);


// 图片上传
router.post('/template/upload/img', [upload.single('file_name'), Middleware.FilterEmptyField], TemplateController.doImgUpload);


// 文件组上传
router.post('/template/upload/multi', upload.array('file_name'), TemplateController.doMultiUpload);

// 自定义上传
router.post('/template/upload/custom', upload.fields([{name: 'file_name', maxCount: 2},
    {name: 'file_name2', maxCount: 1}]), TemplateController.doCustomUpload);

// 任意文件组上传
router.post('/template/upload/any', upload.any(), TemplateController.doAnyUpload);

// 分页请求
router.get('/template/pagination',TemplateController.pagination);

// 级联请求统一处理 /cascade/api/areas
router.get('/cascade/*', TemplateController.getData);



/*
 * 页面范围: 供应商相关
 * 控制器:   SupplierController
 * */

var SupplierController = require('./Controller/SupplierController');

// 供应商列表
router.get('/supplier', Middleware.AuthCheck,Middleware.FilterEmptyField,Middleware.SetBackPath,SupplierController.supplierPage);
// 供应商详情
router.get('/supplier/detail/:tid', Middleware.AuthCheck,SupplierController.supplierDetailPage);
// 供应商新增页面
router.get('/supplier/createPage', Middleware.AuthCheck,SupplierController.supplierCreatPage);
// 供应商新增 子类
// router.get('/supplier/createPage', Middleware.AuthCheck,SupplierController.supplierCreatPage);
// 供应商新增获取一级分类
router.get('/supplier/create/:tid', Middleware.AuthCheck,SupplierController.supSortParentId);
// 供应商信息新增
router.post('/supplier/doCreate', Middleware.AuthCheck,SupplierController.supplierDoCreate);
// 供应商信息修改页面
router.get('/supplier/modify/:tid', Middleware.AuthCheck,SupplierController.supplierModifyPage);
// 供应商信息修改
router.post('/supplier/doModify', Middleware.AuthCheck,SupplierController.supplierDoModify);
// 新增供应商物料关联
router.post('/supplier/createMaterialSupplier', Middleware.AuthCheck,SupplierController.createMaterialSupplier);
// 供应商可供物料
router.get('/supplier/offer_product/:tid', Middleware.AuthCheck,Middleware.FilterEmptyField,SupplierController.supplierOfferProductPage);

// 修改供应商物料关联有效期
router.post('/supplier/updateDate', Middleware.AuthCheck,SupplierController.updateDate);

// 删除供应商物料关联
router.post('/supplier/deleteRelate/:sid/:mid', Middleware.AuthCheck,SupplierController.deleteRelate);

// 供应商禁用+启用
router.post('/supplier/supDoDelete/:tid/:type', Middleware.AuthCheck, SupplierController.supplierdoDelete);

// 供应商分类
router.get('/supplier/sort', Middleware.AuthCheck,Middleware.FilterEmptyField,Middleware.SetBackPath,SupplierController.supplierSortPage);
// 供应商一级分类添加
router.post('/supplier/doCreat', Middleware.AuthCheck,SupplierController.doCreate);
// 供应商分类禁用
router.post('/supplier/doDelete/:tid/:type', Middleware.AuthCheck, SupplierController.doDelete);
// 供应商分类修改
router.post('/supplier/sortDoModify', Middleware.AuthCheck, SupplierController.doModify);

// 供应商分类修改
// router.get('/supplier/sort_modify', Middleware.AuthCheck,SupplierController.supplierSortModifyPage);



/*
 * 页面范围: 采购管理相关
 * 控制器:   purchaseController
 * */
var PurchaseController = require('./Controller/PurchaseController');

// 已请购详情
router.get('/purchase', Middleware.AuthCheck,PurchaseController.purchasePage);

// 新建请购单页面
router.get('/purchase/applyCreat', Middleware.AuthCheck,Middleware.FilterEmptyField,PurchaseController.purchaseApplyCreatPage);
// 新建请购单 选择物料信息列表
router.get('/purchase/applyOrderMaterial', Middleware.AuthCheck,PurchaseController.purchaseApplyMaterialCreat);
// 新建请购单 物料信息修改
router.get('/purchase/apply_createMaterial/:tid', Middleware.AuthCheck,PurchaseController.applyMaterialCreatePage);
// 新建请购单 添加物料数量+预计交期
router.post('/purchase/applyMaterialCreate', Middleware.AuthCheck,PurchaseController.applyMaterialCreate);

// 请购单详情
router.get('/purchase/applyDetail/:tid', Middleware.AuthCheck,PurchaseController.purchaseApplyDetailPage);
//外协请购修改供应商
router.post('/purchase/applyModify', Middleware.AuthCheck,PurchaseController.applyPurchaseModify);

// 请购单审核
router.post('/purchase/applyReview/:tid', Middleware.AuthCheck,PurchaseController.purchaseApplyReview);
//删除未审核请购单
router.post('/applyPurchases/del/:purcIds', Middleware.AuthCheck,PurchaseController.applyPurchaseDel);


// 采购详情
router.get('/purchase/detail', Middleware.AuthCheck,Middleware.FilterEmptyField,Middleware.SetBackPath,PurchaseController.purchaseDetail);
// 生成采购单
router.post('/purchases/Order/:tid', Middleware.AuthCheck,PurchaseController.purchaseOrder);
// 采购单详情
router.get('/purchase/orderDetail/:tid', Middleware.AuthCheck,PurchaseController.purchaseOrderDetail);

// 采购单详情--付款凭证上传type=10
router.post('/purchase/uploadProof', Middleware.AuthCheck,PurchaseController.uploadProof);

// 采购单详情--付款凭证上传type=30
router.post('/purchase/uploadProof2', Middleware.AuthCheck,PurchaseController.uploadProof2);

// 合并采购单
router.post('/purchases/merge/:tid', Middleware.AuthCheck,PurchaseController.purchaseMerge);
// 审核采购单
router.post('/purchases/review/:tid', Middleware.AuthCheck,PurchaseController.purchaseReview);
// 撤回采购单
router.post('/purchases/recall/:tid', Middleware.AuthCheck,PurchaseController.purchaseRecall);
// 提交采购单
router.post('/purchases/submit/:tid', Middleware.AuthCheck,PurchaseController.purchaseSubmit);
//删除未审核采购单
router.post('/purchases/del/:purcIds', Middleware.AuthCheck,PurchaseController.purchaseDel);
//打印采购单
// router.get('/purchases/print', Middleware.AuthCheck,PurchaseController.printPurchase);

//新建采购单页面
router.get('/purchase/create', Middleware.AuthCheck,Middleware.FilterEmptyField,PurchaseController.purchaseCreatePage);

// 新建采购单 选择物料信息列表
router.get('/purchase/orderMaterial', Middleware.AuthCheck,PurchaseController.purchaseMaterialCreat);

// 新建采购单 添加物料数量+预计交期
router.post('/purchase/materialCreate', Middleware.AuthCheck,PurchaseController.materialCreate);


/*
 * 页面范围: 网络预约相关
 * 控制器:   networkBookController
 * */
var NetworkBookController = require('./Controller/NetworkBookController');

// 网络预约
router.get('/networkBook', Middleware.AuthCheck, Middleware.FilterEmptyField,Middleware.SetBackPath,NetworkBookController.indexPage);

// 客户信息
router.put('/measure/:mobile', Middleware.AuthCheck, NetworkBookController.measurePage);

// 分配门店创建量尺任务
router.post('/networkBook/doMeasure', Middleware.AuthCheck, NetworkBookController.doMeasure);

// 置为无效
router.put('/networkBook/doClose/:measureId', Middleware.AuthCheck, NetworkBookController.doClose);

/*
 * 页面范围: 与公告、资料相关
 * 控制器:   InformationController
 * */
var InformationController = require('./Controller/InformationController');

// 公告信息-列表页面
router.get('/noticeInfo', Middleware.AuthCheck,Middleware.FilterEmptyField,Middleware.SetBackPath,InformationController.noticeListPage);

// 公告信息--详情页面
router.get('/noticeInfo/detail/:id', Middleware.AuthCheck,InformationController.noticeDetailPage);

// 公告信息--新建公告页面
router.get('/noticeInfo/create', Middleware.AuthCheck,InformationController.noticeCreatePage);

// 公告信息--修改页面
router.get('/noticeInfo/modify/:id', Middleware.AuthCheck,InformationController.noticeModifyPage);

// 公告信息-新建
router.post('/noticeInfo/doCreate', Middleware.AuthCheck,InformationController.noticeDoCreate);

// 公告信息-修改
router.post('/noticeInfo/doModify', Middleware.AuthCheck, InformationController.noticeDoModify);

// 公告信息-删除
router.put('/noticeInfo/doDelete/:nid', Middleware.AuthCheck, InformationController.noticeDoDelete);

// 资料信息详情页面
router.get('/fileInfo', Middleware.AuthCheck,Middleware.FilterEmptyField,Middleware.SetBackPath, InformationController.fileInfoPage);

// 资料上传接口
router.post('/fileInfo/share', Middleware.AuthCheck,InformationController.fileDoCreate);

// 资料删除接口
router.put('/fileInfo/doDelete/:fid', Middleware.AuthCheck, InformationController.fileDoDelete);






/*
 * 页面范围: 安装服务
 * 控制器:   InstallServiceController
 * */
var InstallserviceController = require('./Controller/InstallserviceController');
// 待安装列表
router.get('/installService', Middleware.AuthCheck,InstallserviceController.installServicePage);
// 指定安装组
router.post('/installServiceTask/:tid/:did', Middleware.AuthCheck,InstallserviceController.getTask);

// 登记已收货
router.post('/registerDeliver/:tid', Middleware.AuthCheck,InstallserviceController.registerDeliver);


/*
 * 页面范围: 基础数据
 * 控制器:   SystemController
 * */
var SystemController = require('./Controller/SystemController');
// 首页
 router.get('/system', Middleware.AuthCheck,Middleware.SetBackPath,SystemController.indexPage);
 //与上面路由的区别是，三级菜单是用ejs来实现的
router.get('/systems', Middleware.AuthCheck,Middleware.SetBackPath,SystemController.indexPageO);

// 获取第二栏的可用内容
router.put('/systemEnabled/:key', Middleware.AuthCheck, SystemController.keyFirstPage);

// 获取第二栏的所有内容
router.put('/system/:key', Middleware.AuthCheck, SystemController.keyFirstALLPage);

// 新增值
router.post('/system/doCreate', Middleware.AuthCheck, SystemController.doCreate);

// 修改，删除，启用
router.post('/system/doModify', Middleware.AuthCheck, SystemController.doModify);

// 获取补单原因
router.put('/resupplyReason/:parentId', Middleware.AuthCheck, SystemController.resupplyReasonPage);

// 获取空间信息
router.put('/orderSpaceinfo/:parentId', Middleware.AuthCheck, SystemController.orderSpaceinfoPage);

// 获取空间信息二
router.put('/orderSpaceinfoTwo/:spaceId', Middleware.AuthCheck, SystemController.orderSpaceinfoTwoPage);

// 基础数据--清除缓存
router.get('/api/clearCache', Middleware.AuthCheck, SystemController.doClearCache);

// 获取物料单位二的内容
router.put('/assistantMaterialUnitTwo/:parentId', Middleware.AuthCheck, SystemController.assistantMaterialUnitPage);

// 获取包装类型二的内容
router.put('/assistantPackageTypeTwo/:parentId', Middleware.AuthCheck, SystemController.assistantPackageTypePage);

// 预警时间设置
router.get('/system/timeSet', Middleware.AuthCheck,SystemController.timeSetPage);

router.put('/system/timeSet/doSet', Middleware.AuthCheck,SystemController.doSetTime);

// 模板管理-页面
router.get('/system/template', Middleware.AuthCheck,SystemController.templatePage);
router.get('/system/template/modify/:type/:id', Middleware.AuthCheck,SystemController.modifyPage);

router.post('/system/template/doCreate', Middleware.AuthCheck, SystemController.templateCreate);
router.post('/system/template/doModify', Middleware.AuthCheck, SystemController.templateModify);
router.put('/system/template/doDelete/:id', Middleware.AuthCheck, SystemController.templateDelete);

// 测试打印接口
router.get('/system/printOut/:id', Middleware.AuthCheck,SystemController.printOut);

// 包装流水打印接口
router.get('/system/printPackageLid/:packageLid', Middleware.AuthCheck,SystemController.printPackageLid);

router.get('/system/printParts/:batchNumber/:factoryId', Middleware.AuthCheck,SystemController.printParts);

router.get('/system/delivery/:id', Middleware.AuthCheck,SystemController.printDelivery);


// 系数(用来计算零售价和出厂价)配置首页
router.get('/param', Middleware.AuthCheck, SystemController.paramShowPage);

// 系数配置页面
router.get('/param/set', Middleware.AuthCheck, SystemController.paramSetPage);

// 提交系数配置的数据接口
router.post('/param/doParam', Middleware.AuthCheck, SystemController.doParam);

/*
 * 页面范围: app接口
 * 控制器:   AppServiceController
 * */
var AppServiceController = require('./Controller/AppserviceController');

// 移动端登陆
router.post('/app/login',AppServiceController.doLogin);

// 刷新token
router.post('/app/refresh',AppServiceController.refreshToken);

// 出库-按照订单号查出包装
router.get('/app/cargoout/:tid',AppServiceController.cargooutPage);

// 出库-获取所有可出库的订单列表
router.get('/app/cargooutOrder',AppServiceController.cargooutOrder);

// 出库-已入库包装
router.get('/app/cargoin/package',AppServiceController.cargoinPackage);

// 出库-入库扫描完成后的显示界面
router.post('/app/cargoin/order',AppServiceController.cargoinOrder);

// 出库-入库扫描完成后的显示界面--pc端接口
// router.get('/web/cargoin/order',AppServiceController.cargoinOrderWeb);

// 入库-入库接口
router.post('/app/doCargoin',AppServiceController.doCargoin);

// 入库-出库接口
router.post('/app/doCargoout', AppServiceController.doCargoout);

// 某工厂下的仓储区域
router.get('/app/getWhse', AppServiceController.getWhse);

// 仓库是否已满
router.post('/app/isFull',AppServiceController.isFull);
router.post('/app/cargospace/find',AppServiceController.find);

// 备货-可备货订单
router.get('/app/stock', AppServiceController.getStock);

// 备货-备货按钮
router.post('/app/doStock',AppServiceController.doStock);

// 备货-备货扫描后，显示的界面
router.get('/app/stock/list', AppServiceController.getStockList);

router.get('/app/stock/permission', AppServiceController.permission);

// 获取包的类型
router.get('/app/packagetype', AppServiceController.packagetype);

router.get('/app/package/page', AppServiceController.packagePage);

// 已入库批次号
router.get('/app/cargoin/batch', AppServiceController.cargoinBatch);

// 已入库订单号
router.get('/app/cargoin/order/page', AppServiceController.cargoinOrderPage);

// 备货-显示所有可备货的发货通知单
router.get('/app/stock/delivery/all', AppServiceController.deliveryAll);
// 备货-显示自己可备货发货清单
router.get('/app/stock/delivery/own', AppServiceController.deliveryOwn);
// 备货-解锁发货通知单
router.post('/app/stock/unlock',AppServiceController.unlockStock);
// 备货-领取发货通知单
router.post('/app/stock/receive',AppServiceController.receiveStock);
// 备货-App可备货货订单
router.get('/app/stock/order', AppServiceController.orderStock);

router.get('/app/batchNumber/code', AppServiceController.batchNumberCode);


/*
* 页面范围: 报表管理
* 控制器:   ReportController
* */
var ReportController = require('./Controller/ReportController');

//分页查询订单物料计价
router.get('/orderMatPricing', Middleware.AuthCheck,Middleware.FilterEmptyField,ReportController.orderMatPricingPage);

//分页查询批次物料计价
router.get('/batchNumMatPricing', Middleware.AuthCheck,Middleware.FilterEmptyField,ReportController.batchNumMatPricingPage);

//分页查询订单计数
router.get('/orderCount', Middleware.AuthCheck,Middleware.FilterEmptyField,ReportController.orderCountPage);

//订单计数详情
router.get('/orderCount/detail', Middleware.AuthCheck,Middleware.FilterEmptyField,ReportController.orderCountDetailPage);

//领料单
router.get('/pickMateRep', Middleware.AuthCheck,Middleware.FilterEmptyField,ReportController.pickMateRepPage);

//出库
router.get('/outMateRep', Middleware.AuthCheck,Middleware.FilterEmptyField,ReportController.outMateRepPage);

//出库详情
router.get('/outMateRep/detail', Middleware.AuthCheck,Middleware.FilterEmptyField,ReportController.outMateRepDetailPage);

//入库
router.get('/inMateRep', Middleware.AuthCheck,Middleware.FilterEmptyField,ReportController.inMateRepPage);

//入库详情
router.get('/inMateRep/detail', Middleware.AuthCheck,Middleware.FilterEmptyField,ReportController.inMateRepDetailPage);


/*
 * 页面范围: 财务统计
 * 控制器:   FinancialStatisticsController
 * */
var FinancialStatisticsController = require('./Controller/FinancialStatisticsController');
//财务统计
router.get('/FinancialStatistics/index', Middleware.AuthCheck,Middleware.FilterEmptyField,FinancialStatisticsController.listPage);


module.exports = router;