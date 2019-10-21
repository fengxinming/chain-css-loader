# chain-css-loader

> 简化在 [umi](https://github.com/umijs/umi) 和 [create-react-app](https://github.com/facebook/create-react-app) 中使用 [stylus](http://stylus-lang.com/), 也支持`less`和`sass`.(目前支持 css-loader@2)

[![npm package](https://nodei.co/npm/chain-css-loader.png?downloads=true&downloadRank=true&stars=true)](https://www.npmjs.com/package/chain-css-loader) [![NPM version](https://img.shields.io/npm/v/chain-css-loader.svg?style=flat)](https://npmjs.org/package/chain-css-loader) [![NPM Downloads](https://img.shields.io/npm/dm/chain-css-loader.svg?style=flat)](https://npmjs.org/package/chain-css-loader)

<div align="center">
  <img width="180" height="180" vspace="20"
    src="https://cdn.worldvectorlogo.com/logos/css-3.svg">
  <a href="https://github.com/webpack/webpack">
    <img width="200" height="200"
      src="https://webpack.js.org/assets/icon-square-big.svg">
  </a>
</div>

---

## 目录

  - [安装](#安装)
  - [API 相关](#API-相关)
  - [使用说明](#使用说明)
    - [在 umijs 中使用添加stylus支持](#在-umijs-中使用添加stylus支持)
    - [在 create-react-app 中使用添加stylus支持](#在-create-react-app-中使用添加stylus支持)
  - [使用事例](#使用事例)
  - [更新记录](#更新记录)

---

## 安装

```
npm install chain-css-loader --save-dev
```

---

## API-相关

* chain-css-loader
  * UmiRule
    * new UmiRule( webpackChain [, options] )
      * _instance_
        * useStylus() ⇒ <code>UmiRule</code>
        * useLess() ⇒ <code>UmiRule</code>
        * useSass() ⇒ <code>UmiRule</code>
        * useCss() ⇒ <code>UmiRule</code>
        * extractCss() ⇒ <code>UmiRule</code>

      * _static_
  * RewiredRule
    * new RewiredRule( webpackConfig [, options] )
      * _instance_
        * useStylus() ⇒ <code>RewiredRule</code>
        * useLess() ⇒ <code>RewiredRule</code>
        * useSass() ⇒ <code>RewiredRule</code>
        * useCss() ⇒ <code>RewiredRule</code>
        * extractCss() ⇒ <code>RewiredRule</code>

      * _static_

`new UmiRule`

* 可选参数
  * `cssPublicPath` 默认 '/', css在浏览器中被访问的跟路径
  * `cwd` 默认 `process.cwd()`
  * `modulesWithAffix` 默认 true, 对 *.module.[ext] 结尾的文件启用 CSS Modules
  * `modules` 默认 false, 只对 *.module.[ext] 结尾的文件启用 CSS Modules; 如果设置为 true, 对所有 *.(css|scss|sass|less|styl(us)?) 启用 CSS Modules
  * `sourceMap` 默认 true, 是否生成 .map 文件, 只在非开发环境生效
  * `compress` 默认 true, 是否压缩css, 只在非开发环境生效
  * `usePoststylus` 默认 false, 是否自行使用 poststylus 插件替换内置 postcss-loader
  * `autoprefixer`
    * `browsers` 浏览器兼容版本, 建议配置在 `.browserslistrc` 文件中
    * `flexbox` 默认 `no-2009`
  * `compress` 压缩css配置
    * `mergeRules` 默认 false,
    * `normalizeUrl` 默认 false,
    * `mergeLonghand` 默认 false,
    * `cssDeclarationSorter` 默认 false
  * `stylus` stylus-loader 配置
    * `test` 默认 /\.styl(us)?$/
    * `modules` 默认 /\.module\.styl(us)?$/
    * `loader` 默认 'stylus-loader'
    * `options` stylus 配置参数
  * `ssr` 跟 umijs 保持一致

---

## 使用说明

### 在 umijs 中使用添加stylus支持

```
npm install stylus stylus-loader --save-dev
```

#### 一般使用

- 添加以下代码至 `.umirc.js`

```
import { UmiRule } from 'chain-css-loader';

export default {
  urlLoaderExcludes: [
    /\.styl$/,
  ],
  chainWebpack(config) {
    const rule = new UmiRule(config, {
      modules: true // start up CSS modules
    });
    rule.useStylus();
    return config;
  }
}
```

#### 高级特性

- 使用 [poststylus](https://github.com/seaneking/poststylus) 替换 [postcss](https://github.com/postcss/postcss)

```
npm install poststylus postcss-flexbugs-fixes autoprefixer rucksack-css --save-dev
```

- 添加以下代码至 `.umirc.js`

```
import poststylus from 'poststylus';
import { UmiRule } from 'chain-css-loader';

export default {
  urlLoaderExcludes: [
    /\.styl$/,
  ],
  chainWebpack(config) {
    const rule = new UmiRule(config, {
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
}
```

- 运行`umijs`时可能报 browserslist 相关警告，需要添加以下代码至 `.browserslistrc`

```
>1%
last 4 versions
Firefox ESR
not ie < 9
```

### 在 create-react-app 中使用添加stylus支持

```
npm install stylus stylus-loader --save-dev
```

#### 简单使用

- 添加以下代码至 `config-overrides.js`, 前提是使用了`react-app-rewired`模块, 而不是导出webpack配置

```
const { RewiredRule } = require('chain-css-loader');

module.exports = {
  webpack(config, env) {
    const rule = new RewiredRule(config, {
      modules: true
    });
    rule.useStylus();

    return config;
  }
};
```

#### 高级特性

- 使用 [poststylus](https://github.com/seaneking/poststylus) 替换 [postcss](https://github.com/postcss/postcss)

```
npm install poststylus postcss-flexbugs-fixes autoprefixer rucksack-css --save-dev
```

- 添加以下代码至 `config-overrides.js`

```
const poststylus = require('poststylus');
const { RewiredRule } = require('chain-css-loader');

module.exports = {
  webpack(config, env) {
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
};
```

---

## 使用事例

  - [umi](examples/umi)
  - [create-react-app](examples/create-react-app)

---

## 更新记录

  * 1.1.3
    * 更新`lodash`

  * 1.1.2
    * 修复对`css-loader`传参问题
  
  * 1.1.1
    * 修复对 CSS Modules 的支持问题

  * 1.1.0
    * 支持在`create-react-app`脚手架中使用`stylus`、`less`、`sass`等

  * 1.0.0
    * 支持在`umi`项目中使用`stylus`等
