# Getting Started

## Installation

### Without Vue / NPM

You can directly use BaklavaJS without using Vue (it will still use Vue under the hood though). The bundled version contains the core module, as well as all available plugins.

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BaklavaJS Vanilla Example</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/baklavajs/dist/index.css">
</head>
<body>

    <div style="width:90vw;height:90vh">
        <div id="editor"></div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/vue@2.6.14/dist/vue.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/baklavajs/dist/index.js"></script>
    <script>
        const plugin = BaklavaJS.createBaklava(document.getElementById("editor"));
        const editor = plugin.editor;

        const myNode = new BaklavaJS.Core.NodeBuilder("My Node")
            .addInputInterface("My Interface")
            .build();
        editor.registerNodeType("My Node", myNode);
    </script>

</body>
</html>
```

The code examples in this documentation are not designed for this kind of installation. So you have to modify them slightly to work. Take this as an example:
```js
import { NodeBuilder } from "@baklavajs/core";
const myNode = new NodeBuilder("My Node");

import { OptionPlugin } from "@baklavajs/plugin-options-vue";
editor.use(new OptionPlugin())
```

needs to be transformed to:
```js
const myNode = new BaklavaJS.Core.NodeBuilder("My Node");
editor.use(new BaklavaJS.PluginOptionsVue.OptionPlugin());
```

So in general, `import { Foo } from "@baklavajs/plugin-bar"` will be `BaklavaJS.PluginBar.Foo`.

## With Vue / NPM

You have two options to install BaklavaJS:
* **Full Installation**: Installs the core module as well as every plugin currently available
* **Partial Installation**: Install only the plugins you need

```bash
## <<<<< NPM >>>>>
# full installation
npm i baklavajs

# partial installation
npm i @baklavajs/core
# ... add all packages you need, for example
npm i @baklavajs/plugin-engine


## <<<<< YARN >>>>>
# full installation
yarn add baklavajs

# partial installation
yarn add @baklavajs/core
# ... add all packages you need, for example
yarn add @baklavajs/plugin-engine
```

Continue at the documentation for the [view plugin](plugins/view) to see, how use the Baklava Editor in your Vue application.
