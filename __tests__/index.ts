import path from 'path';
import pluginTester from 'babel-plugin-tester';
import plugin from 'babel-plugin-macros';

const babelOptions = {
  presets: [
    '@babel/preset-typescript',
  ],
};

pluginTester({
  plugin,
  babelOptions,
  title: 'concurrently.macro',
  filename: __filename,
  fixtures: path.join(__dirname, '__fixtures__'),
});
