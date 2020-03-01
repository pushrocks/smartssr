import * as plugins from './smartssr.plugins';
import * as paths from './smartssr.paths';

import { serializeFunction } from './smartssr.function.serialize';

/**
 *
 */
export class SmartSSR {
  public browser: plugins.smartpuppeteer.puppeteer.Browser;
  public async start() {
    this.browser = await plugins.smartpuppeteer.getEnvAwareBrowserInstance();
  }
  public async stop() {
    if (this.browser) {
      await plugins.smartdelay.delayFor(3000);
      await this.browser.close();
      this.browser = null;
    } else {
      console.log('browser was not in started mode');
    }
  }

  public async renderPage(urlArg: string) {
    const overallTimeMeasurement = new plugins.smarttime.HrtMeasurement();
    overallTimeMeasurement.start();
    const resultDeferred = plugins.smartpromise.defer<string>();
    const context = await this.browser.createIncognitoBrowserContext();
    const page = await context.newPage();
    page.on('console', msg => {
      console.log(`${urlArg}: ${msg.text()}`);
    });

    page.on('load', async (...args) => {
      // await plugins.smartdelay.delayFor(2000);
      await page.$eval('body', serializeFunction);
      const pageContent = await page.content();
      const renderedPageString = pageContent;
      resultDeferred.resolve(renderedPageString);
      plugins.smartfile.memory.toFsSync(
        renderedPageString,
        plugins.path.join(paths.noGitDir, 'test.html')
      );
    });

    const renderTimeMeasurement = new plugins.smarttime.HrtMeasurement();
    renderTimeMeasurement.start();
    await page.goto(urlArg);
    const result = await resultDeferred.promise;
    renderTimeMeasurement.stop();

    // lets clean up async
    context.close();

    overallTimeMeasurement.stop();
    console.log(`Overall it took ${overallTimeMeasurement.milliSeconds} milliseconds to render ${urlArg}`);
    console.log(`The rendering alone took ${renderTimeMeasurement.milliSeconds} milliseconds for ${urlArg}`)
    return result;
  }
}
