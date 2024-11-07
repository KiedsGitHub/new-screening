module.exports = {

  generateToken: async function (options) {
    return this.req.csrfToken(options.overwrite);
  },

};
