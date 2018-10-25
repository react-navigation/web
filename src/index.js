module.exports = {
  get createBrowserApp() {
    return require('./createBrowserApp').default;
  },
  get handleServerRequest() {
    return require('./handleServerRequest').default;
  },
  get Link() {
    return require('./Link').default;
  },
};
