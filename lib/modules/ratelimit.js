module.exports = {
  /**
   * Setup a rate limiter instance
   *
   * @param {Object} options
   * @param {number} options.points - Maximum number of points
   * @param {number} options.duration - Duration in seconds
   * @param {number} options.blockDuration - Duration in seconds to block the user
   * @param {string} name - The name of the rate limiter instance
   */
  setup: function (options, name) {
    if (!name) throw new Error('rateLimit.setup has no name.');
    this.setRateLimiter(name, options);
  },

  /**
   * Consume points from a rate limiter instance
   *
   * @typedef {Object} options
   * @param {string} options.instance - The rate limiter instance name
   * @param {number} [options.points=1] - The number of points to consume
   * @param {number} [options.status=429] - The status code to return
   * @param {string} [options.message=Too Many Requests] - The message to return
   * @param {boolean} [options.throw=false] - Throw an error instead of sending a response
   *
   * @return {Promise} - Resolves if the points were consumed, rejects if the rate limit was exceeded and options.throw is true
   */
  consume: function (options) {
    options = options || {};
    options.points = options.points || 1;
    options.status = options.status || 429;
    options.message = options.message || 'Too Many Requests';

    if (options.instance) {
      const rateLimiter = this.getRateLimiter(options.instance);

      return rateLimiter.consume(this.req.ip, options.points).catch(() => {
        if (options.throw) {
          throw new Error(options.message);
        } else {
          if (this.req.is('json')) {
            this.res.status(options.status).json({ error: options.message });
          } else {
            this.res.status(options.status).send(options.message);
          }
        }
      });
    } else if (this.req.app.rateLimiter) {
      const config = require('../setup/config');
      let isPrivate = false;
      let key = this.req.ip;

      if (this.req.app.privateRateLimiter) {
        if (this.req.session && this.req.session[config.rateLimit.private.provider + 'Id']) {
          isPrivate = true;
          key = this.req.session[config.rateLimit.private.provider + 'Id'];
        }
      }

      const limit = isPrivate ? config.rateLimit.private.points : config.rateLimit.points;
      const duration = isPrivate ? config.rateLimit.private.duration : config.rateLimit.duration;
      this.req.app[isPrivate ? 'privateRateLimiter' : 'rateLimiter'].consume(key, points).then((rateLimiterRes) => {
        const reset = Math.ceil(rateLimiterRes.msBeforeNext / 1000);
        this.res.set('RateLimit-Policy', `${limit};w=${duration}`);
        this.res.set('RateLimit', `limit=${limit}, remaining=${rateLimiterRes.remainingPoints}, reset=${reset}`);
        next();
      }).catch((rateLimiterRes) => {
        if (options.throw) {
          throw new Error(options.message);
        } else {
          const reset = Math.ceil(rateLimiterRes.msBeforeNext / 1000);
          this.res.set('RateLimit-Policy', `${limit};w=${duration}`);
          this.res.set('RateLimit', `limit=${limit}, remaining=${rateLimiterRes.remainingPoints}, reset=${reset}`);
          this.res.set('Retry-After', reset);
          if (this.req.is('json')) {
            this.res.status(options.status).json({ error: options.message });
          } else {
            this.res.status(options.status).send(options.message);
          }
        }
      });
    }
  },
};
