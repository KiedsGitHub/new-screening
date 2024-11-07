const crypto = require('crypto');
const base32 = require('../core/base32');

const secretLength = {
  'sha1': 20,
  'sha224': 28,
  'sha256': 32,
  'sha384': 48,
  'sha512': 64,
  'sha3-224': 28,
  'sha3-256': 32,
  'sha3-384': 48,
  'sha3-512': 64,
};

const hotp = {}; // HOTP: An HMAC-Based One-Time Password Algorithm
const totp = {}; // TOTP: Time-Based One-Time Password Algorithm

hotp.counter = 0n;
hotp.defaults = {
  algorithm: 'sha1',
  digits: 6,
};

hotp.generate = function (secret, opts) {
  opts = { ...hotp.defaults, ...opts };
  const counter = opts.counter == null ? ++hotp.counter : opts.counter;
  const buffer = Buffer.alloc(8);
  buffer.writeBigUInt64BE(BigInt(counter));
  const hash = crypto.createHmac(opts.algorithm, secret).update(buffer.slice(0, secretLength[opts.algorithm])).digest();
  return truncate(hash, opts.digits);
};

hotp.validate = function (code, secret, opts) {
  opts = { ...hotp.defaults, ...opts };
  if (opts.counter == null) opts.counter = hotp.counter;
  if (code === hotp.generate(secret, opts)) return true;
  if (typeof opts.window == 'number' && opts.window > 0) {
    for (let n = 1; n < opts.window + 1; n++) {
      if (code === hotp.generate(secret, { ...opts, counter: opts.counter - n })) {
        return -n;
      }
    }
  }
  return false;
};

totp.defaults = {
  ...hotp.defaults,
  time: null,
  period: 30,
};

totp.generate = function(secret, opts) {
  opts = { ...totp.defaults, ...opts };
  const counter = ~~((opts.time || Date.now()) / 1000 / opts.period);
  return hotp.generate(secret, { ...opts, counter });
};

totp.validate = function(code, secret, opts) {
  opts = { ...totp.defaults, ...opts };
  const counter = ~~((opts.time || Date.now()) / 1000 / opts.period);
  return code === hotp.generate(secret, { ...opts, counter });
};

function truncate(hash, digits) {
  const offset = hash[hash.length-1] & 0xf;
  const binary = (hash[offset] & 0x7f) << 24
    | (hash[offset+1] & 0xff) << 16
    | (hash[offset+2] & 0xff) << 8
    | (hash[offset+3] & 0xff);
  const otp = binary % Math.pow(10, digits);

  return String(otp).padStart(digits, '0');
};

