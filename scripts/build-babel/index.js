const babel = require('babel-core');
const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');
const compile = require('google-closure-compiler-js').compile;
const { log, glob } = require('../utils');

const LIB = 'lib';
const SRC = 'src';

glob(`${SRC}/**/*.js`)
  .then(files => {
    files.forEach(iFile => {
      const oFile = iFile.replace(SRC, LIB);
      // create path if it doesn't exist
      execSync(`mkdir -p ${path.dirname(oFile)}`);
      const babelTransformed = babel.transformFileSync(iFile).code;
      const gccCompiled = compile({
        jsCode: [
          {
            src: babelTransformed,
          },
        ],
        compilationLevel: 'SIMPLE',
        languageIn: 'ECMASCRIPT5_STRICT',
        languageOut: 'ECMASCRIPT5_STRICT',
        env: 'CUSTOM',
        warningLevel: 'QUIET',
        applyInputSourceMaps: false,
      }).compiledCode;
      fs.writeFileSync(oFile, gccCompiled);
      log.info('Babel', `${iFile} => ${oFile}`);
    });
  })
  .catch(e => {
    log.error('Build Error');
    log.info(e.stack);
  });
