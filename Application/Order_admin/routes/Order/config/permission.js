var permissions = {
    notice:{
        create:{
            id:"891010",
            name:"新增公告"
        },
        query :{
            id:"891040",
            name:"查询所有公告"
        },
        update :{
            id:"891030",
            name:"更新公告"
        },
        delete :{
            id:"891020",
            name:"删除公告"
        }
    },
    information:{
       query:{
           id:"892040",
           name:"查询资料信息"
       },
       upload:{
           id:"892010",
           name:"资料上传"
       },
       delete:{
           id:  "892020",
           name:"资料删除"
       }
    },
    customer:{
        query:{
          id:"101043",
          name:"查询门店下自己负责客户信息"
        }
    },
    network:{
        query:{
            id:"530540",
            name:"查询所有网络预约"
        },
        distribute:{
            id:"530511",
            name:"预约分配店铺"
        },
        delete:{
            id:"530520",
            name:"删除预约信息"
        }
    },
    measure:{
        create:{
            id:"503010",
            name:"量尺信息登记"
        },
        finish :{
            id:"503011",
            name:"量尺完成信息登记"
        },
        update :{
            id:"",
            name:"量尺信息修改"
        }
    },
    file: {
        query : {
            id :"506040",
            name : "文件上传"
        },
        create:{
            id:"506010",
            name:"新增个人客户信息"
        },
        delete:{
            id:"506010",
            name:"新增个人客户信息"
        },
        download:{
            id:"506011",
            name :"文件下载"
        }
    },
    followup:{
        create:{
            id:"504010",
            name:"客户沟通登记录入"
        },
        query :{
            id:"504043",
            name:"客户沟通登记查看"
        }
    },
    contract :{
        create:{
            id:"504010",
            name:"客户沟通登记录入"
        },
        query :{
            id:"504043",
            name:"客户沟通登记查看"
        }
    },
    order:{
        query :{
            id:"531051",
            name:"订单查询"
        },
        queryAll:{
            id:"531554",
            name:"查询所有订单"
        },
        unlock:{
            id:"531000",
            name:"订单解锁"
        },
        queryByRevFranchisePrice:{
            id:"531555",
            name:"查看结算价"
        },
        queryByRetailPrice:{
            id:"531556",
            name:"查看零售价"
        },
        queryByFactoryPrice:{
            id:"531557",
            name:"查看出厂价"
        },
        exportOrder:{
            id:"531559",
            name:"导出订单列表"
        },
    },
    orderAssess:{
      query:{
          id:"531940",
          name:"查询个人订单评估"
      },
      assess:{
            id:"531911",
            name:"进行订单评估"
        }
    },
    orderReview:{
        query:{
            id:"532054",
            name:"查询个人订单待审列表"
        },
        takeOrder:{
            id:"532011",
            name:"审单订单锁定"
        },
        passOrder:{
            id:"532012",
            name:"审单订单提交"
        },
        cancelOrder:{
            id:"532032",
            name:"取消待审订单，解锁"
        },
        sendBackOrder:{
            id:"532021",
            name:"退回订单"
        }
    },
    orderApart:{
        query:{
            id:"534054",
            name:"查询个人订单待拆列表"
        },
        takeOrder:{
            id:"534011",
            name:"拆单获取订单"
        },
        passOrder:{
            id:"534012",
            name:"拆单提交"
        },
        cancelOrder:{
            id:"534032",
            name:"取消拆单订单，解锁"
        },
        sendBackOrder:{
            id:"534021",
            name:"退回拆单订单"
        }
    },
    orderReviewApart:{
        query:{
            id:"535054",
            name:"查询个人订单拆审列表"
        },
        takeOrder:{
            id:"535011",
            name:"拆审获取订单"
        },
        passOrder:{
            id:"535012",
            name:"拆审提交"
        },
        cancelOrder:{
            id:"535032",
            name:"取消拆审订单，解锁"
        },
        sendBackOrder:{
            id:"535021",
            name:"退回拆审订单"
        },
        backOrder:{
            id:"535010",
            name:"退回重审"
        },
    },
    orderSchedule :{
        query:{
            id:"536054",
            name:"查询个人订单排料列表"
        },
        takeOrder:{
            id:"536011",
            name:"排料获取订单"
        },
        passOrder:{
            id:"536012",
            name:"排料提交"
        },
        cancelOrder:{
            id:"536032",
            name:"取消排料订单，解锁"
        },
        sendBackOrder:{
            id:"536021",
            name:"退回排料订单"
        },
        backOrder:{
            id:"536010",
            name:"退回重审"
        }
    },
    orderPackage :{
        create:{
            id:"537011",
            name:"生成包装"
        },
        query:{
            id:"537040",
            name:"查询个人包装列表"
        },
        queryDetail:{
            id:"537041",
            name:"查看包装详情"
        },
        packageList:{
            id:"537042",
            name:"查看包装清单"
        },
        cancelPackage:{
            id:"537021",
            name:"撤销包装"
        },
        deletePackage:{
            id:"537020",
            name:"删除包装"
        },
        removePackage:{
            id:"537031",
            name:"移动包装"
        },
        queryAll:{
            id:"537044",
            name:"查询所有包装"
        }
    },
    resupply:{
        query:{
            id:"541554",
            name:"补单查询"
        },
        queryByRevFranchisePrice:{
            id:"531920",
            name:"查看结算价"
        },
        queryByRetailPrice:{
            id:"531921",
            name:"查看零售价"
        },
        queryByFactoryPrice:{
            id:"531922",
            name:"查看出厂价"
        },
    },
    resupplyOrderReview:{
        query:{
            id:"542054",
            name:"查询个人补单待审列表"
        },
        takeOrder:{
            id:"542011",
            name:"审单补单锁定"
        },
        passOrder:{
            id:"542012",
            name:"审单补单提交"
        },
        cancelOrder:{
            id:"542032",
            name:"取消待审补单，解锁"
        },
        sendBackOrder:{
            id:"542021",
            name:"退回补单"
        }
    },
    resupplyOrderApart:{
        query:{
            id:"544054",
            name:"查询个人订单待拆列表"
        },
        takeOrder:{
            id:"544011",
            name:"拆单获取订单"
        },
        passOrder:{
            id:"544012",
            name:"拆单提交"
        },
        cancelOrder:{
            id:"544032",
            name:"取消拆单订单，解锁"
        },
        sendBackOrder:{
            id:"544021",
            name:"退回拆单订单"
        }
    },
    resupplyOrderReviewApart:{
        query:{
            id:"545054",
            name:"查询个人订单拆审列表"
        },
        takeOrder:{
            id:"545011",
            name:"拆审获取订单"
        },
        passOrder:{
            id:"545012",
            name:"拆审提交"
        },
        cancelOrder:{
            id:"545032",
            name:"取消拆审订单，解锁"
        },
        sendBackOrder:{
            id:"545021",
            name:"退回拆审订单"
        },
        backOrder:{
            id:"545010",
            name:"退回拆审"
        }
    },
    goodsAllocation :{
        create:{
            id:"701010",
            name:"新建货位"
        },
        update :{
            id:"701030",
            name:"修改货位"
        },
        delete :{
            id:"701020",
            name:"删除货位"
        }
    },
    organization :{
        create:{
            id:"881010",
            name:"新建机构"
        },
        queryDept :{
            id:"881041",
            name:"查看部门"
        },
        queryRole :{
            id:"881042",
            name:"查看角色"
        },
        createRole :{
            id:"881011",
            name:"创建角色"
        },
        updateRole :{
            id:"881030",
            name:"创建角色"
        },
        deleteRole:{
            id:"881020",
            name:"删除角色"
        },
        queryEmployee:{
            id:"881043",
            name:"查看员工"
        }
    },
    store :{
        create:{
            id:"882010",
            name:"新建机构"
        },
        queryDept :{
            id:"882041",
            name:"查看部门"
        },
        queryRole :{
            id:"882042",
            name:"查看角色"
        },
        createRole :{
            id:"882011",
            name:"创建角色"
        },
        updateRole :{
            id:"882030",
            name:"创建角色"
        },
        deleteRole:{
            id:"882020",
            name:"删除角色"
        },
        queryEmployee:{
            id:"882043",
            name:"查看员工"
        },
        setPrice:{
            id:"886040",
            name:"配置价格系数"
        },
    },
    employeeManage :{
        createDepartment:{
          id  : "201011",
          name :"新增本机构部门"
        },
        createAllDepartment:{
          id : "881012",
          name :"新增所有机构部门"
        },
        update:{
          id   : "201031",
          name :"修改本机构员工信息"
        },
        updateAll:{
          id  :"201030",
          name:"修改所有机构员工信息"
        },
        queryAll:{
            id:"881043",
            name:"查询所有机构员工"
        }
    },
    gathering :{
        queryAll:{
            id:"533040",
            name:"查询所有机构订单收款"
        },
        finishGathering:{
            id:"533031",
            name:"完成收款"
        },
        priceLogSee:{
            id:"531553",
            name:"修改价格记录"
        }
    },
    stockUp :{
        finish:{
            id:"705031",
            name:"完成备货"
        }
    },
    rawMateInventory :{
        finish:{
            id:"702031",
            name:"采购完成（原料入库）"
        }
    },
    deliveryGoods :{
        finish:{
            id:"702031",
            name:"发货通知"
        }
    },
    request :{
        queryAll:{
            id:"582040",
            name:"请购查询所有机构"
        },
        queryOrganization:{
            id:"582041",
            name:"请购查询自己机构"
        },
        create:{
            id:"582010",
            name:"新建请购"
        },
        delete:{
            id:"582010",
            name:"删除请购"
        },
        check:{
            id:"582012",
            name:"审核请购"
        }
    },
    purchase :{
        queryAll:{
            id:"581040",
            name:"采购查询所有机构"
        },
        queryOrganization:{
            id:"581041",
            name:"采购查询自己机构"
        },
        query:{
            id:"581043",
            name:"采购查询自己"
        },
        querySupplier:{
            id:"581054",
            name:"当前供应商相关采购单"
        },
        create:{
            id:"581010",
            name:"新建采购"
        },
        delete:{
            id:"581010",
            name:"删除采购"
        },
        merge:{
            id:"581011",
            name:"合并采购"
        },
        check:{
            id:"581012",
            name:"审核采购"
        },
        commit:{
            id:"581013",
            name:"审核采购"
        },
        createP:{
            id:"581010",
            name:"采购单生成"
        }
    },
    storage:{
       createFactory:{
           id:"707011",
           name:"新建工厂"
       },
       createStorage:{
           id:"707012",
           name:"新建仓库"
       },
       createArea:{
           id:"707013",
           name:"新建区域"
       },
       createAllocation:{
           id:"707014",
           name:"新建货位"
       },
       updateStorage:{
           id:"707032",
           name:"修改仓库"
       },
       updateArea:{
           id:"707033",
           name:"更新区域"
       },
       updateAllocation:{
           id:"707034",
           name:"更新货位"
       },
       deleteStorage:{
            id:"707032",
            name:"禁用仓库"
        },
       deleteArea:{
            id:"707033",
            name:"禁用区域"
        },
        deleteAllocation:{
            id:"707034",
            name:"禁用货位"
        },
        queryAll:{
            id:"707050",
            name:"查询所有仓储信息"
        }
    },
    supplier:{
      creae:{
          id:"583010",
          name:"添加供应商"
      },
      update:{
          id:"583030",
          name:"更新供应商"
      },
      delete:{
          id:"583031",
          name:"删除供应商"
      },
      createCategory:{
          id:"584010",
          name:"添加供应商分类"
      },
      updateCategory:{
          id:"584030",
          name:"更新供应商分类"
      },
      deleteCategory:{
          id:"584031",
          name:"删除供应商分类"
      },
      queryCategory:{
          id:"584040",
          name:"查询供应商分类"
      },
      queryAll:{
          id:"583040",
          name:"查询所有机构供应商"
      },
       pay:{
           id:"581033",
           name:"采购单付款"
       }
    },
    material:{
        creae:{
            id:"603010",
            name:"添加物料"
        },
        associateProduct:{
            id:"604011",
            name:"关联成品"
        },
        update:{
            id:"603030",
            name:"更新物料"
        },
        delete:{
            id:"603020",
            name:"删除物料"
        },
        queryCategory:{
            id:"604040",
            name:"查看物料分类"
        },
        createCategory:{
            id:"604010",
            name:"添加物料分类"
        },
        updateCategory:{
            id:"604030",
            name:"更新物料分类"
        },
        deleteCategory:{
            id:"604020",
            name:"删除物料分类"
        },
        queryAll:{
            id:"603041",
            name:"查询所有工厂物料"
        },
        queryAttribute:{
            id:"605040",
            name:"查看物料属性"
        },
        createAttribute:{
            id:"605010",
            name:"添加物料属性"
        },
        updateAttribute:{
            id:"605030",
            name:"更新物料属性"
        },
        deleteAttribute:{
            id:"605020",
            name:"删除物料属性"
        },
        queryByRegionAll:{
            id:"603042",
            name:"查看所有机构区域物料信息"
        },
        queryByRegionOrganization:{
            id:"603043",
            name:"查看本机构区域物料信息"
        },
        queryByRegion:{
            id:"603044",
            name:"查看本人区域物料信息"
        },
        queryByPrice:{
            id:"604045",
            name:"查看物料相关价格"
        },
        queryByModifyPrice:{
            id:"604045",
            name:"修改物料相关价格"
        }
    },
    cargoManages :{
        mateIn:{
            id:"702060",
            name:"原料确定入库按钮"
        },
        mateInReview:{
            id:"702050",
            name:"原料入库审核"
        },
        prodInList:{
            id:"704030",
            name:"成品入库查询可入库的包的按钮"
        },
        prodIn:{
            id:"704040",
            name:"成品确定入库按钮"
        },
        deliveryReview:{
            id:"709023",
            name:"发货通知单审核"
        },
        deliveryList:{
            id:"709024",
            name:"发货通知按钮"
        },
        deliveryWrite:{
            id:"709033",
            name:"填写发货通知单"
        },
        deliverySubmit:{
            id:"709040",
            name:"提交发货通知单"
        },

        deliveryPackage:{
            id:"705023",
            name:"备货按钮查出包装列表"
        },
        prodOutList:{
            id:"703023",
            name:"成品出库查询订单下可出库的包"
        },
        prodOut:{
            id:"703030",
            name:"成品确定出库按钮"
        },
        mateOutList:{
            id:"706010",
            name:"领料单导入"
        },
        mateOut:{
            id:"706012",
            name:"领料单确定出库"
        },
        mateOutReview:{
            id:"706013",
            name:"原料出库审核"
        },
    },
    inventory :{
        queryAll:{
            id:"708040",
            name:"查询所有机构库存记录"
        }
    },
    batchNumber :{
        queryAll:{
            id:"539042",
            name:"查询所有机构库存记录"
        },
        packageList:{
            id:"539080",
            name:"查看批次包装清单"
        }
    },
    taskseq:{
        cancel:{
            id:"",
            name:""
        }
    },
    storeFound:{
        editRecharge:{
            id:"302041",
            name:"门店资金冲正按钮"
        }
    },
    report:{
        order:{
            id:"803010",
            name:"订单相关报表"
        },
        store:{
            id:"803020",
            name:"门店相关报表"
        },
        factory:{
            id:"803030",
            name:"工厂相关报表"
        },
    },
}

module.exports = permissions;



