# BaklavaJS

[![Build Status](https://travis-ci.org/newcat/baklavajs.svg?branch=master)](https://travis-ci.org/newcat/baklavajs)

Graph / node editor in the browser using VueJS
![example](img/example.png)

| Package | Version |
| --- | --- |
| @baklavajs/core | ![npm (scoped)](https://img.shields.io/npm/v/@baklavajs/core.svg) |
| @baklavajs/plugin-engine | ![npm (scoped)](https://img.shields.io/npm/v/@baklavajs/plugin-engine.svg) |
| @baklavajs/plugin-interface-types | ![npm (scoped)](https://img.shields.io/npm/v/@baklavajs/plugin-interface-types.svg) |
| @baklavajs/plugin-options-vue | ![npm (scoped)](https://img.shields.io/npm/v/@baklavajs/plugin-options-vue.svg) |
| @baklavajs/plugin-renderer-vue | ![npm (scoped)](https://img.shields.io/npm/v/@baklavajs/plugin-renderer-vue.svg) |

## Introduction
BaklavaJS is a graph/node editor for the web. It provides an easy-to-use editor together with the ability to create custom nodes. Aditionally, it puts a strong emphasis on extensibility, which lead to an versatile plugin system.
To guarantee type safety, the entirety of the BaklavaJS ecosystem is written in TypeScript.

The core functionality is shipped in the `@baklavajs/core` package. Any other functionality can be added a-la-carte by installing the desired plugins:
* **Engine**: Provides functions to run calculations with the graph.
* **Interface Types**: Adds types to node interfaces and allowing connections only between types that you want to. It can also automatically convert values from one type to another.
* **Vue Renderer**: Displays the editor in the browser using VueJS
* **Vue Options**: Adds predefined node options in Baklava style

## Getting Started

### Without Vue / NPM
Add these lines in your HTML file:
```html
<!-- in your <head> -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/baklavajs/dist/styles.css">

<!-- in your <body> -->
<script src="https://cdn.jsdelivr.net/npm/vue"></script>
<script src="https://cdn.jsdelivr.net/npm/@baklavajs/core/dist/index.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@baklavajs/plugin-engine/dist/index.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@baklavajs/plugin-interface-types/dist/index.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@baklavajs/plugin-options-vue/dist/index.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@baklavajs/plugin-renderer-vue/dist/index.js"></script>
```

Now you can use the factory function `createBaklava`:
```html
<div style="width:90vw;height:90vh">
    <div id="editor"></div>
</div>

<script>
const plugin = BaklavaJSRendererVue.createBaklava(document.getElementById("editor"));
const editor = plugin.editor;
</script>
```

The function will return a [ViewPlugin](!!API%{ "type": "class", "name": "viewplugin" }%) instance which in turn contains a reference to the [Editor](!!API%{ "type": "class", "name": "editor" }%) instance.

## With Vue / NPM

First, you need to install the library:
```bash
# npm
npm i @baklavajs/core
# plugins
npm i @baklavajs/plugin-engine @baklavajs/plugin-interface-types @baklavajs/plugin-options-vue @baklavajs/plugin-renderer-vue

# yarn
yarn add @baklavajs/core
# plugins
yarn add @baklavajs/plugin-engine @baklavajs/plugin-interface-types @baklavajs/plugin-options-vue @baklavajs/plugin-renderer-vue
```

To display the editor in the browser follow the steps described [here](/plugins/view.md)
