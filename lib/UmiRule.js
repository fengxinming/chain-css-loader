'use strict';

const { join } = require('path');
const { readFileSync } = require('fs');
const { merge, cloneDeep, isFunction } = require('lodash');
const { umiDefaults, defaultBrowsers } = require('./defaults');
const { findExisting, makeCssExclude } = require('./utils');

class UmiRule {

  constructor(chain, opts) {
    opts = merge({}, this._defaults(), opts);

    this.options = opts;
    this.chain = chain;
    this.isDev = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';

    this._defaultOptions(opts);
  }

  _defaults() {
    return cloneDeep(umiDefaults);
  }

  /**
   * 初始化部分默认值
   * @param {Object} param 构造函数传入的合并后的参数
   */
  _defaultOptions({
    postcss,
    css,
    sass,
    autoprefixer,
    sourceMap,
    cwd,
    compress,
    cssnano
  }) {
    const { isDev } = this;

    // sourceMap = sourceMap && !isDev;

    // 默认sass选项
    const sassLoaderOptions = sass.options;
    try {
      sassLoaderOptions.implementation = sassLoaderOptions.implementation || require('sass');
      sassLoaderOptions.fiber = sassLoaderOptions.fiber || require('fibers');
    } catch (e) { }

    // 默认css选项
    css.options = {
      importLoaders: 2,
      sourceMap,
      ...css.options
    };
    if (isDev) {
      css.options.localIdentName = '[name]__[local]___[hash:base64:5]';
    }

    // autoprefixer相关配置参数
    // 是否有browserslist配置
    let hasBrowserslistrc = !!autoprefixer.browsers || findExisting(cwd, [
      'browserslist',
      '.browserslistrc'
    ]);
    if (!hasBrowserslistrc) {
      try {
        const pkg = JSON.parse(readFileSync(join(cwd, 'package.json'), 'utf8'));
        hasBrowserslistrc = !!pkg.browserlist || !!pkg.browserslist;
      } catch (e) {
        console.error(e);
        hasBrowserslistrc = false;
      }
    }
    // 设置默认支持浏览器种类
    if (!hasBrowserslistrc) {
      autoprefixer.browsers = Array.from(defaultBrowsers);
    }

    // 是否有postcss配置
    const hasPostCSSConfig = findExisting(cwd, [
      '.postcssrc',
      '.postcssrc.js',
      'postcss.config.js',
      '.postcssrc.yaml',
      '.postcssrc.json'
    ]);
    // 默认postcss选项
    if (!hasPostCSSConfig) {
      const postcssLoaderOptions = postcss.options;
      const plugins = postcssLoaderOptions.plugins || [];
      let preparedPlugins = [
        require('postcss-flexbugs-fixes'),
        require('autoprefixer')({
          flexbox: 'no-2009',
          ...autoprefixer
        })
      ];
      // 可移除内置插件
      if (isFunction(plugins)) {
        preparedPlugins = plugins(preparedPlugins) || preparedPlugins;
        if (!Array.isArray(preparedPlugins)) {
          throw new TypeError('Invalid plugins for postcss');
        }
      } else {
        preparedPlugins = preparedPlugins.concat(plugins);
      }
      // 产品环境下并且需要压缩时添加该组件
      if (!isDev && compress) {
        // 压缩css
        cssnano = cssnano || {
          mergeRules: false,
          normalizeUrl: false,
          mergeLonghand: false,
          cssDeclarationSorter: false
        };
        if (sourceMap) {
          cssnano.map = { inline: false };
        }
        preparedPlugins.push(require('cssnano')({
          preset: ['default', cssnano]
        }));
      }
      postcssLoaderOptions.plugins = () => preparedPlugins;
    }

    return this;
  }

  rule(rule, opts) {
    const { cssModules, useStylus, useLess, useSass, usePoststylus } = opts || {};
    const { options, isDev } = this;
    const { css: cssRuleOptions, postcss: postcssRuleOptions, ssr } = options;

    if (!ssr) {
      rule
        .use('extract-css-loader')
        .loader(require('mini-css-extract-plugin').loader)
        .options({
          publicPath: options.cssPublicPath,
          hmr: isDev
        });
    }

    const cssLoaderOptions = {
      ...cssRuleOptions.options
    };
    // 是否启动 CSS modules
    if (cssModules) {
      cssLoaderOptions.modules = cssModules;
    } else {
      delete cssLoaderOptions.modules;
      delete cssLoaderOptions.localIdentName;
    }
    rule
      .use('css-loader')
      .loader(require.resolve(cssRuleOptions.loader))
      .options(cssLoaderOptions);

    if (!usePoststylus) {
      rule
        .use('postcss-loader')
        .loader(require.resolve(postcssRuleOptions.loader))
        .options(postcssRuleOptions.options);
    }

    if (useStylus) {
      const stylusRuleOptions = options.stylus;
      rule
        .use('stylus-loader')
        .loader(require.resolve(stylusRuleOptions.loader))
        .options(stylusRuleOptions.options);
    }

    if (useLess) {
      const lessRuleOptions = options.less;
      rule
        .use('less-loader')
        .loader(require.resolve(lessRuleOptions.loader))
        .options(lessRuleOptions.options);
    }

    if (useSass) {
      const sassRuleOptions = options.sass;
      rule
        .use('sass-loader')
        .loader(require.resolve(sassRuleOptions.loader))
        .options(sassRuleOptions.options);
    }

    return this;
  }

