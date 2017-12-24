const babel = require('rollup-plugin-babel');
const commonjs = require('rollup-plugin-commonjs');

// Temporary: If rollup enters, babelrc options need not be set to false
module.exports = [
  babel({
    babelrc: false,
    presets: [
      [
        'env',
        {
          modules: false,
          targets: {
            browsers: ['last 2 versions', 'safari >= 7']
          }
        }
      ],
      ['flow']
    ],
    plugins: []
  }),
  commonjs()
];
