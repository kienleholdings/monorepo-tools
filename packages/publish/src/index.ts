#!/usr/bin/env node
import { RunArgs } from '@kienleholdings/mrt-utils';
import minimistLite from 'minimist-lite';
import publish from './publish';

const DEFAULT_ARGS: RunArgs = {
  npmCommand: 'pnpm',
  packagesDir: './packages',
  parallel: false,
};

const providedArgsArray = minimistLite(process.argv.slice(2));
const providedArgsObject: Partial<RunArgs> = {};

Object.keys(DEFAULT_ARGS).forEach((argKey) => {
  if (providedArgsArray[argKey]) {
    // Casting this to any here becauase from the above line we've already verified that no invalid
    // args will be passed
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (providedArgsObject as any)[argKey] = providedArgsArray[argKey];
  }
});

publish({ ...DEFAULT_ARGS, ...providedArgsObject });
