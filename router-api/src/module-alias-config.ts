const moduleAlias = require('module-alias');
const path = require('path');

const aliases = {
  '@helpers': path.join(__dirname, '../../helpers/src'),
  '@orm': path.join(__dirname, '../../orm/src'),
  '@parser': path.join(__dirname, '../../parser/src'),
  '@queue': path.join(__dirname, '../../queue/src'),
  '@router-api': path.join(__dirname, '')
};

moduleAlias.addAliases(aliases);
