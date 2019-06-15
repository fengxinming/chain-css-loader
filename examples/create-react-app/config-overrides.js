const { join } = require('path');
const { override, fixBabelImports, addWebpackAlias } = require('customize-cra');
const { Rule } = require('../../index');

const resolve = (dir) => join(__dirname, '.', dir);

module.exports = function (config, env) {
  return override(
    addWebpackAlias({
      '~': resolve('src')
    }),
    fixBabelImports('import', {
      libraryName: 'antd',
      libraryDirectory: 'es',
      style: 'css'
    }),
    function (config) {
      const rule = new Rule(config);
      rule.useStylus();
    }
  )(config);
};

