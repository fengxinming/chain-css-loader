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
    const loaders = [];

    this.rule(loaders, { cssModules, useStylus: true });

    rules.push({
      test: stylusRuleOptions.test,
      exclude: stylusRuleOptions.modules,
      use: loaders,
      sideEffects: !this.isDev
    });
    if (modulesWithAffix) {
      const loaders = [];
      rules.push({
        test: stylusRuleOptions.modules,
        use: loaders
      });
      this.rule(loaders, { cssModules: true, useStylus: true, usePoststylus });
    }

    const { oneOf } = this.chain.module.rules.find(isOneOf);
    oneOf.splice(oneOf.length - 1, 0, ...rules);

    return this;
  }

  useLess() {
    const { less: lessRuleOptions, modules: cssModules, modulesWithAffix } = this.options;
    const rules = [];
    const loaders = [];

    this.rule(loaders, { cssModules, useLess: true });

    rules.push({
      test: lessRuleOptions.test,
      exclude: lessRuleOptions.modules,
      use: loaders,
      sideEffects: !this.isDev
    });
    if (modulesWithAffix) {
      const loaders = [];
      rules.push({
        test: lessRuleOptions.modules,
        use: loaders
      });
      this.rule(loaders, { cssModules: true, useLess: true });
    }

    const { oneOf } = this.chain.module.rules.find(isOneOf);
    oneOf.splice(oneOf.length - 1, 0, ...rules);

    return this;
  }

  useSass() {
    const { sass: sassRuleOptions, modules: cssModules, modulesWithAffix } = this.options;
    const rules = [];
    const loaders = [];

    this.rule(loaders, { cssModules, useSass: true });

    rules.push({
      test: sassRuleOptions.test,
      exclude: sassRuleOptions.modules,
      use: loaders,
      sideEffects: !this.isDev
    });
    if (modulesWithAffix) {
      const loaders = [];
      rules.push({
        test: sassRuleOptions.modules,
        use: loaders
      });
      this.rule(loaders, { cssModules: true, useSass: true });
    }

    const { oneOf } = this.chain.module.rules.find(isOneOf);
    oneOf.splice(oneOf.length - 1, 0, ...rules);

    return this;
  }

  useCss() {
    const { css: cssRuleOptions, modules: cssModules, modulesWithAffix } = this.options;
    const rules = [];
    const loaders = [];

    this.rule(loaders, { cssModules });

    rules.push({
      test: cssRuleOptions.test,
      exclude: cssRuleOptions.modules,
      use: loaders,
      sideEffects: !this.isDev
    });
    if (modulesWithAffix) {
      const loaders = [];
      rules.push({
        test: cssRuleOptions.modules,
        use: loaders
      });
      this.rule(loaders, { cssModules: true });
    }

    const { oneOf } = this.chain.module.rules.find(isOneOf);
    oneOf.splice(oneOf.length - 1, 0, ...rules);

    return this;
  }

}

module.exports = RewiredRule;
