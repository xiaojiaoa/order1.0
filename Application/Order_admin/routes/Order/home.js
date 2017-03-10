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
        if(req.method.toLowerCase() == 'get'){
            req.session.preventPath = req.path;
        }
        // console.log(req.path)
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
router.put('/orders/getTask/:tid', Middleware.AuthCheck, OrderController.getTask);
// 解锁订单
router.put('/orders/unlock/:tid', Middleware.AuthCheck, OrderController.doUnlock);

// 审核未通过（退单）
router.post('/orders/notPass', Middleware.AuthCheck, OrderController.notPass);
// 审核通过
router.post('/orders/doPass', Middleware.AuthCheck, OrderController.doPass);
// 设置难度等级
router.post('/orders/updateDifficultyLevel', Middleware.AuthCheck, OrderController.updateDifficultyLevel);

// 所有退回信息页面
router.get('/order/chgback/:tid', Middleware.AuthCheck, OrderController.chgbackeAllPage);
// 新增交流信息页面
router.get('/order/communicate/create/:tid', Middleware.AuthCheck, OrderController.communicatePage);

// 所有交流信息页面
router.get('/order/communicateAll/:tid', Middleware.AuthCheck, OrderController.communicateAllPage);

// 新增交流信息
router.post('/order/communicate/doCreate', Middleware.AuthCheck, OrderController.doCreateCommunicate);

// 补单页面
router.get('/orders/resupplys', Middleware.AuthCheck, Middleware.FilterEmptyField, OrderController.resupplyPage);

// 补单受理页面
router.get('/orders/resupplys/accept', Middleware.AuthCheck, Middleware.FilterEmptyField, OrderController.acceptPage);

// 标记为审核中
router.put('/resupplys/getTask/:tid', Middleware.AuthCheck, OrderController.getTaskResupplys);
// 解锁补单
router.put('/resupplys/unlock/:tid', Middleware.AuthCheck, OrderController.doUnlockResupplys);

// 审核未通过（退单）
router.post('/resupplys/notPass', Middleware.AuthCheck, OrderController.notPassResupplys);
// 审核通过
router.post('/resupplys/doPass', Middleware.AuthCheck, OrderController.doPassResupplys);

// 补单拆单页面
router.get('/orders/resupplys/apart', Middleware.AuthCheck, Middleware.FilterEmptyField, OrderController.apartPage);

// 标记为审核中 (待拆单)
// router.put('/resupplys/apart/getTask/:tid', Middleware.AuthCheck, OrderController.getTaskReApart);

// 解锁订单
// router.put('/resupplys/apart/unlock/:tid', Middleware.AuthCheck, OrderController.doUnlockReApart);

// 审核未通过（退单）
router.post('/resupplys/apart/notPass', Middleware.AuthCheck, OrderController.notPassReApart);

// 审核通过
// router.put('/resupplys/apart/doPass/:tid', Middleware.AuthCheck, OrderController.doPassReApart);

// 补单拆单审核页面
router.get('/orders/resupplys/apartCheck', Middleware.AuthCheck, Middleware.FilterEmptyField, OrderController.apartCheckPage);

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
router.get('/order/check/:type', Middleware.AuthCheck, OrderController.checkPage);

//  订单流程记录页面
router.get('/order/process', Middleware.AuthCheck, OrderController.processPage);

//  订单许可页面
router.get('/order/permit', Middleware.AuthCheck, OrderController.permitPage);

// 订单排料页面
router.get('/orders/nesting', Middleware.AuthCheck, OrderController.nestingPage);
//标记排料中页面
router.post('/orders/getNestingTask/:cid', Middleware.AuthCheck, OrderController.getNestingTask);
//修改批次页面
router.post('/order/editBatchNum/:cid/:bid', Middleware.AuthCheck, OrderController.editBatchNum);
// 标记为审核中 (待排料)
router.put('/schedule/getTask/:tid', Middleware.AuthCheck, OrderController.getTaskSchedule);

// 解锁订单
router.put('/schedule/unlock/:tid', Middleware.AuthCheck, OrderController.doUnlockSchedule);

// 审核未通过（退单）
router.post('/schedule/notPass', Middleware.AuthCheck, OrderController.notPassSchedule);

// 审核通过
router.put('/schedule/doPass/:tid', Middleware.AuthCheck, OrderController.doPassSchedule);

// 订单包装页面
router.get('/orders/package', Middleware.AuthCheck,Middleware.FilterEmptyField,OrderController.packagePage);

