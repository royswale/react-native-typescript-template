/* eslint-disable */
const execSync = require('child_process').execSync;
const fs = require('fs');
const moduleNames = require('./moduleNames');

const pjson = require('../package.json');
const localPrefix = `${pjson.name}/`;

const modulePaths = moduleNames.map(moduleName => {
  if (moduleName.startsWith(localPrefix)) {
    return `./${moduleName.substring(localPrefix.length)}`;
  }
  if (moduleName.endsWith('.js')) {
    return `./node_modules/${moduleName}`;
  }
  try {
    const result = execSync(
      `grep "@providesModule ${moduleName}" $(find . -name ${moduleName}\\\\.js) -l`
    )
      .toString()
      .trim()
      .split('\n')[0];
    if (result != null) {
      return result;
    }
  } catch (e) {
    return null;
  }
  return null;
});

const paths = modulePaths
  .filter(path => path != null)
  .map(path => `'${path}'`)
  .join(',\n');

const fileData = `module.exports = [${paths}];`;

fs.writeFile('./packager/modulePaths.js', fileData, err => {
  if (err) {
    console.log(err);
  }

  console.log('Done');
});