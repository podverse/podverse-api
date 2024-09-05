const moduleAlias = require('module-alias');
const path = require('path');

moduleAlias.addAliases({
  '@api': path.join(__dirname, '')
});

export {};