//查询订单生成包装后的包装列表
router.get('/orders/package/:tid', Middleware.AuthCheck,OrderController.packedListPage);

//获取包装清单数据
router.get('/orders/package/pcaketlist/:tid/:pid/:type', Middleware.AuthCheck,OrderController.packedListDetailPage);

//撤销包装
router.put('/orders/package/unpacket/:tid', Middleware.AuthCheck,OrderController.unpacket);

//生成分包
router.put('/orders/package/packet/:tid',Middleware.AuthCheck,OrderController.doPacket);


//订单详情--订单物料--非标件
router.get('/order/workpiece/:tid',Middleware.AuthCheck,OrderController.workpiecePage);
//订单详情--订单物料--配件
 router.get('/order/materiel_modal/:tid',Middleware.AuthCheck,OrderController.partsPage);

//移动包装操作
router.put('/orders/package/packet/move',Middleware.AuthCheck,OrderController.movePacket);

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
router.put('/apart/getTask/:tid', Middleware.AuthCheck, ApartController.getTask);

// 解锁订单
router.put('/apart/unlock/:tid', Middleware.AuthCheck, ApartController.doUnlock);

// 审核未通过（退单）
router.post('/apart/notPass', Middleware.AuthCheck, ApartController.notPass);

// 审核通过
router.put('/apart/doPass/:tid', Middleware.AuthCheck, ApartController.doPass);

// 标记为审核中 (待拆单审核)
router.put('/apartCheck/getTask/:tid', Middleware.AuthCheck, ApartController.getTaskCheck);
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
router.get('/materialManage', Middleware.AuthCheck,Middleware.FilterEmptyField,MaterialController.indexPage);

// 物料详情页面
router.get('/materialManage/detail/:mid', Middleware.AuthCheck, MaterialController.detailPage);

// 物料详情页面--选择工厂物料
router.post('/materialManage/choiceFactory', Middleware.AuthCheck, MaterialController.choiceFactory);

// 根据工厂选择物料详情页面
router.get('/materialManage/detail/factory/:fid/:mid', Middleware.AuthCheck, MaterialController.detailFacPage);

// 物料出入库总计页面
router.get('/materialManage/summary', Middleware.AuthCheck, MaterialController.summaryPage);

//物料分类一物料新建
router.get('/materialManage/material/:tid/creStepO', Middleware.AuthCheck, MaterialController.materialTypeCreateOnePage);

//物料新建页面一
router.get('/materialManage/material/creStepO', Middleware.AuthCheck, MaterialController.materialCreateOnePage);

// 物料新建页面一-第一步传值
router.post('/materialCreate/doNext', Middleware.AuthCheck, MaterialController.doNext);

//物料新建页面二
router.get('/materialManage/material/creStepS/:id', Middleware.AuthCheck, MaterialController.materialCreateSecPage);

//物料分类三级联动菜单接口
router.put('/materialManage/material/selectMateCate/:pid', Middleware.AuthCheck, MaterialController.selectMateCate);

// 新建物料-提交数据接口
router.post('/materialManage/material/doCreate', Middleware.AuthCheck, MaterialController.doCreate);

//修改物料
router.get('/materialManage/material/modify/:mid', Middleware.AuthCheck, MaterialController.materialModifyPage);

//修改物料-提交数据接口
router.post('/materialManage/material/doModify', Middleware.AuthCheck, MaterialController.doModify);

// 禁用/解锁 物料详情
router.put('/material/setStatus/:mid/:type', Middleware.AuthCheck, MaterialController.setMaterialStatus);

// 物料管理工厂首页
router.get('/materialManage/factory', Middleware.AuthCheck, Middleware.FilterEmptyField,MaterialController.indexFactoryPage);

// 物料管理工厂--物料详情
router.get('/materialManage/factory/detail/:mid', Middleware.AuthCheck, MaterialController.detailFactoryPage);

// 物料管理工厂--物料详情-完善物料
router.get('/materialManage/factory/add/:mid', Middleware.AuthCheck, MaterialController.mateFacAddPage);

// 物料管理工厂--物料详情-完善物料--提交数据接口
router.post('/materialManage/factory/doAdd', Middleware.AuthCheck, MaterialController.doAdd);


/*
 * 页面范围: 物料属性相关
 * 控制器:   MaterialAttrController
 * */
var MaterialAttrController = require('./Controller/MaterialAttrController');
//物料属性页面
router.get('/materialManage/materialAttribute', Middleware.AuthCheck,Middleware.FilterEmptyField, MaterialAttrController.materialAttributePage);

