# chain-css-loader

> create css rule with webpack-chain

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

## Table of contents

  - [Installation](#Installation)
  - [API Reference](#API-Reference)
  - [Usage](#Usage)
    - [Example for Umi](#Example-for-Umi)
      - [Sample for Umi](#Sample-for-Umi)
      - [Advanced Features for Umi](#Advanced-Features-for-Umi)
    - [Example for create-react-app](#Example-for-create-react-app)
      - [Sample](#Sample)
      - [Advanced Features](#Advanced-Features)
  - [Examples](#Examples)

---

## Installation

```
npm install chain-css-loader --save-dev
```

---

## API Reference

* chain-css-loader
  * UmiRule
    * new UmiRule( webpackConfig [, options] )
      * _instance_
        * useStylus() ⇒ <code>UmiRule</code>
        * useLess() ⇒ <code>UmiRule</code>
        * useSass() ⇒ <code>UmiRule</code>
        * useCss() ⇒ <code>UmiRule</code>
        * extractCss() ⇒ <code>UmiRule</code>

      * _static_

These are the optional config options for <code>new UmiRule</code>

* optional options
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

---

## Usage

### Example for Umi

- Below is an example for using [stylus](https://github.com/stylus/stylus) in [umi](https://github.com/umijs/umi)

```
npm install stylus stylus-loader --save-dev
```

#### Sample for Umi

- Put the following code in the file `.umirc.js` or `.umirc.local.js`

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
  }
}
```

#### Advanced Features for Umi

- Use [poststylus](https://github.com/seaneking/poststylus) instead of [postcss](https://github.com/postcss/postcss)

```
npm install poststylus postcss-flexbugs-fixes autoprefixer rucksack-css --save-dev
```

- Put the following code in the file `.umirc.js` or `.umirc.local.js`

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
  }
}
```

- Copy the following code to the file `.browserslistrc` if it exists, or create a new file named `.browserslistrc` and then put below in the file

```
>1%
last 4 versions
Firefox ESR
not ie < 9
```

### Example for create-react-app

- Below is an example for using [stylus](https://github.com/stylus/stylus) in [umi](https://github.com/umijs/umi)

```
npm install stylus stylus-loader --save-dev
```

#### Sample

- Put the following code in the file `config-overrides.js`

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

#### Advanced Features

- Use [poststylus](https://github.com/seaneking/poststylus) instead of [postcss](https://github.com/postcss/postcss)

```
npm install poststylus postcss-flexbugs-fixes autoprefixer rucksack-css --save-dev
```

- Put the following code in the file `.umirc.js` or `.umirc.local.js`

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

## Examples

  - [umi](examples/umi)
  - [create-react-app](examples/create-react-app)
