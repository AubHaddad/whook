import { name, autoService } from 'knifecycle';

import { definition as getPingDefinition } from '../handlers/getPing';
import { definition as getTimeDefinition } from '../handlers/getTime';

export default name('API', autoService(initAPI));

async function initAPI({ CONFIG }) {
  const API = {
    host: CONFIG.host,
    basePath: CONFIG.basePath,
    schemes: CONFIG.schemes,
    securityDefinitions: {
      basicAuth: {
        type: 'basic',
      },
    },
    swagger: '2.0',
    info: {
      version: CONFIG.version,
      title: CONFIG.name,
      description: CONFIG.description,
    },
    paths: {
      [getPingDefinition.path]: {
        [getPingDefinition.method]: getPingDefinition.operation,
      },
      [getTimeDefinition.path]: {
        [getTimeDefinition.method]: getTimeDefinition.operation,
      },
    },
  };

  return API;
}