//新建物料属性接口
router.post('/material/attrCreate', Middleware.AuthCheck, MaterialAttrController.attrCreate);

//修改物料属性接口
router.post('/material/attrChange', Middleware.AuthCheck, MaterialAttrController.attrChange);

// 禁用/解锁 物料属性状态
router.put('/mateAttr/setStatus/:aid/:type', Middleware.AuthCheck, MaterialAttrController.setAttrStatus);

//新建物料属性值接口
router.post('/material/attrValCreate', Middleware.AuthCheck, MaterialAttrController.attrValCreate);

//修改物料属性值接口
router.post('/material/attrValChange', Middleware.AuthCheck, MaterialAttrController.attrValChange);

//物料属性值详情页面
router.get('/materialManage/mateAttr/detail/:mid', Middleware.AuthCheck, MaterialAttrController.mateAttrDetailPage);

// 禁用/解锁 物料属性值状态
router.put('/mateAttrVal/setStatus/:code/:type/:aid', Middleware.AuthCheck, MaterialAttrController.setAttrValStatus);

/*
 * 页面范围: 物料分类相关
 * 控制器:  MaterialTypeController
 * */
var MaterialTypeController = require('./Controller/MaterialTypeController');

//物料分类页面
router.get('/materialManage/materialType', Middleware.AuthCheck,Middleware.FilterEmptyField,MaterialTypeController.materialTypePage);

//物料分类-新建一级分类页面
router.get('/materialManage/materialType/creOne', Middleware.AuthCheck, MaterialTypeController.materialTypeCreOnePage);

//物料分类-新建二级、三级分类页面
router.get('/materialManage/materialType/creOther/:id', Middleware.AuthCheck, MaterialTypeController.materialTypeCreOtherPage);

// 物料分类-新建一级分类页面--数据接口
router.post('/materialManage/materialType/creOneDo', Middleware.AuthCheck, MaterialTypeController.materialTypeCreOneDo);

// 物料分类-新建二级、三级分类--数据接口
router.post('/materialManage/materialType/creOtherDo', Middleware.AuthCheck, MaterialTypeController.materialTypeCreOtherDo);

//物料分类-修改分类页面
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
 * 页面范围: 仓储管理
 * 控制器:   FactoryController
 * */
var FactoryController = require('./Controller/FactoryController');

// 获取工厂列表
router.get('/factory', Middleware.AuthCheck, Middleware.FilterEmptyField, FactoryController.listPage);

// 工厂详情页面
router.get('/factory/detail/:ftyId', Middleware.AuthCheck, FactoryController.detailPage);

// 新增工厂页面
router.get('/factory/create', Middleware.AuthCheck, FactoryController.createPage);

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
router.get('/warehouse/:ftyId', Middleware.AuthCheck, Middleware.FilterEmptyField, FactoryController.listWarehousePage);

// 新增仓库页面
router.get('/warehouse/create/:ftyId', Middleware.AuthCheck, FactoryController.createWarehousePage);

// 新增仓库
router.post('/warehouse/doCreate', Middleware.AuthCheck, FactoryController.doWarehouseCreate);

// 修改仓库详情页面
router.get('/warehouse/modify/:whseId', Middleware.AuthCheck, FactoryController.modifyWarehousePage);

// 修改仓库信息
router.post('/warehouse/doModify', Middleware.AuthCheck, FactoryController.doModifyWarehouse);

// 关闭 仓库
router.delete('/warehouse/doClose/:whseId', Middleware.AuthCheck, FactoryController.doCloseWarehouse);

// 解锁 仓库
router.put('/warehouse/doOpen/:whseId', Middleware.AuthCheck, FactoryController.doOpenWarehouse);




// 获取仓库区域列表
router.get('/region/:ftyId/:whseId', Middleware.AuthCheck, Middleware.FilterEmptyField, FactoryController.listRegionPage);

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

// 取工厂下仓库列表
router.put('/getWarehouseList/:ftyId', Middleware.AuthCheck, CargospaceController.getWarehouse);

// 取仓库下区域列表
router.put('/getRegionList/:whseId', Middleware.AuthCheck, CargospaceController.getRegion);


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
router.put('/enterMaterial/doPass/:inId/:purId', Middleware.AuthCheck, EnterController.doPassMaterial);

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

