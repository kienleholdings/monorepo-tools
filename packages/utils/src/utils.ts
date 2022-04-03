import execa, { ExecaError } from 'execa';
import { readdir, readFile } from 'fs/promises';
import { join, resolve } from 'path';

export interface RunArgs {
  npmCommand: string;
  packagesDir: string;
  parallel: boolean;
}

export interface Package {
  fullPath: string;
  name: string;
  jsonContents: { name?: string; scripts?: { [key: string]: string }; version?: string };
}

export const RESET_COLOR = '\x1b[0m';
export const ERROR_COLOR = '\x1b[31m';
export const COMMAND_COLOR_LIST = [
  '\x1b[32m',
  '\x1b[33m',
  '\x1b[34m',
  '\x1b[35m',
  '\x1b[36m',
  '\x1b[37m',
];

export const logError = (message: string): void => {
  // This method is designed to surface errors to users thus we're disabling no-console
  // eslint-disable-next-line no-console
  console.error(`${ERROR_COLOR}${message}`);
};

export const getPackagesFromDirectory = async (packagesDir: string): Promise<Package[]> => {
  const resolvedPackagesDir = resolve(process.cwd(), packagesDir);

  let pkgPaths: string[];
  try {
    pkgPaths = (await readdir(resolvedPackagesDir, { withFileTypes: true }))
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name);
  } catch (err) {
    throw new Error(
      `There was an error reading the directory ${resolvedPackagesDir}: ${err.message}`
    );
  }

  try {
    const parsedPkgList = (
      await Promise.all(
        pkgPaths.map((pkg) => readFile(join(resolvedPackagesDir, pkg, 'package.json')))
      )
    ).map((pkg, key) => ({
      fullPath: join(resolvedPackagesDir, pkgPaths[key]),
      name: `${COMMAND_COLOR_LIST[key] || COMMAND_COLOR_LIST[5]}[${pkgPaths[key]}]`,
      jsonContents: JSON.parse(pkg.toString()),
    }));

    return parsedPkgList;
  } catch (err) {
    throw new Error(
      `There was an error searching for packages inside ${resolvedPackagesDir}: ${err.message}`
    );
  }
};

export const parseCommandLogs = (log: Buffer, prefix: string): void => {
  log
    .toString()
    .split(/\r?\n/)
    .filter((logString) => logString.length > 0)
    // Disabling the no-console rule here since this is a feature we want to ship
    // eslint-disable-next-line no-console
    .forEach((logString) => console.info(`${RESET_COLOR}${prefix}: ${logString}`));
};

export const handleExecaError = (err: ExecaError, packageName: string): void => {
  if (err.shortMessage) {
    throw new Error(`${packageName.split('m')[1]}: ${err.shortMessage}`);
  }
  throw err;
};

// In order to structure variable output in a predictable way, this is never run parallel
export const executeCommandWithLocalOutput = async (
  command: string,
  args: string[]
): Promise<string> => {
  let output = '';
  const commandPromise = execa(command, args);

  // eslint-disable-next-line no-loop-func
  commandPromise.stdout?.on('data', (log) => {
    output += log;
  });
  // eslint-disable-next-line no-loop-func
  commandPromise.stderr?.on('data', (log) => {
    output += log;
  });

  try {
    // We're intentionally removing parallel processing, therefor I'm disabling this rule
    // eslint-disable-next-line no-await-in-loop
    await commandPromise;
  } catch (err) {
    output = err.message;
  }
  return output;
};

export const executeCommandsParallel = async (
  packages: Package[],
  command: string,
  args: string[]
): Promise<void> => {
  const commandPromises = packages.map((pkg) => {
    const cmd = execa(command, args, { cwd: pkg.fullPath });
    cmd.stdout?.on('data', (log) => parseCommandLogs(log, pkg.name));
    cmd.stderr?.on('data', (log) => parseCommandLogs(log, pkg.name));
    return cmd.catch((err) => {
      handleExecaError(err, pkg.name);
    });
  });

  await Promise.all(commandPromises);
};

export const executeCommandsInOrder = async (
  packages: Package[],
  command: string,
  args: string[]
): Promise<void> => {
  for (let pkgIndex = 0; pkgIndex < packages.length; pkgIndex += 1) {
    const commandPromise = execa(command, args, {
      cwd: packages[pkgIndex].fullPath,
    });

    commandPromise.stdout?.on('data', (log) => parseCommandLogs(log, packages[pkgIndex].name));
    commandPromise.stderr?.on('data', (log) => parseCommandLogs(log, packages[pkgIndex].name));

    try {
      // We're intentionally removing parallel processing, therefor I'm disabling this rule
      // eslint-disable-next-line no-await-in-loop
      await commandPromise;
    } catch (err) {
      handleExecaError(err, packages[pkgIndex].name);
    }
  }
};
