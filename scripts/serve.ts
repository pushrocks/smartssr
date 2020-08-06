import * as smartserve from '@pushrocks/smartserve';
import * as path from 'path';

const smartserveInstance = new smartserve.SmartServe({
  injectReload: true,
  serveDir: path.join(__dirname, '../.nogit/')
});

smartserveInstance.start();