module.exports = {

  hotpGenerage (options) {
    const secret = this.parseRequired(options.secret, 'string', 'otp.hotpGenerate: secret is required.');
    const counter = this.parseOptional(options.counter, 'number', null);
    const digits = this.parseOptional(options.digits, 'number', 6); // 6 | 8
    const algorithm = this.parseOptional(options.algorithm, 'string', 'sha1'); // 'sha1' | 'sha224' | 'sha256' | 'sha384' | 'sha512' | 'sha3-224' | 'sha3-256' | 'sha3-384' | 'sha3-512'

    return hotp.generate(secret, { counter, digits, algorithm });
  },

  hotpValidate (options) {
    const code = this.parseRequired(options.code, 'string', 'otp.hotpValidate: code is required.');
    const secret = this.parseRequired(options.secret, 'string', 'otp.hotpValidate: secret is required.');
    const counter = this.parseOptional(options.counter, 'number', null);
    const digits = this.parseOptional(options.digits, 'number', 6); // 6 | 8
    const algorithm = this.parseOptional(options.algorithm, 'string', 'sha1'); // 'sha1' | 'sha224' | 'sha256' | 'sha384' | 'sha512' | 'sha3-224' | 'sha3-256' | 'sha3-384' | 'sha3-512'

    return hotp.validate(code, secret, { counter, digits, algorithm });
  },

  totpGenerate (options) {
    const secret = this.parseRequired(options.secret, 'string', 'otp.totpGenerate: secret is required.');
    const time = this.parseOptional(options.time, 'string', null);
    const period = this.parseOptional(options.period, 'number', 30); // 30 | 60
    const digits = this.parseOptional(options.digits, 'number', 6); // 6 | 8
    const algorithm = this.parseOptional(options.algorithm, 'string', 'sha1'); // 'sha1' | 'sha224' | 'sha256' | 'sha384' | 'sha512' | 'sha3-224' | 'sha3-256' | 'sha3-384' | 'sha3-512'

    if (typeof time == 'string') time = +(new Date(time));

    return totp.generate(secret, { time, period, digits, algorithm });
  },

  totpValidate (options) {
    const code = this.parseRequired(options.code, 'string', 'otp.totpValidate: code is required.');
    const secret = this.parseRequired(options.secret, 'string', 'otp.totpValidate: secret is required.');
    const time = this.parseOptional(options.time, 'string', null);
    const period = this.parseOptional(options.period, 'number', 30); // 30 | 60
    const digits = this.parseOptional(options.digits, 'number', 6); // 6 | 8
    const algorithm = this.parseOptional(options.algorithm, 'string', 'sha1'); // 'sha1' | 'sha224' | 'sha256' | 'sha384' | 'sha512' | 'sha3-224' | 'sha3-256' | 'sha3-384' | 'sha3-512'

    if (typeof time == 'string') time = +(new Date(time));

    return totp.validate(code, secret, { time, period, digits, algorithm });
  },

  // https://git.coolaj86.com/coolaj86/browser-authenticator.js
  // 20 cryptographically random binary bytes (160-bit key)
  generateSecret (options) {
    const size = this.parseOptional(options.size, 'number', 20);
    return base32.encode(crypto.randomBytes(size), { padding: false }).toString();
  },

  // generates a 6-digit (20-bit) decimal time-based token
  generateToken (options) {
    const secret = this.parseRequired(options.secret, 'string', 'otp.generateToken: secret is required.');
    const period = this.parseOptional(options.period, 'number', 30); // 30 | 60
    const digits = this.parseOptional(options.digits, 'number', 6); // 6 | 8
    const algorithm = this.parseOptional(options.algorithm, 'string', 'sha1'); // 'sha1' | 'sha224' | 'sha256' | 'sha384' | 'sha512' | 'sha3-224' | 'sha3-256' | 'sha3-384' | 'sha3-512'

    return totp.generate(base32.decode(secret), { period, digits, algorithm });
  },

  // validates a time-based token within a +/- 30 second (90 seconds) window
  //returns null on failure or an object such as { delta: 0 } on success
  verifyToken (options) {
    const code = this.parseRequired(options.code, 'string', 'otp.verifyToken: code is required.')
    const secret = this.parseRequired(options.secret, 'string', 'otp.verifyToken: secret is required.');
    const period = this.parseOptional(options.period, 'number', 30); // 30 | 60
    const digits = this.parseOptional(options.digits, 'number', 6); // 6 | 8
    const algorithm = this.parseOptional(options.algorithm, 'string', 'sha1'); // 'sha1' | 'sha224' | 'sha256' | 'sha384' | 'sha512' | 'sha3-224' | 'sha3-256' | 'sha3-384' | 'sha3-512'

    return code === totp.generate(base32.decode(secret), { period, digits, algorithm, window: 1 });
  },

  // generates an OTPAUTH:// scheme URI for QR Code generation.
  // https://github.com/google/google-authenticator/wiki/Key-Uri-Format
  generateOtpUri (options) {
    const secret = this.parseRequired(options.secret, 'string', 'otp.generateTotpUri: secret is required.');
    const issuer = this.parseRequired(options.issuer, 'string', 'otp.generateTotpUri: issuer is required.');
    const account = this.parseRequired(options.account, 'string', 'otp.generateTotpUri: account is required.');
    const digits = this.parseOptional(options.digits, 'number', 6); // 6 | 8
    const period = this.parseOptional(options.period, 'number', 30); // 30 | 60
    const algorithm = this.parseOptional(options.algorithm, 'string', 'sha1'); // 'sha1' | 'sha224' | 'sha256' | 'sha384' | 'sha512' | 'sha3-224' | 'sha3-256' | 'sha3-384' | 'sha3-512'

    return `otpauth://totp/${encodeURI(issuer)}:${encodeURI(account)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=${encodeURIComponent(algorithm.toUpperCase())}&digits=${digits}&period=${period}`;
  },

  generateQrCodeUrl (options) {
    const data = this.parseRequired(options.data, 'string', 'otp.generateQrCodeUrl: data is required.');
    const size = this.parseOptional(options.size, 'number', 200);
    const ecl = this.parseOptional(options.ecl, 'string', 'L'); // error_correction_level: L | M | Q | H
    const margin = this.parseOptional(options.margin, 'number', 4);

    return `https://www.google.com/chart?cht=qr&chs=${size}x${size}&chl=${encodeURIComponent(data)}&chld=${ecl}|${margin}`;
  },

};