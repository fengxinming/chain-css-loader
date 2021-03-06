'use strict';

const path = require('path');
const fs = require('fs');

/**
 * 查找文件是否存在
 * @param {String} context 上下文根目录
 * @param {Array} files 文件列表
 */
function findExisting(context, files) {
  for (const file of files) {
    if (fs.existsSync(path.join(context, file))) {
      return file;
    }
  }
};

/**
 * 创建cssExclude
 * @param {Object} opts
 */
function makeCssExclude({ modulesWithAffix, excludeNodeModules, modules }) {
  return function cssExclude(filePath) {
    if (excludeNodeModules && /node_modules/.test(filePath)) {
      return true;
    }
    if (modulesWithAffix && modules.test(filePath)) {
      return true;
    }
    return false;
  };
}

module.exports = {
  findExisting, makeCssExclude
};