// 原料入库-采购完成单-入库-判断仓库是否可以放入
router.post('/enterMaterial/stockOver/toEnter/ifCanEnter', Middleware.AuthCheck, EnterController.ifCanEnter);

// 成品入库页面
router.get('/enterProduct', Middleware.AuthCheck, EnterController.enterProductPage);

// 成品入库详情页面
router.get('/enterProduct/detail/:id', Middleware.AuthCheck, EnterController.enterProductDetailPage);

// 成品扫描入库页面
router.get('/enterProduct/scanning', Middleware.AuthCheck, EnterController.enterScanningPage);

// 成品扫描入库-入库
router.put('/enterProduct/scanning/doEnter/:id', Middleware.AuthCheck, EnterController.doEnterProduct);



/*
 * 页面范围: 出库管理相关
 * 控制器:   OutWarehouseController
 * */

var OutWarehouseController = require('./Controller/OutWarehouseController');

// 待发货流水页面
router.get('/waitSend', Middleware.AuthCheck, Middleware.FilterEmptyField, OutWarehouseController.waitSendPage);

// 发货通知单页面
router.post('/doDelivery', Middleware.AuthCheck, OutWarehouseController.doDelivery);

// 发货通知单页面
router.get('/deliveryNote', Middleware.AuthCheck, OutWarehouseController.deliveryNotePage);

// 发货通知单-审核
router.put('/deliveryNote/doChecked/:id', Middleware.AuthCheck, OutWarehouseController.doDeliveryChecked);

// 发货通知单-详情 页面
router.get('/deliveryNote/deatil/:id', Middleware.AuthCheck, OutWarehouseController.deliveryNoteDeatil);

// 原料出库页面
router.get('/outMaterial', Middleware.AuthCheck, OutWarehouseController.outMaterialPage);

// 原料出库-审核
router.get('/outMaterial/doChecked/:id', Middleware.AuthCheck, OutWarehouseController.outMaterialChecked);

// 原料出库详情页面
router.get('/outMaterial/deatil/:id', Middleware.AuthCheck, OutWarehouseController.outMaterialDeatil);

// 可发货订单 页面
router.get('/:type/canSend', Middleware.AuthCheck, OutWarehouseController.canSendPage);

// 可发货订单-发货
router.put('/canSend/doSend/:id', Middleware.AuthCheck, OutWarehouseController.doSend);

// 可发货订单详情  页面
router.get('/canSend/deatil/:id', Middleware.AuthCheck, OutWarehouseController.canSendDeatil);

// 成品出库页面
router.get('/outProduct', Middleware.AuthCheck, OutWarehouseController.outProductPage);

// 成品出库详情页面
router.get('/outProduct/deatil/:id', Middleware.AuthCheck, OutWarehouseController.outProductDeatil);

// 大板领料单页面
router.get('/outBred', Middleware.AuthCheck, OutWarehouseController.outBredPage);

// 大板领料详情单页面
router.get('/outBred/deatil/:id', Middleware.AuthCheck, OutWarehouseController.outBredDeatil);

// 可发货订单-审核
router.put('/outBred/doCheck/:id', Middleware.AuthCheck, OutWarehouseController.doCheckBred);

// 可发货订单-审核
router.put('/outBred/doUnCheck/:id', Middleware.AuthCheck, OutWarehouseController.doUnCheckBred);

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

router.get('/file/resupply/create/:lid/:stcode/:tid/:pid/:type', Middleware.AuthCheck, FileController.createResupplyFilePage);


// 新增文件上传地址(拆单)
// router.get('/file/order/apart/:lid/:type/:tid', Middleware.AuthCheck, FileController.createApartFilePage);

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

//图片上传
router.post('/template/upload/img', [upload.single('file_name'), Middleware.FilterEmptyField], TemplateController.doImgUpload);


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
 * 控制器:   SupplierController
 * */

var SupplierController = require('./Controller/SupplierController');

