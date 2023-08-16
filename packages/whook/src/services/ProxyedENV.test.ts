import { describe, test, beforeEach, jest, expect } from '@jest/globals';
import initEnv from './ProxyedENV.js';
import { NodeEnv } from 'common-services';
import type { LogService } from 'common-services';

describe('initEnv', () => {
  const log = jest.fn<LogService>();
  const readFile = jest.fn<(path: string) => Promise<Buffer>>();

  beforeEach(() => {
    log.mockReset();
    readFile.mockReset();
  });

  test('should work', async () => {
    readFile.mockResolvedValueOnce(
      Buffer.from(
        `DB_PASSWORD=oudelali
DB_HOST = 'localhost'
`,
      ),
    );

    const ENV = await initEnv({
      PROXYED_ENV_VARS: ['DB_PASSWORD'],
      NODE_ENV: NodeEnv.Development,
      APP_ENV: 'local',
      BASE_ENV: { ['KEY_BASE_ENV' as NodeEnv]: 'test' },
      PROCESS_ENV: { ['KEY_PROCESS_ENV' as NodeEnv]: 'test' },
      PROJECT_DIR: '/home/whoami/my-whook-project',
      log,
      readFile,
    });

    expect({
      ENV,
      logCalls: log.mock.calls.filter(([type]) => !type.endsWith('stack')),
      readFileCalls: readFile.mock.calls,
    }).toMatchInlineSnapshot(`
{
  "ENV": {
    "DB_PASSWORD": "oudelali",
    "NODE_ENV": "development",
  },
  "logCalls": [
    [
      "debug",
      "♻️ - Loading the environment service.",
    ],
    [
      "debug",
      "🖥 - Using the process env.",
    ],
    [
      "debug",
      "💾 - Trying to load .env file at "/home/whoami/my-whook-project/.env.node.development".",
    ],
    [
      "debug",
      "💾 - Trying to load .env file at "/home/whoami/my-whook-project/.env.app.local".",
    ],
    [
      "warning",
      "🖬 - Loaded .env file at "/home/whoami/my-whook-project/.env.node.development".",
    ],
    [
      "debug",
      "🚫 - No file found at "/home/whoami/my-whook-project/.env.app.local".",
    ],
    [
      "warning",
      "🔂 - Running with "development" node environment.",
    ],
    [
      "warning",
      "🔂 - Running with "local" application environment.",
    ],
    [
      "debug",
      "♻️ -Filtering environment for build.",
    ],
  ],
  "readFileCalls": [
    [
      "/home/whoami/my-whook-project/.env.node.development",
    ],
    [
      "/home/whoami/my-whook-project/.env.app.local",
    ],
  ],
}
`);
  });
});