  useStylus() {
    const { stylus: stylusRuleOptions, modules: cssModules, modulesWithAffix, usePoststylus } = this.options;

    if (modulesWithAffix) {
      this.rule(
        this.chain.module
          .rule('module.stylus')
          .test(stylusRuleOptions.modules),
        { cssModules: true, useStylus: true, usePoststylus }
      );
    }

    this
      .rule(
        this.chain.module
          .rule('stylus')
          .test(stylusRuleOptions.test)
          .exclude
          .add(makeCssExclude({
            modulesWithAffix,
            excludeNodeModules: true,
            modules: stylusRuleOptions.modules
          }))
          .end(),
        { cssModules, useStylus: true })
      .rule(
        this.chain.module
          .rule('stylus-in-node_modules')
          .test(stylusRuleOptions.test)
          .include
          .add(/node_modules/)
          .end(), {
          useStylus: true
        });

    return this;
  }

  useLess() {
    const { less: lessRuleOptions, modules: cssModules, modulesWithAffix } = this.options;

    if (modulesWithAffix) {
      this.rule(
        this.chain.module
          .rule('.module.less')
          .test(lessRuleOptions.modules),
        { cssModules: true, useLess: true }
      );
    }

    this
      .rule(
        this.chain.module
          .rule('less')
          .test(lessRuleOptions.test)
          .exclude
          .add(makeCssExclude({
            modulesWithAffix,
            excludeNodeModules: true,
            modules: lessRuleOptions.modules
          }))
          .end(),
        { cssModules, useLess: true })
      .rule(
        this.chain.module
          .rule('less-in-node_modules')
          .test(lessRuleOptions.test)
          .include
          .add(/node_modules/)
          .end(), {
          useLess: true
        });

    return this;
  }

  useSass() {
    const { sass: sassRuleOptions, modules: cssModules, modulesWithAffix } = this.options;

    if (modulesWithAffix) {
      this.rule(
        this.chain.module
          .rule('.module.sass')
          .test(sassRuleOptions.modules),
        { cssModules: true, useSass: true }
      );
    }

    this
      .rule(
        this.chain.module
          .rule('sass')
          .test(sassRuleOptions.test)
          .exclude
          .add(makeCssExclude({
            modulesWithAffix,
            excludeNodeModules: true,
            modules: sassRuleOptions.modules
          }))
          .end(),
        { cssModules, useSass: true })
      .rule(
        this.chain.module
          .rule('sass-in-node_modules')
          .test(sassRuleOptions.test)
          .include
          .add(/node_modules/)
          .end(), {
          useSass: true
        });

    return this;
  }

  useCss() {
    const { css: cssRuleOptions, modules: cssModules, modulesWithAffix } = this.options;

    if (modulesWithAffix) {
      this.rule(
        this.chain.module
          .rule('.module.css')
          .test(cssRuleOptions.modules),
        { cssModules: true }
      );
    }

    this
      .rule(
        this.chain.module
          .rule('css')
          .test(cssRuleOptions.test)
          .exclude
          .add(makeCssExclude({
            modulesWithAffix,
            excludeNodeModules: true,
            modules: cssRuleOptions.modules
          }))
          .end(), { cssModules })
      .rule(
        this.chain.module
          .rule('css-in-node_modules')
          .test(cssRuleOptions.test)
          .include
          .add(/node_modules/)
          .end()
      );

    return this;
  }

  extractCss() {
    const { isDev, options } = this;
    const hash = !isDev && options.filenameHashing ? '.[contenthash:8]' : '';

    if (!options.ssr) {
      this.chain.plugin('extract-css').use(require('mini-css-extract-plugin'), [
        {
          filename: `[name]${hash}.css`,
          chunkFilename: `[name]${hash}.chunk.css`
        }
      ]);
    }

    return this;
  }

}

module.exports = UmiRule;
