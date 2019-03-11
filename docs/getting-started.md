# Getting Started

## Without Vue / NPM
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
var editor = BaklavaJS.createBaklava(document.getElementById("editor"));
</script>
```

The function will return an [Editor](!!API%{ "type": "class", "name": "editor" }%) instance.
You can use now use all the regular methods described [here](editor).

## With Vue / NPM

First, you need to install the library:
```bash
# npm
npm i baklavajs

# yarn
yarn add baklavajs
```

Now you need to tell Vue to use this library. Add the following code in your application entry file (usually `index.js` or `main.js`):
```js
import BaklavaJS from "baklavajs";
import "baklavajs/dist/styles.css";
Vue.use(BaklavaJS);
```

The library is now installed and ready to use.
To actually use it, you need to create an `Editor` instance, which you can provide to the editor component.
This is a minimal wrapper component:
```vue
<template>
    <baklava-editor :model="editor"></baklava-editor>
</template>

<script>
import { Editor } from "baklavajs";

export default {
    data() {
        return {
            editor: new Editor()
        }
    }
}
</script>
```

> If you do not see the node editor, add a wrapper element with width and height properties around the editor.
> By default, the editor fills its parent completely. However, if the parent is the `<body>` element, this won't work.

## Electron
If you want to use this library in Electron, you need to add BaklavaJS to the whitelisted externals.
To do that, add the following code to your `package.json`:
```json
{
    "electronWebpack": {
        "whiteListedModules": [ "baklavajs" ]
    }
}
```
