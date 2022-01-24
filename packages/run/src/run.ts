import {
  executeCommandsInOrder,
  executeCommandsParallel,
  getPackagesFromDirectory,
  logError,
  Package,
  RunArgs,
} from '@kienleholdings/mrt-utils';

const run = async (args: RunArgs, fullCommand: string): Promise<void> => {
  const { npmCommand, packagesDir, parallel } = args;
  const command = fullCommand.split(' ');

  let allPackages: Package[];
  try {
    allPackages = await getPackagesFromDirectory(packagesDir);
  } catch (err) {
    logError(err.message);
    process.exit(1);
  }

  const packagesWithCommand: Package[] = [];
  allPackages.forEach((pkg) => {
    if (pkg.jsonContents?.scripts?.[command[0]]) {
      packagesWithCommand.push(pkg);
    }
  });

  const executionFunction = parallel ? executeCommandsParallel : executeCommandsInOrder;

  try {
    await executionFunction(packagesWithCommand, npmCommand, ['run', ...command]);
  } catch (err) {
    logError(err.message);
  }
};

export default run;
