import { autoService } from 'knifecycle';
import { noop } from '../libs/utils.js';
import { YError } from 'yerror';
import type { Service } from 'knifecycle';
import type { LogService } from 'common-services';

export default autoService(initImporter) as typeof initImporter;

export type ImporterService<M> = (path: string) => Promise<M>;

/**
 * Allow to import ES modules.
 * @param  {string} path
 * The module path
 * @return {Promise<Object>}
 * A promise of an imported module.
 */
async function initImporter<M extends Service>({
  log = noop,
}: {
  log: LogService;
}): Promise<ImporterService<M>> {
  const importer = async (path: string) => {
    log('debug', `🛂 - Dynamic import of "${path}".`);
    try {
      return await import(path);
    } catch (err) {
      log('debug', `⚠️ - Got a runtime import error for "${path}" !`);
      log('debug-stack', (err as Error).stack || 'no_stack_trace');
      throw YError.wrap(err as Error, 'E_RUNTIME_IMPORT_FAILURE', path);
    }
  };

  log('debug', '🛂 - Initializing the importer!');

  return importer;
}
