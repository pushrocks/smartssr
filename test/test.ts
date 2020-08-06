import { expect, tap } from '@pushrocks/tapbundle';
import * as smartssr from '../ts/index';

let testSSRInstance: smartssr.SmartSSR;

tap.test('should create a valid smartssr instance', async () => {
  testSSRInstance = new smartssr.SmartSSR({
    debug: true
  });
});

tap.test('should start the smartssr instance', async () => {
  await testSSRInstance.start();
});

tap.test('should render central.eu', async tools => {
  await testSSRInstance.renderPage('https://central.eu/article/5e76873b9cf69b7bf6bc78bc/Introducing%3A%20central.eu');
});

tap.skip.test('should render lossless.com', async () => {
  await testSSRInstance.renderPage('https://lossless.com');
});

tap.skip.test('should render https://lossless.gmbh', async () => {
  const renderedPage = await testSSRInstance.renderPage('https://lossless.gmbh');
});

tap.test('should stop the smartssr instance', async () => {
  await testSSRInstance.stop();
});

tap.start();
