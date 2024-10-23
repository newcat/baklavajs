# BaklavaJS

![build-status](https://github.com/newcat/baklavajs/actions/workflows/build.yml/badge.svg)
![npm](https://img.shields.io/npm/v/baklavajs.svg)

Graph / node editor in the browser using VueJS

**[Online Demo](https://codesandbox.io/s/baklavajs-v2-example-zpfkec?file=/src/App.vue)**

![example](docs/example.png)

| Package                    | Version                                                                                        |
| -------------------------- | ---------------------------------------------------------------------------------------------- |
| baklavajs                  | ![npm](https://img.shields.io/npm/v/baklavajs.svg?style=flat-square)                           |
| @baklavajs/core            | ![npm (scoped)](https://img.shields.io/npm/v/@baklavajs/core.svg?style=flat-square)            |
| @baklavajs/engine          | ![npm (scoped)](https://img.shields.io/npm/v/@baklavajs/engine.svg?style=flat-square)          |
| @baklavajs/interface-types | ![npm (scoped)](https://img.shields.io/npm/v/@baklavajs/interface-types.svg?style=flat-square) |
| @baklavajs/renderer-vue    | ![npm (scoped)](https://img.shields.io/npm/v/@baklavajs/renderer-vue.svg?style=flat-square)    |
| @baklavajs/themes          | ![npm (scoped)](https://img.shields.io/npm/v/@baklavajs/themes.svg?style=flat-square)          |

## Introduction

BaklavaJS is a graph/node editor for the web. It provides an easy-to-use editor together with the ability to create custom nodes. Aditionally, it puts a strong emphasis on extensibility, which leads to a versatile plugin system.
To guarantee type safety, the entirety of the BaklavaJS ecosystem is written in TypeScript.

The core functionality is shipped in the `@baklavajs/core` package. Any other functionality can be added a-la-carte by installing the desired plugins:

-   **Engine**: Provides functions to run calculations with the graph.
-   **Interface Types**: Adds types to node interfaces and allowing connections only between types that you want to. It can also automatically convert values from one type to another.
-   **Vue Renderer**: Displays the editor in the browser using VueJS
-   **Themes**: A collection of pre-built themes for BaklavaJS

There is also the `baklavajs` package, which contains the core package as well as all plugins.

## Getting Started & Documentation

You can find the documentation here: https://baklava.tech

## BaklavaJS v1
The old version of BaklavaJS can be found here: https://github.com/newcat/baklavajs/tree/v1

## Sponsors

### Top Sponsors
<a href="https://github.com/ThePixelDeveloper">ThePixelDeveloper</a>&nbsp;&middot;
<a href="https://github.com/RDIL">Reece Dunham</a>&nbsp;&middot;
<a href="https://github.com/adrianrudnik">Adrian Rudnik</a>&nbsp;&middot;
<a href="https://github.com/yochrisbolton">Chris Bolton</a>&nbsp;&middot;
<a href="https://github.com/LittleMouseGames">LittleMouseGames</a>&nbsp;&middot;
<a href="https://github.com/andreibosco">Andrei Bosco B. Torres</a>&nbsp;&middot;
<a href="https://github.com/eviltik">eviltik</a>

### Gold Sponsors
<a href="https://github.com/TigerHix">Tiger Tang</a>

### Sponsors
<a href="https://github.com/notgull">John Nunley</a>
