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

    await page.goto(urlArg);
    const result = await resultDeferred.promise;
    page.close().then(async () => {
      await context.close();
    });
    return result;
  }
}
