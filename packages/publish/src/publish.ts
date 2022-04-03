import {
  executeCommandsInOrder,
  executeCommandsParallel,
  executeCommandWithLocalOutput,
  getPackagesFromDirectory,
  logError,
  Package,
  RunArgs,
} from '@kienleholdings/mrt-utils';

import semver from 'semver';

const publish = async (args: RunArgs): Promise<void> => {
  const { npmCommand, packagesDir, parallel } = args;

  let allPackages: Package[];
  try {
    allPackages = await getPackagesFromDirectory(packagesDir);
  } catch (err) {
    logError(err.message);
    process.exit(1);
  }

  const rawPackageVersions = await Promise.all(
    allPackages.map((pkg) =>
      executeCommandWithLocalOutput(npmCommand, ['view', pkg.jsonContents?.name || '', 'version'])
    )
  );

  const latestPackageVersions = rawPackageVersions.map((version) => {
    // ackages that don't exist can sometimes show up as a 404, so by default we'll return 0.0.0 for those
    if (version.includes('npm ERR! code E404')) {
      return '0.0.0';
    }
    return version.trimEnd();
  });

  const packagesWithNewerVersion: Package[] = [];
  allPackages.forEach((pkg, key) => {
    if (semver.gt(pkg.jsonContents?.version ?? '', latestPackageVersions[key])) {
      packagesWithNewerVersion.push(pkg);
    }
  });

  const executionFunction = parallel ? executeCommandsParallel : executeCommandsInOrder;

  try {
    await executionFunction(packagesWithNewerVersion, npmCommand, ['publish']);
  } catch (err) {
    logError(err.message);
    process.exit(1);
  }
};

export default publish;
