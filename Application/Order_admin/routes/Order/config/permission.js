var permissions = {
    customer:{
        create:{
            id:"101010",
            name:"新增个人客户信息"
        },
        query :{
            id:"101043",
            name:"查询门店下自己负责客户信息"
        },
        update :{
            id:"101030",
            name:"修改客户基本信息"
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
    wardround :{
        create:{
            id:"505010",
            name:"新增查房信息"
        },
        query :{
            id:"505041",
            name:"查房信息查看"
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
        create:{
            id:"531510",
            name:"新增订单"
        },
        query :{
            id:"531512",
            name:"提交订单审核"
        },
        update :{
            id:"101030",
            name:"修改客户基本信息"
        },
        delete :{
            id:"531520",
            name:"删除订单"
        }
    },
    resupply:{
        create:{
            id:"531510",
            name:"新增补单"
        },
        submit:{
            id:"541512",
            name:"提交补单"
        },
        delete :{
            id :"541520",
            name :"删除补单"
        }
    },
    taskseq:{
        cancel:{
            id:"",
            name:""
        }
    }
}

module.exports = permissions;



