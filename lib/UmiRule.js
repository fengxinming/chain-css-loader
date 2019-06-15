'use strict';

const { join } = require('path');
const { readFileSync } = require('fs');
const { merge, isFunction } = require('lodash');
const { defaultOptions, defaultBrowsers } = require('./defaults');
const { findExisting, makeCssExclude } = require('./utils');

class Rule {

  constructor(chain, opts) {
    opts = merge({}, defaultOptions, opts);

    this.options = opts;
    this.chain = chain;
    this.isDev = process.env.NODE_ENV === 'development';

    this._defaultOptions(opts);

    this.cssModules = opts.modules;
    this.cssModulesWithAffix = opts.modulesWithAffix;
    this.filenameHashing = opts.filenameHashing;
    this.stylusRuleOptions = opts.stylus;
    this.postcssRuleOptions = opts.postcss;
    this.cssRuleOptions = opts.css;
    this.lessRuleOptions = opts.less;
    this.sassRuleOptions = opts.sass;
    this.usePoststylus = opts.usePoststylus;

    this._cssExclude = makeCssExclude(this);
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

    sourceMap = sourceMap && !isDev;
    autoprefixer = autoprefixer || {};

    // 默认sass选项
    const sassLoaderOptions = sass.options;
    try {
      sassLoaderOptions.implementation = sassLoaderOptions.implementation || require('sass');
      sassLoaderOptions.fiber = sassLoaderOptions.fiber || require('fibers');
    } catch (e) { }

    // 默认css选项
    css.options = Object.assign({
      importLoaders: 2,
      sourceMap
    }, css.options);
    this.cssModulesConfig = {
      modules: true,
      localIdentName:
        css.options.localIdentName ||
        (isDev
          ? '[name]__[local]___[hash:base64:5]'
          : '[local]___[hash:base64:5]')
    };

    // autoprefixer相关配置参数
    // 是否有browserslist配置
    let hasBrowserslistrc = !!autoprefixer.browsers || findExisting(cwd, [
      'browserslist',
      '.browserslistrc'
    ]);
    if (!hasBrowserslistrc) {
      try {
        const pkg = JSON.stringify(readFileSync(join(cwd, 'package.json'), 'utf8'));
        hasBrowserslistrc = !!pkg.browserlist;
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
    const { cssModules, useStylus, useLess, useSass } = opts || {};
    const { options, cssRuleOptions, postcssRuleOptions, cssModulesConfig, isDev, usePoststylus } = this;

    rule
      .use('extract-css-loader')
      .loader(require('mini-css-extract-plugin').loader)
      .options({
        publicPath: isDev ? '/' : options.cssPublicPath,
        hmr: isDev
      });

    rule
      .use('css-loader')
      .loader(require.resolve(cssRuleOptions.loader))
      .options({
        ...cssRuleOptions.options,
        ...(cssModules ? cssModulesConfig : {})
      });

    if (!usePoststylus) {
      rule
        .use('postcss-loader')
        .loader(require.resolve(postcssRuleOptions.loader))
        .options(postcssRuleOptions.options);
    }

    if (useStylus) {
      const { stylusRuleOptions } = this;
      rule
        .use('stylus-loader')
        .loader(require.resolve(stylusRuleOptions.loader))
        .options(stylusRuleOptions.options);
    }

    if (useLess) {
      const { lessRuleOptions } = this;
      rule
        .use('less-loader')
        .loader(require.resolve(lessRuleOptions.loader || 'less-loader'))
        .options(lessRuleOptions.options);
    }

    if (useSass) {
      const { sassRuleOptions } = this;
      rule
        .use('sass-loader')
        .loader(require.resolve(sassRuleOptions.loader || 'sass-loader'))
        .options(sassRuleOptions.options);
    }

    return this;
  }

  useStylus() {
    if (this.cssModulesWithAffix) {
      this.rule(
        this.chain.module.rule('module.stylus').test(/\.module\.styl(us)?$/),
        { cssModules: true, useStylus: true }
      );
    }

    const { stylusRuleOptions } = this;

    this
      .rule(
        this.chain.module
          .rule('stylus')
          .test(stylusRuleOptions.test)
          .exclude
          .add(this._cssExclude)
          .end(),
        { cssModules: this.cssModules, useStylus: true })
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
    if (this.cssModulesWithAffix) {
      this.rule(
        this.chain.module.rule('.module.less').test(/\.module\.less$/),
        { cssModules: true, useLess: true }
      );
    }

    const { lessRuleOptions } = this;

    this
      .rule(
        this.chain.module
          .rule('less')
          .test(lessRuleOptions.test)
          .exclude
          .add(this._cssExclude)
          .end(), {
          cssModules: this.cssModules,
          useLess: true
        })
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
    if (this.cssModulesWithAffix) {
      this.rule(
        this.chain.module.rule('.module.sass').test(/\.module\.(sass|scss)$/),
        { cssModules: true, useSass: true }
      );
    }

    const { sassRuleOptions } = this;

    this
      .rule(
        this.chain.module
          .rule('sass')
          .test(sassRuleOptions.test)
          .exclude
          .add(this._cssExclude)
          .end(), {
          cssModules: this.cssModules,
          useSass: true
        })
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
    if (this.cssModulesWithAffix) {
      this.rule(
        this.chain.module.rule('.module.css').test(/\.module\.css$/),
        { cssModules: true }
      );
    }

    const { cssRuleOptions } = this;

    this
      .rule(
        this.chain.module
          .rule('css')
          .test(cssRuleOptions.test)
          .exclude
          .add(this._cssExclude)
          .end(), {
          cssModules: this.cssModules
        })
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
    const hash = !this.isDev && this.filenameHashing ? '.[contenthash:8]' : '';

    this.chain.plugin('extract-css').use(require('mini-css-extract-plugin'), [
      {
        filename: `[name]${hash}.css`,
        chunkFilename: `[name]${hash}.chunk.css`
      }
    ]);

    return this;
  }

}

module.exports = Rule;
