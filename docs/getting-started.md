# Getting Started

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
import "baklavajs/dist/styles/all.scss";
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
