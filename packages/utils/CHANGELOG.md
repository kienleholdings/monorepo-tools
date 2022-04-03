# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2022-03-03

### Added

- Added a function to execute a single command and capture the output as a string

### Changed

- N / A

### Removed

- N / A

## [0.1.1] - 2022-01-24

### Added

- Added a function to only scan for folders in the provided packages directory (users were
reporting bugs where `.DS_STORE` files were showing up as packages)

### Changed

- Replaced `__dirname` with `process.cwd()` to use the directory where the script is executed, not
the directory where the module is stored
- Changed directory resolution from `path.join()` to `path.resolve()` for finding packages

### Removed

- N / A

## [0.1.0] - 2022-01-24

### Added

- Initial Release

### Changed

- N / A

### Removed

- N / A
