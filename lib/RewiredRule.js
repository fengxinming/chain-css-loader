'use strict';

const UmiRule = require('./UmiRule');

const isOneOf = rule => Array.isArray(rule.oneOf);

class RewiredRule extends UmiRule {

  _defaults() {
    const defaults = super._defaults();
    defaults.css.loader = 'css-loader';
    return defaults;
  }

  rule(rule, opts) {
    const { cssModules, useStylus, useLess, useSass, usePoststylus } = opts || {};
    const { options, isDev } = this;
    const { css: cssRuleOptions, postcss: postcssRuleOptions } = options;

    rule.push(
      isDev
        ? require.resolve('style-loader')
        : {
          loader: require('mini-css-extract-plugin').loader,
          options: {
            publicPath: options.cssPublicPath,
            hmr: isDev
          }
        }
    );

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
    rule.push({
      loader: require.resolve(cssRuleOptions.loader),
      options: cssLoaderOptions.options
    });

    if (!usePoststylus) {
      rule.push({
        loader: require.resolve(postcssRuleOptions.loader),
        options: postcssRuleOptions.options
      });
    }

    if (useStylus) {
      const stylusRuleOptions = options.stylus;
      rule.push({
        loader: require.resolve(stylusRuleOptions.loader),
        options: stylusRuleOptions.options
      });
    }

    if (useLess) {
      const lessRuleOptions = options.less;
      rule.push({
        loader: require.resolve(lessRuleOptions.loader),
        options: lessRuleOptions.options
      });
    }

    if (useSass) {
      const sassRuleOptions = options.sass;
      rule.push({
        loader: require.resolve(sassRuleOptions.loader),
        options: sassRuleOptions.options
      });
    }

    return this;
  }

  useStylus() {
    const { stylus: stylusRuleOptions, modules: cssModules, modulesWithAffix, usePoststylus } = this.options;
    const rules = [];

    if (modulesWithAffix) {
      const loaders = [];
      rules.push({
        test: stylusRuleOptions.modules,
        use: loaders
      });
      this.rule(loaders, { cssModules: true, useStylus: true, usePoststylus });
    }

    const stylusLoader = {
      test: stylusRuleOptions.test,
      exclude: this._cssExclude,
      use: []
    };
    const stylusLoaderInNM = {
      test: stylusRuleOptions.test,
      include: /node_modules/,
      use: []
    };
    this
      .rule(stylusLoader.use, { cssModules, useStylus: true })
      .rule(stylusLoaderInNM.use, { useStylus: true });

    rules.push(stylusLoader, stylusLoaderInNM);

    const { oneOf } = this.chain.module.rules.find(isOneOf);
    oneOf.splice(oneOf.length - 1, 0, ...rules);

    return this;
  }

  useLess() {
    const { less: lessRuleOptions, modules: cssModules, modulesWithAffix } = this.options;
    const rules = [];

    if (modulesWithAffix) {
      const loaders = [];
      rules.push({
        test: lessRuleOptions.modules,
        use: loaders
      });
      this.rule(loaders, { cssModules: true, useLess: true });
    }

    const lessLoader = {
      test: lessRuleOptions.test,
      exclude: this._cssExclude,
      use: []
    };
    const lessLoaderInNM = {
      test: lessRuleOptions.test,
      include: /node_modules/,
      use: []
    };
    this
      .rule(lessLoader.use, { cssModules, useLess: true })
      .rule(lessLoaderInNM.use, { useLess: true });

    rules.push(lessLoader, lessLoaderInNM);

    const { oneOf } = this.chain.module.rules.find(isOneOf);
    oneOf.splice(oneOf.length - 1, 0, ...rules);

    return this;
  }

  useSass() {
    const { sass: sassRuleOptions, modules: cssModules, modulesWithAffix } = this.options;
    const rules = [];

    if (modulesWithAffix) {
      const loaders = [];
      rules.push({
        test: sassRuleOptions.modules,
        use: loaders
      });
      this.rule(loaders, { cssModules: true, useSass: true });
    }

    const sassLoader = {
      test: sassRuleOptions.test,
      exclude: this._cssExclude,
      use: []
    };
    const sassLoaderInNM = {
      test: sassRuleOptions.test,
      include: /node_modules/,
      use: []
    };
    this
      .rule(sassLoader.use, { cssModules, useSass: true })
      .rule(sassLoaderInNM.use, { useSass: true });

    rules.push(sassLoader, sassLoaderInNM);

    const { oneOf } = this.chain.module.rules.find(isOneOf);
    oneOf.splice(oneOf.length - 1, 0, ...rules);

    return this;
  }

  useCss() {
    const { css: cssRuleOptions, modules: cssModules, modulesWithAffix } = this.options;
    const rules = [];

    if (modulesWithAffix) {
      const loaders = [];
      rules.push({
        test: cssRuleOptions.modules,
        use: loaders
      });
      this.rule(loaders, { cssModules: true });
    }

    const cssLoader = {
      test: cssRuleOptions.test,
      exclude: this._cssExclude,
      use: []
    };
    const cssLoaderInNM = {
      test: cssRuleOptions.test,
      include: /node_modules/,
      use: []
    };
    this
      .rule(cssLoader.use, { cssModules })
      .rule(cssLoaderInNM.use);

    rules.push(cssLoader, cssLoaderInNM);

    const { oneOf } = this.chain.module.rules.find(isOneOf);
    oneOf.splice(oneOf.length - 1, 0, ...rules);

    return this;
  }

}

module.exports = RewiredRule;
