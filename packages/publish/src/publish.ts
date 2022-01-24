import {
  executeCommandsInOrder,
  executeCommandsParallel,
  getPackagesFromDirectory,
  logError,
  Package,
  RunArgs,
} from '@kienleholdings/mrt-utils';

import axios from 'axios';
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

  let latestPackageVersions: string[];
  try {
    latestPackageVersions = (
      await Promise.all(
        allPackages.map((pkg) =>
          axios.get(`https://registry.npmjs.org/-/package/${pkg.jsonContents.name}/dist-tags`, {
            // Packages that don't exist can sometimes show up as unauthorized, we'll leave this for now
            validateStatus: (statusCode) =>
              statusCode >= 200 && (statusCode < 300 || statusCode === 401),
          })
        )
      )
    ).map((res) => (res.data === 'Unauthorized' ? '0.0.0' : res.data.latest));
  } catch (err) {
    logError(err.message);
    process.exit(1);
  }

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
