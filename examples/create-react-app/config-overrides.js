const { join } = require('path');
const poststylus = require('poststylus');
const { override, fixBabelImports, addWebpackAlias } = require('customize-cra');
const { RewiredRule } = require('../../index');

const resolve = (dir) => join(__dirname, '.', dir);

module.exports = {
  webpack(config, env) {
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
        // const rule = new RewiredRule(config, {
        //   modules: true
        // });
        // rule.useStylus();

        const rule = new RewiredRule(config, {
          modules: true,
          usePoststylus: true,
          stylus: {
            options: {
              use: [
                poststylus([
                  require('postcss-flexbugs-fixes'),
                  require('autoprefixer')({
                    flexbox: 'no-2009'
                  }),
                  'rucksack-css'
                ])
              ]
            }
          }
        });
        rule.useStylus();

        return config;
      }
    )(config);
  }
};

