# BaklavaJS

[![Build Status](https://travis-ci.org/newcat/baklavajs.svg?branch=master)](https://travis-ci.org/newcat/baklavajs)
![npm](https://img.shields.io/npm/v/baklavajs.svg)

Graph / node editor in the browser using VueJS, less than 60kb gzipped

**[Online Demo](https://codesandbox.io/s/baklavajs-example-jyc6f?file=/src/App.vue)**

![example](docs/img/example.png)

| Package | Version |
| --- | --- |
| baklavajs | ![npm](https://img.shields.io/npm/v/baklavajs.svg?style=flat-square) |
| @baklavajs/core | ![npm (scoped)](https://img.shields.io/npm/v/@baklavajs/core.svg?style=flat-square) |
| @baklavajs/plugin-engine | ![npm (scoped)](https://img.shields.io/npm/v/@baklavajs/plugin-engine.svg?style=flat-square) |
| @baklavajs/plugin-interface-types | ![npm (scoped)](https://img.shields.io/npm/v/@baklavajs/plugin-interface-types.svg?style=flat-square) |
| @baklavajs/plugin-options-vue | ![npm (scoped)](https://img.shields.io/npm/v/@baklavajs/plugin-options-vue.svg?style=flat-square) |
| @baklavajs/plugin-renderer-vue | ![npm (scoped)](https://img.shields.io/npm/v/@baklavajs/plugin-renderer-vue.svg?style=flat-square) |

## Introduction
BaklavaJS is a graph/node editor for the web. It provides an easy-to-use editor together with the ability to create custom nodes. Aditionally, it puts a strong emphasis on extensibility, which lead to an versatile plugin system.
To guarantee type safety, the entirety of the BaklavaJS ecosystem is written in TypeScript.

The core functionality is shipped in the `@baklavajs/core` package. Any other functionality can be added a-la-carte by installing the desired plugins:
* **Engine**: Provides functions to run calculations with the graph.
* **Interface Types**: Adds types to node interfaces and allowing connections only between types that you want to. It can also automatically convert values from one type to another.
* **Vue Renderer**: Displays the editor in the browser using VueJS
* **Vue Options**: Adds predefined node options in Baklava style

There is also the `baklavajs` package, which contains the core package as well as all plugins.

## Getting Started & Documentation
You can find the documentation here: https://newcat.github.io/baklavajs

## Sponsors

### Continuous Sponsors
<a href="https://github.com/finchMFG">finchMFG</a>&nbsp;&middot;
<a href="https://github.com/LittleMouseGames">LittleMouseGames</a>
