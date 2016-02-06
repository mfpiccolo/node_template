import express from 'express';
import path from 'path';
import favicon from 'serve-favicon';
import logger from 'express-bunyan-logger';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import exphbs from 'express-handlebars';
import fs from 'fs';
import bunyan from 'bunyan';

import util from './util';
import routes from './routes';
import mainConfig from '../config/main';

const configFolder = path.join(__dirname, '../config');
const viewsFolder = path.join(__dirname, '/views');
const publicFolder = path.join(__dirname, '../public');
const bunyanConfig = {
  name: mainConfig.appName,
  level: mainConfig.logLevel,
  stream: process.stdout,
};
const log = bunyan(bunyanConfig);
const app = express();

app.locals.ENV = util.env;
app.locals.ENV_DEVELOPMENT = !util.isProduction();
app.locals.appName = mainConfig.appName;

// view engine setup
app.set('views', viewsFolder);
app.engine('handlebars', exphbs({
  defaultLayout: 'main',
  layoutsDir: `${viewsFolder}/layouts`,
}));
app.set('view engine', 'handlebars');

[
  {
    key: 'app',
    extension: 'js',
  },
  {
    key: 'style',
    extension: 'css',
  },
  {
    key: 'vendor',
    extension: 'js',
  },
].forEach((obj) => {
  let manifest = `${obj.key}.${obj.extension}`;
  const file = `${configFolder}/rev-manifest-${obj.key}.json`;
  if (util.isProduction()) {
    try {
      const data = fs.readFileSync(file, 'utf8');
      if (data) {
        const parsed = JSON.parse(data);
        manifest = parsed[`${obj.key}.${obj.extension}`];
      }
    } catch (error) {
      log.error(`Error reading file ${file}`);
    }
  }
  app.locals[`rev-${obj.key}`] = manifest;
});

app.use(favicon(`${publicFolder}/favicon.ico`));
app.use(logger({
  name: 'logger',
  streams: [bunyanConfig],
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true,
}));
app.use(cookieParser());
app.use(express.static(publicFolder));

// init routes
routes.forEach((route) => {
  /*eslint-disable*/
  const router = express.Router();
  /*eslint-enable*/
  switch (route.type) {
    case 'POST':
      router.get(route.path, route.controller.post);
      break;
    case 'PUT':
      router.get(route.path, route.controller.put);
      break;
    case 'DELETE':
      router.get(route.path, route.controller.delete);
      break;
    case 'GET':
    default:
      router.get(route.path, route.controller.get);
      break;
  }
  app.use(route.path, router);
});

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers
if (!util.isProduction()) {
  // development error handler
  // will print stacktrace
  app.use((err, req, res) => {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err,
      title: 'error',
    });
  });
} else {
  // production error handler
  // no stacktraces leaked to user
  app.use((err, req, res) => {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: {},
      title: 'error',
    });
  });
}

app.set('port', process.env.PORT || 3000);

const server = app.listen(app.get('port'), () => {
  log.info(`Express server listening on port ${server.address().port}`);
});
