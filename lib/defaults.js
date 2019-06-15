'use strict';

exports.defaultOptions = {
  cwd: process.cwd(), // 上下文路径，默认当前程序运行路径
  filenameHashing: true, // 生成的静态资源在它们的文件名中包含了 hash 以便更好的控制缓存
  modules: false, // 默认只有 *.module.[ext] 结尾的文件才会被视作 CSS Modules 模块。设置为 true 后你就可以去掉文件名中的 .module 并将所有的 *.(css|scss|sass|less|styl(us)?) 文件视为 CSS Modules 模块
  modulesWithAffix: true, // 把 *.module.[ext] 文件视为 CSS Modules 模块
  sourceMap: true, // 是否为 CSS 开启 source map
  compress: true, // 压缩css
  usePoststylus: false, // 是否使用poststylus替换postcss，当使用stylus-loader时

  stylus: {
    test: /\.styl(us)?$/,
    loader: 'stylus-loader',
    options: {
      preferPathResolver: 'webpack'
    }
  },

  less: {
    test: /\.less$/,
    loader: 'less-loader',
    options: {
      javascriptEnabled: true
    }
  },

  sass: {
    test: /\.(sass|scss)$/,
    loader: 'sass-loader',
    options: {
      indentedSyntax: true
    }
  },

  css: {
    test: /\.css$/,
    loader: 'css-loader-1',
    options: {}
  },

  postcss: {
    test: /\.p(ost)?css$/,
    loader: 'postcss-loader',
    ident: 'postcss',
    options: {}
  }
};

exports.defaultBrowsers = [
  '>1%',
  'last 4 versions',
  'Firefox ESR',
  'not ie < 9' // React doesn't support IE8 anyway
];