// 供应商列表
router.get('/supplier', Middleware.AuthCheck,SupplierController.supplierPage);
//供应商详情
router.get('/supplier/detail/:tid', Middleware.AuthCheck,SupplierController.supplierDetailPage);
//供应商新增页面
router.get('/supplier/createPage', Middleware.AuthCheck,SupplierController.supplierCreatPage);
//供应商新增 子类
// router.get('/supplier/createPage', Middleware.AuthCheck,SupplierController.supplierCreatPage);
//供应商新增获取一级分类
router.get('/supplier/create/:tid', Middleware.AuthCheck,SupplierController.supSortParentId);
//供应商信息新增
router.post('/supplier/doCreate', Middleware.AuthCheck,SupplierController.supplierDoCreate);
//供应商信息修改页面
router.get('/supplier/modify/:tid', Middleware.AuthCheck,SupplierController.supplierModifyPage);
//供应商信息修改
router.post('/supplier/doModify', Middleware.AuthCheck,SupplierController.supplierDoModify);
//新增供应商物料关联
router.post('/supplier/createMaterialSupplier/:tid/:bid/:date', Middleware.AuthCheck,SupplierController.createMaterialSupplier);
//供应商可供物料
router.get('/supplier/offer_product/:tid', Middleware.AuthCheck,SupplierController.supplierOfferProductPage);

//供应商禁用+启用
router.post('/supplier/supDoDelete/:tid/:type', Middleware.AuthCheck, SupplierController.supplierdoDelete);

//供应商分类
router.get('/supplier/sort', Middleware.AuthCheck,SupplierController.supplierSortPage);
//供应商一级分类添加
router.post('/supplier/doCreat', Middleware.AuthCheck,SupplierController.doCreate);
//供应商分类禁用
router.post('/supplier/doDelete/:tid/:type', Middleware.AuthCheck, SupplierController.doDelete);
//供应商分类修改
router.post('/supplier/sortDoModify', Middleware.AuthCheck, SupplierController.doModify);

//供应商分类修改
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
//新建请购单 选择物料信息列表
router.post('/purchase/applyOrderMaterial/:tid', Middleware.AuthCheck,PurchaseController.purchaseApplyMaterialCreat);
//新建请购单 物料信息修改
router.get('/purchase/apply_createMaterial/:tid', Middleware.AuthCheck,PurchaseController.applyMaterialCreatePage);
//新建请购单 添加物料数量+预计交期
router.post('/purchase/applyMaterialCreate', Middleware.AuthCheck,PurchaseController.applyMaterialCreate);


// 请购单详情
router.get('/purchase/applyDetail/:tid', Middleware.AuthCheck,PurchaseController.purchaseApplyDetailPage);

// 请购单审核
router.post('/purchase/applyReview/:tid', Middleware.AuthCheck,PurchaseController.purchaseApplyReview);

// 采购详情
router.get('/purchase/detail', Middleware.AuthCheck,PurchaseController.purchaseDetail);
// 生成采购单
router.post('/purchases/Order/:tid', Middleware.AuthCheck,PurchaseController.purchaseOrder);
// 采购单详情
router.get('/purchase/orderDetail/:tid', Middleware.AuthCheck,PurchaseController.purchaseOrderDetail);
// 合并采购单
router.post('/purchases/merge/:tid', Middleware.AuthCheck,PurchaseController.purchaseMerge);
// 审核采购单
router.post('/purchases/review/:tid', Middleware.AuthCheck,PurchaseController.purchaseReview);
// 提交采购单
router.post('/purchases/submit/:tid', Middleware.AuthCheck,PurchaseController.purchaseSubmit);

/*
 * 页面范围: 网络预约相关
 * 控制器:   networkBookController
 * */
var NetworkBookController = require('./Controller/NetworkBookController');

// 网络预约
router.get('/networkBook', Middleware.AuthCheck, NetworkBookController.indexPage);

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

//公告信息详情页面
router.get('/noticeInfo', Middleware.AuthCheck,Middleware.FilterEmptyField,InformationController.noticeInfoPage);

//公告信息-新建
router.post('/noticeInfo/doCreate', Middleware.AuthCheck,Middleware.FilterEmptyField,InformationController.noticeDoCreate);

//公告信息-修改
router.post('/noticeInfo/doModify', Middleware.AuthCheck, InformationController.noticeDoModify);

//公告信息-删除
router.put('/noticeInfo/doDelete/:nid', Middleware.AuthCheck, InformationController.noticeDoDelete);

//资料信息详情页面
router.get('/fileInfo', Middleware.AuthCheck, InformationController.fileInfoPage);

//资料上传接口
router.post('/api/notices', Middleware.AuthCheck, InformationController.fileDoCreate);



/*
 * 页面范围: 安装服务
 * 控制器:   InstallServiceController
 * */
var InstallserviceController = require('./Controller/InstallserviceController');
// 待安装列表
router.get('/installService', Middleware.AuthCheck,InstallserviceController.installServicePage);
//指定安装组
router.post('/installServiceTask/:tid/:did', Middleware.AuthCheck,InstallserviceController.getTask);

module.exports = router;