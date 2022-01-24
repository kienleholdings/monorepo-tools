# mrt-run

> Run parallel commands in monorepos with no fuss

## Installation

With pnpm (recommended)

```
pnpm install @kienleholdings/mrt-run
```

With yarn

```
yarn add @kienleholdings/mrt-run
```

With npm

```
npm install @kienleholdings/mrt-run
```

## Usage

`mrt-run <package.json script name here> <options>`

## Example

`mrt-run test --npmCommand yarn --packagesDir ./other-packages --parallel`

## Options

### `--npmCommand <name>`

By default, `mrt-run` uses `pnpm` for command execution. You may want to use `yarn` or `npm`
instead, thus you can change what client we use to execute commands from here

### `--packagesDir <directory>`

By default, `mrt-run` searches for packages in `./packages`. If you keep your packages in a
different directory, you can specify that with this option

### `--parallel`

Runs commands in each package simultaneously. Generally recommended, but you may want to omit this
if your machine is lower-spec