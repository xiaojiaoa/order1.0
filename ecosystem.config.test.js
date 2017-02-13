module.exports = {
    /**
     * Application configuration section
     * http://pm2.keymetrics.io/docs/usage/application-declaration/
     */
    apps: [

        // First application
        {
            name: "DWY_ORDER",
            script: "./bin/Order",
            instances: "2",
            exec_mode: "cluster",
            watch: "true",
            ignore_watch: ["node_modules", "Application/Order_admin/public", "Application/Order_admin/views"],
            "error_file": "./Logs/dev/err.log",
            "out_file": "./Logs/dev/out.log",
            env: {
                COMMON_VARIABLE: "true",
            },
            env_production: {
                NODE_ENV: "production",
                Jiahui:"YES"
            }
        },
         //Second application
        {
            name: "DWY_STORE",
            script: "../node_dwy/bin/Store",
            instances: "2",
            exec_mode: "cluster",
            watch: "true",
            ignore_watch: ["node_modules", "Application/Store_admin/public", "Application/Store_admin/views"],
            "error_file": "../node_dwy/Logs/dev/err.log",
            "out_file": "../node_dwy/Logs/dev/out.log",
            env: {
                COMMON_VARIABLE: "true"
            },
            env_production: {
                NODE_ENV: "production"
            }
        }
    ],

    /**
     * Deployment section
     * http://pm2.keymetrics.io/docs/usage/deployment/
     */
    //deploy: {
    //    production: {
    //        user: "node",
    //        host: "212.83.163.1",
    //        ref: "origin/master",
    //        repo: "git@github.com:repo.git",
    //        path: "/var/www/production",
    //        "post-deploy": "npm install && pm2 startOrRestart ecosystem.json --env production"
    //    },
    //    dev: {
    //        user: "node",
    //        host: "212.83.163.1",
    //        ref: "origin/master",
    //        repo: "git@github.com:repo.git",
    //        path: "/var/www/development",
    //        "post-deploy": "npm install && pm2 startOrRestart ecosystem.json --env dev",
    //        env: {
    //            NODE_ENV: "dev"
    //        }
    //    }
    //}
}
