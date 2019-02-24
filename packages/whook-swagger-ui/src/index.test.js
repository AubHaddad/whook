import { constant, initializer } from 'knifecycle';
import axios from 'axios';
import { prepareServer, prepareEnvironment } from '@whook/whook';
import initHTTPRouter from '@whook/http-router';
import wrapHTTPRouterWithSwaggerUI from '.';

describe('wrapHTTPRouterWithSwaggerUI', () => {
  const HOST = 'localhost';
  const PORT = 8888;
  const API = {
    host: `${HOST}:${PORT}`,
    swagger: '2.0',
    info: {
      version: '1.0.0',
      title: 'Sample Swagger',
      description: 'A sample Swagger file for testing purpose.',
    },
    basePath: '/v1',

    schemes: ['http'],
    paths: {
      '/ping': {
        get: {
          operationId: 'getPing',
          summary: "Checks API's availability.",
          consumes: ['application/json'],
          produces: ['application/json'],
          responses: {
            '200': {
              description: 'Pong',
            },
          },
        },
      },
    },
  };
  const logger = {
    info: jest.fn(),
    error: jest.fn(),
  };
  const debug = jest.fn();
  const time = jest.fn();
  const $autoload = jest.fn(async () => ({}.undef));
  let $;

  beforeEach(() => {
    logger.info.mockReset();
    logger.error.mockReset();
    debug.mockReset();
    time.mockReset();
    $autoload.mockClear();
  });

  beforeEach(async () => {
    $ = await prepareEnvironment();

    $.register(
      initializer(
        {
          name: '$autoload',
          type: 'service',
          options: { singleton: true },
        },
        async () => $autoload,
      ),
    );
    $.register(constant('API', API));
    $.register(constant('ENV', {}));
    $.register(constant('NODE_ENV', 'test'));
    $.register(constant('HOST', HOST));
    $.register(constant('WRAPPERS', []));
    $.register(
      constant('HANDLERS', {
        getPing: jest.fn(async () => ({
          status: 200,
          headers: { 'content-type': 'application/json' },
          body: { ping: 'pong' },
        })),
      }),
    );
    $.register(constant('logger', logger));
    $.register(constant('debug', debug));
    $.register(constant('time', time));
    $.register(constant('NODE_ENVS', ['test']));
  });

  it('should work', async () => {
    $.register(constant('PORT', PORT));
    $.register(wrapHTTPRouterWithSwaggerUI(initHTTPRouter));
    $.register(constant('CONFIG', {}));
    $.register(constant('NODE_ENV', 'test'));
    $.register(constant('DEBUG_NODE_ENVS', ['test']));

    time.mockReturnValue(new Date('2010-03-06T00:00:00Z').getTime());

    const { $destroy } = await prepareServer(
      ['$destroy', 'httpServer', 'process'],
      $,
    );
    const { status, headers, data } = await axios.get(
      `http://${HOST}:${PORT}${API.basePath}/ping`,
    );

    await $destroy();

    expect({
      status,
      headers: {
        ...headers,
        // Erasing the Date header that may be added by Axios :/
        date: {}.undef,
        etag: {}.undef,
        'last-modified': {}.undef,
        server: {}.undef,
      },
      data,

      debugCalls: debug.mock.calls,
      logInfoCalls: logger.info.mock.calls,
      logErrorCalls: logger.error.mock.calls,
      autoloaderCalls: $autoload.mock.calls,
    }).toMatchSnapshot();
  });

  it('should serve Swagger HTML', async () => {
    $.register(constant('PORT', PORT + 2));
    $.register(wrapHTTPRouterWithSwaggerUI(initHTTPRouter));
    $.register(
      constant('CONFIG', {
        localURL: `http://${HOST}:${PORT + 2}`,
      }),
    );
    $.register(constant('NODE_ENV', 'test'));
    $.register(constant('DEBUG_NODE_ENVS', ['test']));

    time.mockReturnValue(new Date('2010-03-06T00:00:00Z').getTime());

    const { $destroy } = await prepareServer(
      ['$destroy', 'httpServer', 'process'],
      $,
    );
    const { status, headers, data } = await axios.get(
      `http://${HOST}:${PORT + 2}/docs`,
    );

    await $destroy();

    expect({
      status,
      headers: {
        ...headers,
        // Erasing the Date header that may be added by Axios :/
        date: {}.undef,
        etag: {}.undef,
        'last-modified': {}.undef,
        server: {}.undef,
      },
      data,

      debugCalls: debug.mock.calls,
      logInfoCalls: logger.info.mock.calls,
      logErrorCalls: logger.error.mock.calls,
      autoloaderCalls: $autoload.mock.calls,
    }).toMatchSnapshot();
  });

  it('should be bypassed with no debug env', async () => {
    $.register(constant('PORT', PORT + 1));
    $.register(wrapHTTPRouterWithSwaggerUI(initHTTPRouter));
    $.register(
      constant('CONFIG', {
        localURL: `http://${HOST}:${PORT + 1}`,
      }),
    );
    $.register(constant('NODE_ENV', 'test'));
    $.register(constant('DEBUG_NODE_ENVS', []));

    time.mockReturnValue(new Date('2012-01-15T00:00:00Z').getTime());

    const { $destroy } = await prepareServer(
      ['$destroy', 'httpServer', 'process'],
      $,
    );

    await $destroy();

    expect({
      debugCalls: debug.mock.calls,
      logInfoCalls: logger.info.mock.calls,
      logErrorCalls: logger.error.mock.calls,
      autoloaderCalls: $autoload.mock.calls,
    }).toMatchSnapshot();
  });
});
