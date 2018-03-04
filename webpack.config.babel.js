import GasPlugin from 'gas-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import path from 'path';

export default {
  context: path.resolve(__dirname, 'src'),
  entry: {
    code: './code.js',
    props: './props.js',
    redmine: './redmine.js',
    toggl: './toggl.js',
    utils: './utils',
  },
  output: {
    path: path.resolve(__dirname, 'dest'),
    filename: '[name].js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: 'babel-loader',
      },
    ],
  },
  plugins: [
    new GasPlugin(),
    new HtmlWebpackPlugin({
      filename: 'sidebar.html',
      template: 'sidebar.html',
      inject: false,
    }),
    new HtmlWebpackPlugin({
      filename: 'setting_dialog.html',
      template: 'setting_dialog.html',
      inject: false,
    }),
  ],
};
