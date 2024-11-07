const PassportStrategy = require('passport-strategy');

class ServerConnectStrategy extends PassportStrategy {
  constructor (options) {
    const { provider } = options;

    if (!provider) { throw new TypeError('ServerConnectStrategy requires a provider'); }

    super();

    this.name = 'server-connect';
    this._key = provider + 'Id';
  }

  authenticate (req, options = {}) {
    if (req.session && req.session[this._key]) {
      const property = req._userProperty || 'user';
      req[property] = { id: req.session[this._key] };
    }

    this.pass();
  }
}

module.exports = ServerConnectStrategy;