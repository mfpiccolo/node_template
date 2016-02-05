const env = process.env.NODE_ENV || 'development';
export default {
  env,
  isProduction() {
    return env === 'production';
  },
};
