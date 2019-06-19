import poststylus from 'poststylus';
import { UmiRule } from '../../index';

export default {
  urlLoaderExcludes: [
    /\.styl$/,
  ],
  chainWebpack(config) {
    // const rule = new UmiRule(config, {
    //   modules: true // 开启css modules
    // });

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
