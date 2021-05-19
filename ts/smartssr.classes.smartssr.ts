import * as plugins from './smartssr.plugins';
import * as paths from './smartssr.paths';

import { serializeFunction } from './smartssr.function.serialize';

export interface ISmartSSROptions {
  debug: boolean;
}

/**
 *
 */
export class SmartSSR {
  public browser: plugins.smartpuppeteer.IncognitoBrowser;
  public options: ISmartSSROptions;

  constructor(optionsArg?: ISmartSSROptions) {
    this.options = {
      ...{
        debug: false,
      },
      ...optionsArg,
    };
  }

  public async start() {
    this.browser = new plugins.smartpuppeteer.IncognitoBrowser();
    await this.browser.start();
  }
  public async stop() {
    if (this.browser) {
      await plugins.smartdelay.delayFor(3000);
      await this.browser.stop();
      this.browser = null;
    } else {
      console.log('browser was not in started mode');
    }
  }

  public async renderPage(urlArg: string) {
    const overallTimeMeasurement = new plugins.smarttime.HrtMeasurement();
    overallTimeMeasurement.start();
    const resultDeferred = plugins.smartpromise.defer<string>();
    const context = await this.browser.getNewIncognitoContext();
    const page = await context.newPage();

    // lets protext against left open tabs
    plugins.smartdelay.delayFor(30000).then(() => {
      if (!page.isClosed) {
        page.close();
        context.close();
        throw new Error(`failed to render ${urlArg}`);
      }
      
    });

    page.on('console', (msg) => {
      console.log(`${urlArg}: ${msg.text()}`);
    });

    const renderTimeMeasurement = new plugins.smarttime.HrtMeasurement();
    renderTimeMeasurement.start();
    await page.goto(urlArg, {
      waitUntil: 'networkidle2',
      timeout: 30000,
    });

    let screenshotBuffer: Buffer;

    if (this.options.debug) {
      screenshotBuffer = await page.screenshot({
        encoding: 'binary',
      });
    }

    await page.$eval('body', serializeFunction);
    const pageContent = await page.content();
    const renderedPageString = pageContent;
    resultDeferred.resolve(renderedPageString);

    const result = await resultDeferred.promise;
    renderTimeMeasurement.stop();

    // lets clean up async
    await page.close();
    await context.close();

    overallTimeMeasurement.stop();
    console.log(
      `Overall it took ${overallTimeMeasurement.milliSeconds} milliseconds to render ${urlArg}`
    );
    console.log(
      `The rendering alone took ${renderTimeMeasurement.milliSeconds} milliseconds for ${urlArg}`
    );

    // debug
    if (this.options.debug) {
      plugins.smartfile.memory.toFsSync(
        renderedPageString,
        plugins.path.join(paths.noGitDir, 'test.html')
      );
      const fs = await import('fs');
      fs.writeFileSync(plugins.path.join(paths.noGitDir, 'test.png'), screenshotBuffer);
    }

    return result;
  }
}
