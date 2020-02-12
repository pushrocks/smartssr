import { expect, tap } from '@pushrocks/tapbundle';
import * as smartssr from '../ts/index';

let testSSRInstance: smartssr.SmartSSR;

tap.test('should create a valid smartssr instance', async () => {
  testSSRInstance = new smartssr.SmartSSR();
});

tap.test('should start the smartssr instance', async () => {
  await testSSRInstance.start();
});

tap.test('should render central.eu', async (tools) => {
  await testSSRInstance.renderPage('https://central.eu');
});

tap.test('should render lossless.com', async () => {
  await testSSRInstance.renderPage('https://lossless.com');
});

tap.test('should render https://lossless.gmbh', async () => {
  await testSSRInstance.renderPage('https://lossless.gmbh');
});

tap.test('should stop the smartssr instacne', async () => {
  await testSSRInstance.stop();
});

tap.start();
