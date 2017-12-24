const babel = require('babel-core');
const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');
const { log, glob } = require('../utils');

const LIB = 'lib';
const SRC = 'src';

glob(`${SRC}/**/*.js`)
  .then(files => {
    files.forEach(iFile => {
      const oFile = iFile.replace(SRC, LIB);
      // create path if it doesn't exist
      execSync(`mkdir -p ${path.dirname(oFile)}`);
      fs.writeFileSync(oFile, babel.transformFileSync(iFile).code);
      log.info('Babel', `${iFile} => ${oFile}`);
    });
  })
  .catch(e => {
    log.error('Build Error');
    log.info(e.stack);
  });
