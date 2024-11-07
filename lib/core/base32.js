const Variants = {
  'RFC4648': {
    alphabet: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567',
    padding: true,
  },
  'RFC4648-HEX': {
    alphabet: '0123456789ABCDEFGHIJKLMNOPQRSTUV',
    padding: true,
  },
  'CROCKFORD': {
    alphabet: '0123456789ABCDEFGHJKMNPQRSTVWXYZ',
    padding: false,
  },
};

exports.encode = (input, opts = {}) => {
  const Variant = Variants[opts.variant] || Variants['RFC4648'];
  const alphabet = Variant.alphabet;
  const padding = opts.padding != null ? opts.padding : Variant.padding;
  const data = Buffer.from(input);

  let bits = 0;
  let value = 0;
  let output = '';

  for (let i = 0; i < data.length; i++) {
    value = (value << 8) | data.readUInt8(i);
    bits += 8;

    while (bits >= 5) {
      output += alphabet[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }

  if (bits > 0) {
    output += alphabet[(value << (5 - bits)) & 31];
  }

  if (padding) {
    while ((output.length % 8) !== 0) {
      output += '=';
    }
  }

  return output;
};

exports.decode = (input, opts = {}) => {
  const Variant = Variants[opts.variant] || Variants['RFC4648'];
  const alphabet = Variant.alphabet;

  let bits = 0;
  let value = 0;
  
  if (opts.variant === 'CROCKFORD') {
    input = input.toUpperCase().replace(/O/g, '0').replace(/[IL]/g, '1');
  } else {
    input = input.replace(/=/g, '');
  }
  
  let index = 0;
  let length = input.length;
  let output = Buffer.alloc(Math.ceil(length * 5 / 8));
  
  for (let i = 0; i < length; i++) {
    let char = input[i];
    let char_index = alphabet.indexOf(char);

    if (char_index === -1) {
      throw new Error('Invalid character: ' + char);
    }

    value = (value << 5) | char_index;
    bits += 5;

    if (bits >= 8) {
      output.writeUInt8((value >>> (bits - 8)) & 255, index++);
      bits -= 8;
    }
  }

  return output;
};