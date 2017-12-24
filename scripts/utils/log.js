const chalk = require('chalk');

const TAG_COLOR = 'cyan';
const info = function(tag, ...args) {
  console.log(chalk[TAG_COLOR](tag), ...args);
};

const error = function(tag, ...args) {
  console.log(chalk[TAG_COLOR](tag), chalk.red(...args));
};

const warn = function(tag, ...args) {
  console.log(chalk[TAG_COLOR](tag), chalk.yellow(...args));
};

module.exports = { info, error, warn };
