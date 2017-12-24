const glob = require('glob');

module.exports = function(pattern) {
  return new Promise((resolve, reject) => {
    glob(pattern, (err, files) => {
      if (err) {
        reject(err);
      } else {
        if (files.length > 0) {
          resolve(files);
        } else {
          reject(new Error("Glob pattern didn't match any files"));
        }
      }
    });
  });
};
