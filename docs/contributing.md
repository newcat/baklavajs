# Contributing

## Setup

1. BaklavaJS is a monorepo managed using [lerna](https://github.com/lerna/lerna). Therefore you need to have lerna installed before setting up this repo:

> A little note on the NPM vs Yarn discussion: This repo is set up to use Yarn workspaces. It is highly recommended to use Yarn as the package manager for this project.

```bash
yarn global add lerna # when using Yarn
```

2. Now clone the repository:

```bash
git clone https://github.com/newcat/baklavajs.git
cd baklavajs
```

3. Setup all dependencies:

```bash
lerna bootstrap
```

4. Build the packages:

```bash
lerna run build
```

5. Run the playground:

```bash
yarn run playground
```

## Project Structure
This project is pretty much a normal monorepo except for some Typescript-specialties. In addition to the `src` folder, most packages have a `types` folder, which contains interfaces for all relevant types in the respective package. Packages only reference interfaces from other packages in this `types` folder. This decouples the packages and ensures that no functionality of other packages is included in the webpack build while still allowing direct referencing of packages and therefore fast and easy development.