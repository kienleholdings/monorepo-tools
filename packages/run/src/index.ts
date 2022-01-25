#!/usr/bin/env node
import { RunArgs } from '@kienleholdings/mrt-utils';
import minimistLite from 'minimist-lite';
import run from './run';

const DEFAULT_ARGS: RunArgs = {
  npmCommand: 'pnpm',
  packagesDir: 'packages',
  parallel: false,
};

const { _: cmd = [], ...providedArgsArray } = minimistLite(process.argv.slice(2));
const providedArgsObject: Partial<RunArgs> = {};

if (!cmd.length) {
  // eslint-disable-next-line no-console
  console.error('Fatal Error: No command to run specified');
  process.exit(1);
}

Object.keys(DEFAULT_ARGS).forEach((argKey) => {
  if (providedArgsArray[argKey]) {
    // Casting this to any here becauase from the above line we've already verified that no invalid
    // args will be passed
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (providedArgsObject as any)[argKey] = providedArgsArray[argKey];
  }
});

run({ ...DEFAULT_ARGS, ...providedArgsObject }, cmd?.[0]);
