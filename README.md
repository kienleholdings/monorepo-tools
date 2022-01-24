# Monorepo Tools

> A few useful monorepo commands inspired by Lerna

## Introduction

Monorepos can be wonderful tools. The ability to keep like-packages together and handle
interconnected dependencies effortlessly makes them ideal for large organizations with many
packages tht need to work in harmony. We tried a lot of tools to make managing monorepos easier at
Kienle Holdings. Lerna wasn't kept up-to-date and brought security vulnerabilities to our repos,
Rush was too large and complex for the scale we were working with, and Nx locked us into certain
build configurations which left us unsure about future scalability. In the end, we decided to
create our own set of tools for working with monorepos inspired by Lerna but written and maintained
the way that we like it.

## Usage

For usage instructions, please view the readme inside of the individual package you'd like to use.
These readmes are

- [mrt-publish](packages/publish/README.md)
- [mrt-run](packages/run/README.md)
- [mrt-utils](packages/utils/README.md)

## Local Development

### Prerequisites

- [Visual Studio Code](https://code.visualstudio.com/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
- [Remote Containers Extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)

### Setup

1. Open VS Code
1. Open the command pallette (`cmd + shift + p`)
1. Run the command `Remote-Containers: Open Folder in Container`
1. Open the repository folder

### Creating a Full Build

This package eats its own dogfood. In essence, that means we test our own scripts by using them how
a real user would. Because of this, you may need to run `pnpm run first-time-prebuild` before you
can create a production build. This command ensures that our utilities and run packages are built
before we attempt to use them. From there, you can run `pnpm run build` to produce a full build of
each package

### Testing

Assuming you've run the instructions above in [Creating a Full Build](#creating-a-full-build) you
may run the following commands to run tests

- `pnpm run lint`
- `pnpm run test`
