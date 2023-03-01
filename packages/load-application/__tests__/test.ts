import loadApplication from '../src';
import path from 'path';

loadApplication({
  template: 'start-fc-http-nodejs14@1.1.14',
  dest: path.join(__dirname, '_temp'),
});
