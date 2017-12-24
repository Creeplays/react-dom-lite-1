const rollup = require('rollup');
const plugins = require('./plugins');
const external = require('./externals');
const { log } = require('../utils');

const entry = 'src/index.js';
const dest = 'lib/react-dom-lite.cjs.js';

const inputOptions = {
  input: entry,
  plugins,
  external
};

const outputOptions = {
  file: dest,
  format: 'cjs'
};

log.info('Build', 'Bundling...');
rollup
  .rollup(inputOptions)
  .then(bundle => bundle.write(outputOptions))
  .then(() => {
    log.info('Build', 'Done');
  })
  .catch(e => {
    log.error('Build', 'Error occured');
    log.info(e.message);
  });
