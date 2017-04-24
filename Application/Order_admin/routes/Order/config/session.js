module.exports = {
    redis: {
        host: process.env.REDIS_ADDRESS || '127.0.0.1',
        port: process.env.REDIS_PORT || '6379',
        pass: process.env.REDIS_PASSWORD || '',
    },
    name: process.env.SESSION_NAME || 'DWY_ORDER_SID',
    resave: true,
    saveUninitialized: true,
    secret: process.env.SESSION_SECRET_KEY || 'keyboard dog'
};
