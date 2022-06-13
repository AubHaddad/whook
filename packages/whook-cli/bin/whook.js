#! /usr/bin/env node

import path from 'path';
import run from '../dist/index.js';

const { prepareEnvironment } = await import(
  path.join(process.cwd(), 'dist', 'index.js')
);

await run(prepareEnvironment);
