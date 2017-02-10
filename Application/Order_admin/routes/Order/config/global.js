/**
 * Created by fangjiahui on 16/12/26.
 */

var Global = {
    site: {
        author: '丫投科技',
    },
    server: {
        //订单服务器
        Order: {
            http: 'http://',
            host: '192.2.17.63',
            port: '8082',
            remote_server: function () {
                return Global.server.Order.http + Global.server.Order.host + (Global.server.Order.port ? ':' + Global.server.Order.port : '');
            }
        },
        //文件上传服务器
        Upload: {
            http: 'http://',
            host: '192.2.17.21',
            port: '8081',
            remote_server: function () {
                return Global.server.Upload.http + Global.server.Upload.host + (Global.server.Upload.port ? ':' + Global.server.Upload.port : '');
            }
        },
        //静态资源服务器
        Static: {
            http: 'http://',
            host: '192.2.17.21',
            port: '8088',
            remote_server: function () {
                return Global.server.Static.http + Global.server.Static.host + (Global.server.Static.port ? ':' + Global.server.Static.port : '');
            }
        }
    }
};

module.exports = Global;