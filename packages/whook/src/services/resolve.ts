import { autoService } from 'knifecycle';
import { noop } from '../libs/utils.js';
import { createRequire } from 'module';
import type { LogService } from 'common-services';

export default autoService(initResolve);

export type ResolveService = (
  id: string,
  options?: { paths?: string[] },
) => string;

/**
 * Allow to resolve a path with the module system.
 * @param  {string} path
 * The serializable constants to gather
 * @return {Promise<string>}
 * A promise of a fully qualified module path
 */
async function initResolve({
  PROJECT_DIR,
  log = noop,
}: {
  PROJECT_DIR: string;
  log: LogService;
}): Promise<ResolveService> {
  log('debug', '🛂 - Initializing the resolve service!');
  const require = createRequire(import.meta.url);

  return (
    path: Parameters<ResolveService>[0],
    options: Parameters<ResolveService>[1] = { paths: [PROJECT_DIR] },
  ) => {
    // To be replaced by import.meta.resolve
    // https://nodejs.org/api/esm.html#esm_import_meta_resolve_specifier_parent
    // We currently resolve and remove .(c)js on the fly to
    // give a chance to the compiler to resolve to esm modules
    const fqPath = require.resolve(path, options);

    log('debug', `🛂 - Resolving "${path}" to "${fqPath}".`);
    return fqPath;
  };
}
