import express from 'express';
import path from 'path';
import favicon from 'serve-favicon';
import logger from 'express-bunyan-logger';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import exphbs from 'express-handlebars';
import fs from 'fs';
import bunyan from 'bunyan';

import mainConfig from '../config/main';
import routes from './routes/index';

const env = process.env.NODE_ENV || 'development';
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

app.locals.ENV = env;
app.locals.ENV_DEVELOPMENT = env === 'development';
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
  try {
    const data = fs.readFileSync(file, 'utf8');
    if (data) {
      const parsed = JSON.parse(data);
      manifest = parsed[`${obj.key}.${obj.extension}`];
    }
  } catch (error) {
    log.error(`Error reading file ${file}`);
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

app.use('/', routes);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers
if (app.get('env') === 'development') {
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
