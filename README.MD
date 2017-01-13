安装NPM@http://jingyan.baidu.com/article/a17d528506d7f58098c8f2b0.html

先运行 npm install 安装所有NPM包  
在运行 npm install -g pm2  安装PM2 用于监控并控制所有node实例
最后 pm2 start ecosystem.config.js  (复制-sample文件) PM2配置文件
pm2 monit 监控实例
pm2 stop 暂停
pm2 指令大全 :http://pm2.keymetrics.io/docs/usage/quick-start/


12-30
考虑吧config都提出来

Controller请求格式
-请求页面 xxxPage
-get获取信息 getXxxx

~页面
实例列表页面  -get  xxxxxs                对应controller listPage

新建实例页面  -get  xxxxx/create          对应controller createPage
新建实例动作  -post xxxxx/create          对应controller doCreate

更新实例页面  -get  xxxxx/update/{id}     对应controller updatePage
更新实例动作  -post xxxxx/update/{id}     对应controller doUpdate

删除实例页面  -post xxxxx/delete/{id}     对应controller doDelete

~JSON
获取实例列表  -get  xxxxxs/api            对应controller listApi
获取单个实例  -get  xxxxx/api/{id}        对应controller singleApi


VIEWS

新建 create
更新 update


