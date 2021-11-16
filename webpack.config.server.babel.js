import nodeExternals from 'webpack-node-externals';
import paths from './config/paths';

const appServerConfig = {
  mode: 'production',
  target: 'node',
  entry: { app: './app.js' },
  output: {
    path: paths.dist + "/server",
    filename: '[name].js'
  },
  node: {
    // Need this when working with express, otherwise the build fails
    __dirname: false,   // if you don't put this is, __dirname
    __filename: false,  // and __filename return blank or /
  },
  externals: [nodeExternals()], // Need this to avoid error when working with Express
  module: {
    rules: [
      {
        // Transpiles ES6-8 into ES5
        test: /\.js$/,
        // exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      }
    ]
  }
};

export default [ appServerConfig ];