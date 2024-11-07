if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

process.on('uncaughtException', (e) => {
    // prevent errors from killing the server and just log them
    console.error(e);
});

const config = require('./setup/config');
const debug = require('debug')('server-connect:server');
const secure = require('./setup/secure');
const routes = require('./setup/routes');
const sockets = require('./setup/sockets');
const upload = require('./setup/upload');
const cron = require('./setup/cron');
const http = require('http');
const express = require('express');
const endmw = require('express-end');
const cookieParser = require('cookie-parser');
const session = require('./setup/session'); //require('express-session')(Object.assign({ secret: config.secret }, config.session));
const cors = require('cors');
const app = express();

app.set('trust proxy', true);
app.set('view engine', 'ejs');
app.set('view options', { root: 'views', async: true });

app.disable('x-powered-by')

if (config.compression) {
    const compression = require('compression');
    app.use(compression());
}

if (config.abortOnDisconnect) {
    app.use((req, res, next) => {
        req.isDisconnected = false;
        req.on('close', () => {
            req.isDisconnected = true;
        });

        next();
    });
}

app.use(cors(config.cors));
app.use(express.static('public', config.static));
app.use(express.urlencoded({ extended: true }));
app.use(express.json({
    verify: (req, res, buf) => {
        req.rawBody = buf.toString()
    }
}));
app.use(cookieParser(config.secret));
app.use(session);
app.use(endmw);

upload(app);
secure(app);
routes(app);

const server = http.createServer(app);
const io = sockets(server, session);

// Make sockets global available
global.io = io;

module.exports = {
    server, app, io,
    start: function(port) {
        // We add the 404 and 500 routes as last
        app.use((req, res) => {
            // if user has a custom 404 page, redirect to it
            if (req.accepts('html') && req.url != '/404' && app.get('has404')) {
                //res.redirect(303, '/404');
                req.url = '/404';
                app.handle(req, res);
            } else {
                res.status(404).json({
                    status: '404',
                    message: `${req.url} not found.`
                });
            }
        });
        
        app.use((err, req, res, next) => {
            debug(`Got error? %O`, err);
            // if user has a custom 500 page, redirect to it
            if (req.accepts('html') && req.url != '/500' && app.get('has500')) {
                //res.redirect(303, '/500');
                req.url = '/500';
                app.handle(req, res);
            } else {
                res.status(500).json({
                    status: '500',
                    code: config.debug ? err.code : undefined,
                    message: config.debug ? err.message || err : 'A server error occured, to see the error enable the DEBUG flag.',
                    stack: config.debug ? err.stack : undefined,
                });
            }
        });
        
        cron.start();

        server.listen(port || config.port, () => {
            console.log(`App listening at http://localhost:${config.port}`);
        });
    }
};
