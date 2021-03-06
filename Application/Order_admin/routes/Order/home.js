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

    res.locals.backPath = req.session.backPath;
    next();
});

// 错误或者正确信息处理
router.use(function (req, res, next) {

    if (req.session.DWY_message && ((new Date().getTime() - req.session.DWY_message.time) < 2000)) {
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
        req.session.preventAction = req.url;
        if(req.method.toLowerCase() == 'get'){
            // req.session.preventPath = req.path;

            if(!req.xhr){
                req.session.preventPath = req.url;
            }
            // console.log('preventPath',req.session.preventPath)
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
                    } else{
                        if(req[key][i] instanceof Array) return;
                        //  去掉首尾空字符 包括空格，制表符(Tab)，换行符，中文全角空格等
                        req[key][i] =  req[key][i].replace(/\s*$|^\s*/g,"")
                    }
                }
            }
        });

        next();
    },
    apiLimiter: new RateLimit({
        windowMs: 3*1000, // 时间段 1 秒
        max: 1, // 时间段内限制每个IP的请求数
        delayMs: 0 ,// 禁用延迟
        skip: function (req, res) {
            // if(req.method.toLowerCase() == 'get'){
            //     return true;
            // }
            if(req.session.preventAction != req.url){
                return true;
            }
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

//优惠券数据统计
router.get('/couponCount', Middleware.AuthCheck, IndexController.couponCountPage);


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
router.get('/customers', Middleware.AuthCheck, Middleware.FilterEmptyField,CustomerController.listPage);
router.get('/companyCustomers', Middleware.AuthCheck,  CustomerController.companyCustomersPage);
router.get('/networkCustomers', Middleware.AuthCheck,  CustomerController.networkCustomersPage);

// 获取客户详情页面
router.get('/customer/detail/:cid', Middleware.AuthCheck, CustomerController.detailPage);

router.post('/customer/assignStore', Middleware.AuthCheck, CustomerController.assignStore);

/*
 * 页面范围: 订单相关
 * 控制器:   OrderController
 * */
var OrderController = require('./Controller/OrderController');


// 订单页面
router.get('/orders', Middleware.AuthCheck,Middleware.FilterEmptyField, OrderController.listPage);

// 导出订单清单
router.post('/orders/export/order',Middleware.AuthCheck,OrderController.exportOrder);
// 导出补单清单
router.post('/orders/export/resupply',Middleware.AuthCheck,OrderController.exportResupply);

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

// 修改精确价格
router.post('/orders/getExactPriceInfo/modify', Middleware.AuthCheck, OrderController.modifyExactPriceInfo);

// 所有修改价格记录
router.get('/:type/priceLog/:tid', Middleware.AuthCheck, OrderController.priceLogAllPage);

// 所有退回信息页面
router.get('/:type/chgback/:tid', Middleware.AuthCheck, OrderController.chgbackeAllPage);
// 新增交流信息页面
router.get('/:type/communicate/create/:tid', Middleware.AuthCheck, OrderController.communicatePage);

// 所有交流信息页面
router.get('/:type/communicateAll/:tid', Middleware.AuthCheck, OrderController.communicateAllPage);
//所有日志信息页面
router.get('/:type/logAll/:tid', Middleware.AuthCheck, OrderController.logInfoAllPage);

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

//  订单加急页面
router.get('/order/urgent', Middleware.AuthCheck,Middleware.FilterEmptyField,Middleware.SetBackPath, OrderController.urgentPage);

//提交订单加急状态
router.post('/orders/urgent/updateUrgent',Middleware.AuthCheck,OrderController.updateOrderUrgent);
router.post('/orders/urgent/updateUrgent/updateDeliveryDate',Middleware.AuthCheck,OrderController.updateDeliveryDate);

// 订单排料页面
router.get('/orders/nesting', Middleware.AuthCheck,Middleware.FilterEmptyField,Middleware.SetBackPath, OrderController.nestingPage);
// 标记排料中
router.post('/orders/getNestingTask', Middleware.AuthCheck, OrderController.getNestingTask);
// 修改批次
router.post('/order/editBatchNum', Middleware.AuthCheck, OrderController.editBatchNum);

//子订单批量设置批次号
router.post('/order/chOrderEdit', Middleware.AuthCheck, OrderController.chOrderEditBatchNum);

//子订单批量修改批次号
router.post('/order/chOrderMod', Middleware.AuthCheck, OrderController.chOrderModBatchNum);

//获取子订单需设置批次号数量
router.get('/order/orderNumber/:tid', Middleware.AuthCheck, OrderController.getNumberInfo);
//获取子订单需修改批次号数量
router.get('/order/modOrderNumber/:tid', Middleware.AuthCheck, OrderController.getNumber);

// 标记为审核中 (待排料)
router.put('/schedule/getTask/:tid', Middleware.AuthCheck, OrderController.getTaskSchedule);

//排料中查看子订单
router.get('/order/nesting/childOrder/:tid', Middleware.AuthCheck,OrderController.childOrder);

// 解锁订单
router.put('/schedule/unlock/:tid', Middleware.AuthCheck, OrderController.doUnlockSchedule);

// 审核未通过（退单）
router.post('/schedule/notPass', Middleware.AuthCheck, OrderController.notPassSchedule);

router.post('/schedu/notPass', Middleware.AuthCheck, OrderController.notPassSche);

// 审核通过
router.put('/schedule/doPass/:tid', Middleware.AuthCheck, OrderController.doPassSchedule);

// 重新提交 (排料审核退回)
router.put('/schedule/getTaskAgain/:tid', Middleware.AuthCheck, OrderController.getTaskCheckAgain);


// 订单包装页面
router.get('/orders/package', Middleware.AuthCheck,Middleware.FilterEmptyField,OrderController.packagePage);
router.get('/orders/package/allInfo', Middleware.AuthCheck,Middleware.FilterEmptyField,Middleware.SetBackPath, OrderController.allInfoPage);

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

// 订单改价页面
router.get('/collection', Middleware.AuthCheck,Middleware.FilterEmptyField,Middleware.SetBackPath, OrderController.receiptMoneyPage);
//订单优惠券信息
router.get('/coupon/:tid', Middleware.AuthCheck,Middleware.FilterEmptyField, OrderController.coupon);

// 收款确认页面
router.get('/reconciliation', Middleware.AuthCheck,Middleware.FilterEmptyField,Middleware.SetBackPath, OrderController.confirmMoneyPage);
//导出收款列表
router.post('/export/receipt', Middleware.AuthCheck,Middleware.FilterEmptyField, OrderController.exportReceipt);

// 付款\
router.post('/collection/receiptCheck', Middleware.AuthCheck, OrderController.receiptCheck);
// 确认收款--订单收款
router.post('/collection/receiptCheck/pass', Middleware.AuthCheck, OrderController.receiptCheckPass);
// 确认收款--收款确认
router.post('/collection/receiptCheck/confirm', Middleware.AuthCheck, OrderController.receiptCheckConfirm);
// 审核不通过
router.post('/collection/receiptCheck/notpass', Middleware.AuthCheck, OrderController.receiptCheckNotPass);
// 对账
router.post('/collection/reconciliation', Middleware.AuthCheck, OrderController.reconciliation);
//对账退回
router.post('/collection/reconciliation/notPass', Middleware.AuthCheck, OrderController.reconciliationNotPass);
// 撤销付款
router.post('/reconciliation/cancel', Middleware.AuthCheck, OrderController.reconciliationCancle);

// 批次号管理
router.get('/orders/batchNumber', Middleware.AuthCheck,Middleware.SetBackPath,OrderController.batchPage);
router.get('/orders/batchNumber/detail/:batchNumber/:factoryId', Middleware.AuthCheck, OrderController.batchDetail);
router.post('/orders/heap', Middleware.AuthCheck, OrderController.batchHeap);

router.post('/orders/batchNumber/downloadZip', Middleware.AuthCheck, OrderController.downloadZip);
router.post('/orders/batchNumber/downloadZipProject', Middleware.AuthCheck, OrderController.downloadZipProject);
router.get('/orders/batchNumber/downloadProject/:batchNumber/:factoryId', Middleware.AuthCheck, OrderController.downloadZipProject);
router.get('/orders/batchNumber/downloadPackage/:batchNumber/:factoryId', Middleware.AuthCheck, OrderController.downloadPackage);
router.get('/orders/batchNumber/downloadAccessory/:batchNumber/:factoryId', Middleware.AuthCheck, OrderController.downloadAccessory);

// 生成包装操作
router.post('/orders/batchNumber/package/packet', Middleware.apiLimiter,Middleware.AuthCheck,OrderController.doPacketBatchNumber);
// 撤销包装操作
router.post('/orders/batchNumber/unpacket/packet', Middleware.apiLimiter,Middleware.AuthCheck,OrderController.doUnpacketBatchNumber);
router.post('/orders/batchNumber/schedule', Middleware.apiLimiter,Middleware.AuthCheck,OrderController.doScheduleBatchNumber);
router.post('/orders/batchNumber/files/number', Middleware.apiLimiter,Middleware.AuthCheck,OrderController.getBatchNumberFiles);
router.post('/orders/batchNumber/validation', Middleware.AuthCheck, OrderController.batchNumberValidation);

// 订单详情--重新编辑按钮
router.put('/orders/review/reEdit/:tid', Middleware.AuthCheck, OrderController.reEditReview);
router.put('/orders/apart/reEdit/:tid', Middleware.AuthCheck, OrderController.reEditApart);
router.put('/orders/apartReview/reEdit/:tid', Middleware.AuthCheck, OrderController.reEditApartReview);
// 补单详情--重新编辑按钮
router.put('/resupply/review/reEdit/:tid', Middleware.AuthCheck, OrderController.reEditReviewResupply);
router.put('/resupply/apart/reEdit/:tid', Middleware.AuthCheck, OrderController.reEditApartResupply);
router.put('/resupply/apartReview/reEdit/:tid', Middleware.AuthCheck, OrderController.reEditApartReviewResupply);

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

//确认拆单
router.post('/apart/doPass/byApart', Middleware.AuthCheck, ApartController.doPassByApartOrder);

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
router.get('/storesManage', Middleware.AuthCheck,Middleware.FilterEmptyField,Middleware.SetBackPath, StoresController.listPage);

// 门店详情页面
router.get('/storesManage/detail/:cid', Middleware.AuthCheck, StoresController.detailPage);

//门店账户信息导出
router.get('/storeManage/export/:bid', Middleware.AuthCheck,StoresController.exportAccounts);

// 门店详情页面-充值
router.post('/storesManage/doRecharge', Middleware.AuthCheck, StoresController.doRecharge);
//修改
router.post('/storesManage/editRecharge', Middleware.AuthCheck, StoresController.editRecharge);


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

//  门店详情-配置价格系数按钮
router.get('/storesManage/paramIndex/:cid', Middleware.AuthCheck, StoresController.paramIndexPage);

// 提交价格系数配置
router.post('/storesManage/doParam',Middleware.AuthCheck,StoresController.doParam);

// 导出门店列表
router.post('/storesManage/export',Middleware.AuthCheck,StoresController.exportStoreList);

//绑定所有积分联盟员工至积分联盟
router.post('/store/user/regIntegration', Middleware.AuthCheck, StoresController.regIntegration);


/*
 * 页面范围: 物料管理相关
 * 控制器:   MaterialController
 * */
var  MaterialController = require('./Controller/MaterialController');

// 物料管理首页
router.get('/materialManage', Middleware.AuthCheck,Middleware.FilterEmptyField,Middleware.SetBackPath,MaterialController.indexPage);


router.post('/materials/export', Middleware.AuthCheck,Middleware.FilterEmptyField,MaterialController.export);
router.get('/materials/export/download', Middleware.AuthCheck,Middleware.FilterEmptyField,MaterialController.exportDownload);

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
router.get('/:type/cargospace/detail/:spaceId', Middleware.AuthCheck, Middleware.SetBackPath, CargospaceController.detailPage);

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
router.put('/enterMaterial/doPass/:inId/:stcode/:purId/:inMode', Middleware.AuthCheck, EnterController.doPassMaterial);
router.put('/enterMaterial/doPass/:inId/:stcode/:inMode', Middleware.AuthCheck, EnterController.doPassMaterial);

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

//原料入库-选取物料
router.get('/enterMaterial/selectMate', Middleware.AuthCheck, EnterController.selectMatePage);


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
router.get('/delivery/tidList/:cid',OutWarehouseController.deliveryTidList);

// 发货通知单页面
router.post('/doDelivery', Middleware.apiLimiter,Middleware.AuthCheck,  OutWarehouseController.doDelivery);

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

// 将货位中可以备货的包，订单，流水都备货
router.post('/productOut/spaceid/stock', Middleware.AuthCheck, OutWarehouseController.productOutsSpaceidStock);

// 将货位中可以备货的包，订单，流水都取消备货
router.post('/productOut/spaceid/stockCancel', Middleware.AuthCheck, OutWarehouseController.productOutsSpaceidStockCancel);

// 大板领料单页面
router.get('/outBred', Middleware.AuthCheck, OutWarehouseController.outBredPage);

// 大板领料单-导入
router.post('/outBred/upload', Middleware.AuthCheck, OutWarehouseController.outBredUpload);

// 领料单--选取物料
router.get('/outBred/mateSelect', Middleware.AuthCheck, OutWarehouseController.outBredMate);

// 大板领料详情单页面
router.get('/outBred/deatil/:id', Middleware.AuthCheck, OutWarehouseController.outBredDeatil);

// 可发货订单-审核
router.put('/outBred/doCheck/:id/:stcode', Middleware.AuthCheck, OutWarehouseController.doCheckBred);


router.post('/outBred/plateOut', Middleware.AuthCheck, OutWarehouseController.plateOut);
router.post('/outBred/accessoryOut', Middleware.AuthCheck, OutWarehouseController.accessoryOut);


router.post('/outBred/batchnumber/ifCan', Middleware.AuthCheck, OutWarehouseController.ifCanBatchnumber);
router.post('/outBred/cargo', Middleware.AuthCheck, OutWarehouseController.getCargo);

/*
 * 页面范围: 流水相关
 * 控制器:   TaskseqController
 * */
var TaskseqController = require('./Controller/TaskseqController');

// 获取登记流水记录
router.get('/taskseqs', Middleware.AuthCheck, Middleware.FilterEmptyField,TaskseqController.listPage);

// 流水详情
router.get('/taskseq/index/:lid', Middleware.AuthCheck, TaskseqController.indexPage);

// 新增交流信息页面
router.get('/taskseq/communicates/create/:lid', Middleware.AuthCheck,TaskseqController.communicatePage);

// 所有交流信息页面
router.get('/taskseq/communicatesAll/:lid', Middleware.AuthCheck,TaskseqController.communicateAllPage);

// 新增交流信息
router.post('/taskseq/communicates/doCreate', Middleware.AuthCheck,TaskseqController.doCreateCommunicate);

// 查看子订单
router.get('/taskseq/openMultiOrder/:tid', Middleware.AuthCheck, Middleware.SetBackPath,TaskseqController.openMultiOrder);

// 查看子订单--关闭子订单
router.post('/taskseq/openMultiOrder/close', Middleware.AuthCheck, TaskseqController.closeMultiOrder);

// 查看子订单--修改订单信息
router.post('/taskseq/openMultiOrder/modify', Middleware.AuthCheck, TaskseqController.modifyMultiOrder);

//修改流水详情收货人姓名/电话
router.post('/taskseq/modify/contact', Middleware.AuthCheck, TaskseqController.modifyContact);

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
//订单--文件--重新上传
router.post('/file/order/reSubmit', Middleware.AuthCheck, FileController.reSubmitFile);

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
router.post('/supplier/deleteRelate', Middleware.AuthCheck,SupplierController.deleteRelate);

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
router.post('/applyPurchases/del', Middleware.AuthCheck,PurchaseController.applyPurchaseDel);


// 采购详情
router.get('/purchase/detail', Middleware.AuthCheck,Middleware.FilterEmptyField,Middleware.SetBackPath,PurchaseController.purchaseDetail);
//财务查看采购
router.get('/purchase/detail/finance', Middleware.AuthCheck,Middleware.FilterEmptyField,Middleware.SetBackPath,PurchaseController.financePurchase);
// 生成采购单
router.post('/purchases/Order/:tid', Middleware.AuthCheck,PurchaseController.purchaseOrder);
// 采购单详情
router.get('/purchase/orderDetail/:tid', Middleware.AuthCheck,PurchaseController.purchaseOrderDetail);
// 采购单--下载文件
router.post('/purchase/orderDetail/downloadZip', Middleware.AuthCheck, PurchaseController.downloadPurchaseFileZip);
// 采购单详情--付款凭证上传type=10
router.post('/purchase/uploadProof', Middleware.AuthCheck,PurchaseController.uploadProof);

// 采购单详情--付款凭证上传type=30
router.post('/purchase/uploadProof2', Middleware.AuthCheck,PurchaseController.uploadProof2);

// 合并采购单
router.post('/purchases/merge', Middleware.AuthCheck,PurchaseController.purchaseMerge);
// 审核采购单
router.post('/purchases/review', Middleware.AuthCheck,PurchaseController.purchaseReview);
// 撤回采购单
router.post('/purchases/recall', Middleware.AuthCheck,PurchaseController.purchaseRecall);
// 提交采购单
router.post('/purchases/submit', Middleware.AuthCheck,PurchaseController.purchaseSubmit);
// 删除未审核采购单
router.post('/purchases/del', Middleware.AuthCheck,PurchaseController.purchaseDel);

// 打印采购单
router.get('/purchases/print/:purcIds', Middleware.AuthCheck,PurchaseController.printPurchase);

// 新建采购单页面
router.get('/purchase/create', Middleware.AuthCheck,Middleware.FilterEmptyField,PurchaseController.purchaseCreatePage);

// 新建采购单 选择物料信息列表
router.get('/purchase/orderMaterial', Middleware.AuthCheck,PurchaseController.purchaseMaterialCreat);

// 新建采购单 添加物料数量+预计交期
router.post('/purchase/materialCreate', Middleware.AuthCheck,PurchaseController.materialCreate);

// 请购——外协——导出
router.post('/outsource/export', Middleware.AuthCheck,PurchaseController.exportOutsource);

// 请购——外协——导出——获取供应商列表
router.get('/outsource/suppliers/:id', Middleware.AuthCheck,PurchaseController.suppliersOutsource);

// 采购——外协——导出
router.get('/purchase/export', Middleware.AuthCheck,PurchaseController.exportPurchase);

// 供应商上传文件
router.post('/purchases/suppfile/upload', Middleware.AuthCheck,PurchaseController.uploadSuppfile);

/*
 * 页面范围: 网络预约相关
 * 控制器:   networkBookController
 * */
var NetworkBookController = require('./Controller/NetworkBookController');

// 网络预约
router.get('/networkBook', Middleware.AuthCheck, Middleware.FilterEmptyField,Middleware.SetBackPath,NetworkBookController.indexPage);

// 门店列表
router.get('/storeListAreaId/:areaId', Middleware.AuthCheck, NetworkBookController.storeListPage);
//客户信息
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
 * 页面范围: 客户产品查询
 * 控制器:   CustomerProductController
 * */
var CustomerProductController = require('./Controller/CustomerProductController');

// 客户产品列表-菜单栏进入--不执行查询
router.get('/completeSet', Middleware.AuthCheck,CustomerProductController.customerProPage);

// 客户产品列表-执行查询
router.get('/orders/completeSet', Middleware.AuthCheck,Middleware.FilterEmptyField,CustomerProductController.customerProListPage);

// 齐套查询--未上架页面
router.get('/orders/completeSet/unshelf', Middleware.AuthCheck,Middleware.FilterEmptyField,CustomerProductController.unshelfPage);
//导出
router.get('/orders/completeSet/export', Middleware.AuthCheck,Middleware.FilterEmptyField,CustomerProductController.unshelfExport);


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
 // 与上面路由的区别是，三级菜单是用ejs来实现的
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
router.get('/system/clearCache', Middleware.AuthCheck, SystemController.doClearCache);

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
router.get('/system/printParts/ajax/:batchNumber/:factoryId', Middleware.AuthCheck,SystemController.printPartsAjax);

router.get('/system/delivery/:id', Middleware.AuthCheck,SystemController.printDelivery);


router.get('/system/purcPackagelist/:purcId', Middleware.AuthCheck,SystemController.printPurcPackagelist);


// 系数(用来计算零售价和出厂价)配置首页
router.get('/param', Middleware.AuthCheck, SystemController.paramShowPage);

// 系数配置页面
router.get('/param/set', Middleware.AuthCheck, SystemController.paramSetPage);

// 提交系数配置的数据接口
router.post('/param/doParam', Middleware.AuthCheck, SystemController.doParam);

//查询间隔天数添加
router.post('/param/doCreate', Middleware.AuthCheck, SystemController.doParamCreate);

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
//包装出入库情况查询
router.get('/app/cargooutFind',AppServiceController.getWhseSel);

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

// 判断某包装是否可以被入库扫描
router.post('/app/cargoin/inscan/:packId',AppServiceController.cargoinInscan);
// 分页查看入库扫描所属的订单
router.get('/app/cargoin/page', AppServiceController.cargoinPage);
// 以包装大类为条件分页查找包装
router.get('/app/cargoin/page/classify', AppServiceController.cargoinPageClassify);
// 分页查看某订单的已扫入库包号
router.get('/app/cargoin/page/tid', AppServiceController.cargoinPageTid);
// 显示table包装大类
router.get('/app/cargoin/table', AppServiceController.cargoinTable);
//
router.post('/app/cargoin/cancel/:id',AppServiceController.cargoinCancel);

// 是否需要重新分配货位
router.post('/app/cargoin/dealCargoin', AppServiceController.dealCargoin);
// 扫描已下架货笼
router.post('/app/cargoin/unShelve', AppServiceController.unShelve);
// 已扫描货笼显示分配界面
router.post('/app/cargoin/unShelveShow', AppServiceController.unShelveShow);
// 扫描货位
router.post('/app/cargoin/scanCargoin', AppServiceController.scanCargoin);
// 取消扫描
router.post('/app/cargoin/cancelScan', AppServiceController.cancelScanCargoin);
// 待上架
router.post('/app/cargoin/waitRacking', AppServiceController.waitRacking);
// 入库确认上架
router.post('/app/cargoin/confirmRacking', AppServiceController.confirmRacking);
// 入库时取消上架
router.post('/app/cargoin/cancelRacking', AppServiceController.cancelRacking);
// 已扫描已入库但是已上架的包所属的货位
router.get('/app/cargoin/shelvesSpace', AppServiceController.shelvesSpacePage);
// 已扫描已入库但是未上架的包所属的货位
router.get('/app/cargoin/shelvesSpaceId', AppServiceController.shelvesSpace);
// 扫描包装流水号，显示货位号
router.get('/app/cargoin/lidCargoShow/:packageLid', AppServiceController.lidCargoShow);
// 订单货位查看功能
router.get('/app/cargoin/orderCargoShow/:tid', AppServiceController.orderCargoShow);
// 查看货位的上架下架等情况
router.get('/app/cargoin/offshelvesShow/:offshelves', AppServiceController.offshelvesShow);

// 按订单号查询批次下的
router.get('/app/cargoin/findBatchnumber/:batid', AppServiceController.findBatchnumber);
// 按订单号查询批次某流水下的
router.get('/app/cargoin/findLid/:lid', AppServiceController.findLid);
// 按订单号查询批次流水某订单下的
router.get('/app/cargoin/findTid/:tid', AppServiceController.findTid);
// 订单号查找未入库状态下的包装数量
router.get('/app/cargoin/notinInfo/:tid', AppServiceController.notinInfo);

// 入库-货位扫描
router.post('/app/cargoin/scanningCargoin/:spaceId', AppServiceController.scanningCargoin);
// 货物扫描
router.post('/app/cargoin/goodsScanCargoin/:packageLid', AppServiceController.scanningGoods);
// 扫描后查询订单流水包装状态
router.get('/app/cargoin/allList', AppServiceController.orderTaskStatusCargo);
// 入库操作是显示流水订单包装状态
router.get('/app/cargoin/scanList', AppServiceController.orderTaskPackageCargo);
// 取消货物的扫描
router.post('/app/cargoin/goodsScanCancel', AppServiceController.goodsScanCancle);
//货物入库且货位待上架
router.post('/app/cargoin/cargoinRacking', AppServiceController.cargoinRacking);

// 移库扫描包
router.post('/app/cargoin/cargoMovingPack', AppServiceController.cargoMovingPack);
// 移库扫描货位
router.post('/app/cargoin/cargoMoving', AppServiceController.cargoMoving);
// 移库显示移库包装列表
router.get('/app/cargoin/moveShowPacklist', AppServiceController.moveShowPacklist);
// 移库包装落位
router.post('/app/cargoin/cargoPostingup', AppServiceController.cargoPostingup);


router.post('/app/orders/sort/view', AppServiceController.sortView);
router.get('/app/orders/sort/batchNumber', AppServiceController.sortBatchNumber);
router.get('/app/orders/sort/list', AppServiceController.sortList);
router.get('/app/orders/sort/workPiece', AppServiceController.sortWorkPiece);
router.get('/app/orders/sort/workPiece/scaned', AppServiceController.sortWorkPieceScaned);


router.get('/app/cargoin/shelves/space/:id', AppServiceController.cargoinShelvesSpace);
// 移库-移库扫描货位
router.get('/app/change/space/:id', AppServiceController.changeSpace);
// 移库-移库
router.post('/app/doChange/space', AppServiceController.doChangeSpace);

router.get('/app/change/spaceScan/:id', AppServiceController.changeSpaceScan);

// 备货-从一个发货清单点入后显示的货位信息
router.get('/app/stock/spaceid/:id', AppServiceController.stockSpace);
// 备货-自己的可备货发货清单（已完成的）
router.get('/app/stock/stockup/own', AppServiceController.stockupOwn);
// 备货-将货位中可以备货的包，订单，流水都备货
router.post('/app/stock/space', AppServiceController.doSpaceStock);
// 备货-将货位中可以备货的包，订单，流水都取消备货
router.post('/app/stock/space/cancel', AppServiceController.cancelSpaceStock);

// 出库-列出可以出库的发货清单
router.get('/app/cargout/prod/delivery', AppServiceController.cargoutProdDelivery);
// 出库-按照发货通知单查找订单号
router.get('/app/cargout/prod/out/delivery', AppServiceController.cargoutProdOutDelivery);
// 出库-按照发货通知单找出可发货货订单
router.get('/app/cargoout/order/list/:id', AppServiceController.cargoutOrderList);
// 出库-按照订单号查出包装
router.get('/app/cargoout/package/list/:id', AppServiceController.cargoutPackageList);
// 出库-出库
router.post('/app/cargoout/prod', AppServiceController.cargooutProd);
// 出库-出库回退
router.post('/app/cargoout/prod/clean', AppServiceController.cargooutProdClean);

router.get('/app/cargout/package/diId/:id', AppServiceController.cargoutPackageDiId);
router.post('/app/doChange/space/info', AppServiceController.doChangeSpaceInfo);

//app版本相关
router.get('/appVersion', AppServiceController.appVersionInfo);

router.post('/app/modifyVersion',Middleware.AuthCheck,Middleware.FilterEmptyField, AppServiceController.modifyAppVersion);

router.post('/app/modifyPath',Middleware.AuthCheck,Middleware.FilterEmptyField, AppServiceController.modifyAppPath);

/*
* 页面范围: 报表管理
* 控制器:   ReportController
* */
var ReportController = require('./Controller/ReportController');

// 报表管理
router.get('/report', Middleware.AuthCheck,Middleware.FilterEmptyField,ReportController.reportPage);

// 分页查询订单物料计价
router.get('/orderMatPricing', Middleware.AuthCheck,Middleware.FilterEmptyField,ReportController.orderMatPricingPage);

// 分页查询批次物料计价
router.get('/batchNumMatPricing', Middleware.AuthCheck,Middleware.FilterEmptyField,ReportController.batchNumMatPricingPage);

// 分页查询五金汇总
router.get('/orderCount', Middleware.AuthCheck,Middleware.FilterEmptyField,ReportController.orderCountPage);

// 订单计数详情
router.get('/orderCount/detail', Middleware.AuthCheck,Middleware.FilterEmptyField,ReportController.orderCountDetailPage);

// 领料单
router.get('/pickMateRep', Middleware.AuthCheck,Middleware.FilterEmptyField,ReportController.pickMateRepPage);

// 出库
router.get('/outMateRep', Middleware.AuthCheck,Middleware.FilterEmptyField,ReportController.outMateRepPage);

// 出库详情
router.get('/outMateRep/detail', Middleware.AuthCheck,Middleware.FilterEmptyField,ReportController.outMateRepDetailPage);

// 入库
router.get('/inMateRep', Middleware.AuthCheck,Middleware.FilterEmptyField,ReportController.inMateRepPage);

// 入库详情
router.get('/inMateRep/detail', Middleware.AuthCheck,Middleware.FilterEmptyField,ReportController.inMateRepDetailPage);

// 分页查询--门店设计师统计
router.get('/storeRep', Middleware.AuthCheck,Middleware.FilterEmptyField,ReportController.storeRepPage);
//家居顾问
router.get('/storeRepAdviser', Middleware.AuthCheck,Middleware.FilterEmptyField,ReportController.storeRepAdviser);
//查房统计
router.get('/storeRepWard', Middleware.AuthCheck,Middleware.FilterEmptyField,ReportController.storeRepWard);

// 展示成交客户的流水号
router.get('/showTaskseq/:worker/:type/:gid', Middleware.AuthCheck,ReportController.showTaskseqPage);

// 任务计划
router.get('/taskPlan', Middleware.AuthCheck,Middleware.FilterEmptyField,ReportController.taskPlanPage);

// 执行某任务计划
router.post('/doTaskPlan',Middleware.AuthCheck,ReportController.doTaskPlan);

// 按月查询物料计价
router.get('/pageBatchByMonth', Middleware.AuthCheck,Middleware.FilterEmptyField,ReportController.pageBatchByMonth);

// 按月查询五金汇总
router.get('/pageAccessoryByMonth', Middleware.AuthCheck,Middleware.FilterEmptyField,ReportController.pageAccessoryByMonth);

// 订单来源分类报表
router.get('/report/order/source', Middleware.AuthCheck,Middleware.FilterEmptyField,ReportController.reportOrderSource);

// 订单状态分类报表
router.get('/report/order/state', Middleware.AuthCheck,Middleware.FilterEmptyField,ReportController.reportOrderState);

//生产明细报表--审单
router.get('/report/order/product_detail', Middleware.AuthCheck,Middleware.FilterEmptyField,ReportController.productDetailOrder);

//生产明细报表--拆单
router.get('/report/order/separate_bill', Middleware.AuthCheck,Middleware.FilterEmptyField,ReportController.separateBillOrder);

//生产明细报表--拆审
router.get('/report/order/remove_trial', Middleware.AuthCheck,Middleware.FilterEmptyField,ReportController.removeTrialOrder);

//生产明细报表--排料
router.get('/report/order/nesting', Middleware.AuthCheck,Middleware.FilterEmptyField,ReportController.nestingOrder);

//生产明细报表--退单明细
router.get('/report/order/chargeback', Middleware.AuthCheck,Middleware.FilterEmptyField,ReportController.chargeBackOrder);

//导出--生产明细报表--审单
router.post('/report/order/export/product_detail', Middleware.AuthCheck,Middleware.FilterEmptyField,ReportController.exportProductDetail);

//导出--生产明细报表--拆单
router.post('/report/order/export/separate_bill', Middleware.AuthCheck,Middleware.FilterEmptyField,ReportController.exportSeparateBill);

//导出--生产明细报表--拆审
router.post('/report/order/export/remove_trial', Middleware.AuthCheck,Middleware.FilterEmptyField,ReportController.exportRemoveTrial);

//导出--生产明细报表--排料
router.post('/report/order/export/nesting', Middleware.AuthCheck,Middleware.FilterEmptyField,ReportController.exportNesting);

//导出--生产明细报表--退单明细
router.post('/report/order/export/chargeback', Middleware.AuthCheck,Middleware.FilterEmptyField,ReportController.exportChargeBack);




//半成品仓库收发存明细
router.get('/report/order/semiPro', Middleware.AuthCheck,Middleware.FilterEmptyField,ReportController.reportOrderSemiPro);

//成品仓库收发存明细
router.get('/report/order/finishPro', Middleware.AuthCheck,Middleware.FilterEmptyField,ReportController.reportOrderfinishPro);

//导出-半成品仓库收发存
router.post('/report/order/export/semiPro', Middleware.AuthCheck,Middleware.FilterEmptyField,ReportController.exportSemiPro);

//导出-成品仓库收发存
router.post('/report/order/export/finishPro', Middleware.AuthCheck,Middleware.FilterEmptyField,ReportController.exportFinishPro);






// 门店补单率
router.get('/report/suppRate/store', Middleware.AuthCheck,Middleware.FilterEmptyField,ReportController.suppRateStore);

// 下单员补单率
router.get('/report/suppRate/orderPeople', Middleware.AuthCheck,Middleware.FilterEmptyField,ReportController.suppRateOrderPeople);

// 部门成本率
router.get('/report/costRate/depart', Middleware.AuthCheck,Middleware.FilterEmptyField,ReportController.costRateDepart);

// 门店对账单报表
router.get('/report/store/cashFlow', Middleware.AuthCheck,Middleware.FilterEmptyField,ReportController.cashFlowPage);
// 导出门店对账单
router.post('/orders/export/cashFlow',Middleware.AuthCheck,ReportController.exportcashFlow);

// 门店销量报表
router.get('/report/store/sales', Middleware.AuthCheck,Middleware.FilterEmptyField,ReportController.storeSalesPage);
//销售区域报表
router.get('/report/store/salesAreas', Middleware.AuthCheck,Middleware.FilterEmptyField,ReportController.storeSalesAreasPage);

// 排料工件报表
router.get('/report/factory/workpiece_nesting', Middleware.AuthCheck,Middleware.FilterEmptyField,ReportController.workpieceNestingPage);


// 拆单工件报表
router.get('/report/factory/workpiece_apart', Middleware.AuthCheck,Middleware.FilterEmptyField,ReportController.workpieceApartPage);
// 导出--拆单工件报表
router.post('/report/factory/export/workpiece_apart', Middleware.AuthCheck,Middleware.FilterEmptyField,ReportController.exportWorkpieceApart);

// 拆单工件汇总
router.get('/report/factory/workpieceApart/all', Middleware.AuthCheck,Middleware.FilterEmptyField,ReportController.workpieceApartAllPage);
// 导出--拆单工件汇总
router.post('/report/factory/export/workpiece_apart_all', Middleware.AuthCheck,Middleware.FilterEmptyField,ReportController.exportWorkpieceApartAll);


// 导出--排料工件报表
router.post('/report/factory/export/workpiece_nesting', Middleware.AuthCheck,Middleware.FilterEmptyField,ReportController.exportWorkpieceNesting);

// 排料工件汇总报表
router.get('/report/factory/workpieceNesting/all', Middleware.AuthCheck,Middleware.FilterEmptyField,ReportController.workpieceNestingAllPage);

// 导出--排料工件汇总报表
router.post('/report/factory/export/workpiece_nesting_all', Middleware.AuthCheck,Middleware.FilterEmptyField,ReportController.exportWorkpieceNestingAll);

// 排料配件报表
router.get('/report/factory/part_nesting', Middleware.AuthCheck,Middleware.FilterEmptyField,ReportController.partNestingPage);

// 导出--排料配件报表
router.post('/report/factory/export/part_nesting', Middleware.AuthCheck,Middleware.FilterEmptyField,ReportController.exportPartNesting);

// 排料配件汇总报表
router.get('/report/factory/partNesting/all', Middleware.AuthCheck,Middleware.FilterEmptyField,ReportController.partNestingAllPage);

// 导出--排料配件汇总报表
router.post('/report/factory/export/part_nesting_all', Middleware.AuthCheck,Middleware.FilterEmptyField,ReportController.exportPartNestingAll);

// 拆单配件报表
router.get('/report/factory/part_apart', Middleware.AuthCheck,Middleware.FilterEmptyField,ReportController.partApartPage);

// 导出--拆单配件报表
router.post('/report/factory/export/part_apart', Middleware.AuthCheck,Middleware.FilterEmptyField,ReportController.exportPartApart);

// 拆单配件汇总报表
router.get('/report/factory/partApart/all', Middleware.AuthCheck,Middleware.FilterEmptyField,ReportController.partApartAllPage);

// 导出--拆单配件汇总报表
router.post('/report/factory/export/part_apart_all', Middleware.AuthCheck,Middleware.FilterEmptyField,ReportController.exportPartApartAll);

//订单改价
router.get('/report/factory/modify_price', Middleware.AuthCheck,Middleware.FilterEmptyField,ReportController.modifyPricePage);

//订单改价导出
router.post('/report/factory/export/modify_price', Middleware.AuthCheck,Middleware.FilterEmptyField,ReportController.exportModifyPrice);

// 图形报表
router.get('/echart/:type', Middleware.AuthCheck,Middleware.FilterEmptyField,ReportController.echart);

//导出--订单来源报表
router.post('/report/order/export/order_source', Middleware.AuthCheck,Middleware.FilterEmptyField,ReportController.exportOrderSource);

//导出--设计师成交情况
router.post('/report/store/export/designer', Middleware.AuthCheck,Middleware.FilterEmptyField,ReportController.exportStoreDesigner);

//导出--家居顾问成交情况
router.post('/report/store/export/adviser', Middleware.AuthCheck,Middleware.FilterEmptyField,ReportController.exportStoreAdviser);

//导出--查房成交情况
router.post('/report/store/export/ward', Middleware.AuthCheck,Middleware.FilterEmptyField,ReportController.exportStoreWard);

//导出--门店补单率
router.post('/report/store/export/conditions', Middleware.AuthCheck,Middleware.FilterEmptyField,ReportController.exportStoreConditions);

//导出--下单员补单率
router.post('/report/store/export/employeeResupplyRate', Middleware.AuthCheck,Middleware.FilterEmptyField,ReportController.employeeResupplyRate);

//导出--部门成本率
router.post('/report/store/export/departmentResupplyRate', Middleware.AuthCheck,Middleware.FilterEmptyField,ReportController.departmentResupplyRate);

//导出--门店销售
router.post('/report/store/export/storeSales', Middleware.AuthCheck,Middleware.FilterEmptyField,ReportController.storeSales);
//导出--门店销售区域统计
router.post('/report/store/export/storeSalesAreas', Middleware.AuthCheck,Middleware.FilterEmptyField,ReportController.storeSalesAreas);

//导出--批次物料计价
router.post('/report/factory/export/batchMaterPrice', Middleware.AuthCheck,Middleware.FilterEmptyField,ReportController.batchMaterPrice);

//导出--订单物料计价
router.post('/report/factory/export/orderMaterPrice', Middleware.AuthCheck,Middleware.FilterEmptyField,ReportController.orderMaterPrice);

//导出--物料计价（按月）
router.post('/report/factory/export/materPriceMonth', Middleware.AuthCheck,Middleware.FilterEmptyField,ReportController.materPriceMonth);

//导出--五金汇总
router.post('/report/factory/export/accessoryTotal', Middleware.AuthCheck,Middleware.FilterEmptyField,ReportController.accessoryTotal);

//导出--五金汇总按月
router.post('/report/factory/export/accessoryTotalMonth', Middleware.AuthCheck,Middleware.FilterEmptyField,ReportController.accessoryTotalMonth);

//导出--领料单
router.post('/report/factory/export/materialRequisition', Middleware.AuthCheck,Middleware.FilterEmptyField,ReportController.materialRequisition);

//导出--出库
router.post('/report/factory/export/mateOut', Middleware.AuthCheck,Middleware.FilterEmptyField,ReportController.mateOut);

//导出--入库
router.post('/report/factory/export/mateIn', Middleware.AuthCheck,Middleware.FilterEmptyField,ReportController.mateIn);





/*
 * 页面范围: 财务统计
 * 控制器:   FinancialStatisticsController
 * */
var FinancialStatisticsController = require('./Controller/FinancialStatisticsController');
//财务统计
router.get('/FinancialStatistics/index', Middleware.AuthCheck,Middleware.FilterEmptyField,FinancialStatisticsController.listPage);




/*
 * 页面范围: 短信相关
 * 控制器:   MessageController
 * */
var MessageController = require('./Controller/MessageController');

// 短信页面
router.get('/message', Middleware.AuthCheck, MessageController.listPage);
//获取门店列表
router.get('/storeList', Middleware.AuthCheck,Middleware.SetBackPath, MessageController.storelistPage);
//获取角色列表
router.get('/roleMsgList', Middleware.AuthCheck,Middleware.SetBackPath, MessageController.roleMsgListPage);
//点击门店获取部门
router.get('/dept/:sid', Middleware.AuthCheck, MessageController.getDepartList);
//点击获取员工列表
router.get('/employee/:sid/:did', Middleware.AuthCheck, MessageController.getEmployeeList);
//选择员工发送短信
router.post('/msg/selectStore', Middleware.AuthCheck, MessageController.selectEmployees);
router.post('/msg/removeGid', Middleware.AuthCheck, MessageController.removeGid);
router.post('/msg/selectRoles', Middleware.AuthCheck, MessageController.selectRoles);
module.exports = router;