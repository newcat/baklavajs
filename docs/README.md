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
BaklavaJS is divided into three different parts:
* Core
* View
* Engine

The **core** contains all the necessary logic for the node editor. However, tt does not calculate nodes nor can it display anything. For that, the **engine** and **view** are used.

## Getting Started

### Without Vue / NPM
Add these lines in your HTML file:
```html
<!-- in your <head> -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/baklavajs/dist/styles.css">

<!-- in your <body> -->
<script src="https://cdn.jsdelivr.net/npm/vue"></script>
<script src="https://cdn.jsdelivr.net/npm/baklavajs/dist/index.js"></script>
```

Now you can use the factory function `createBaklava`:
```html
<div style="width:90vw;height:90vh">
    <div id="editor"></div>
</div>

<script>
const view = BaklavaJS.createBaklava(document.getElementById("editor"));
const editor = plugin.editor;
</script>
```

The function will return a [ViewPlugin](!!API%{ "type": "class", "name": "viewplugin" }%) instance which in turn contains a reference to the [Editor](!!API%{ "type": "class", "name": "editor" }%) instance.

## With Vue / NPM

First, you need to install the library:
```bash
# npm
npm i baklavajs

# yarn
yarn add baklavajs
```

Now follow the steps described [here](/plugins/view.md)

> If you do not see the node editor, add a wrapper element with width and height properties around the editor.
> By default, the editor fills its parent completely. However, if the parent is the `<body>` element, this won't work.


