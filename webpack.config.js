const path = require('path');
const fixtures = path.resolve(__dirname, 'fixtures');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
    },
  module: {
    rules: [
      ],
      
    },
    
};