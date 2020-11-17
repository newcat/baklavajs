# Styling

## Default styles
The default styles can be loaded by simply importing them (when using webpack or a similar bundler):
```js
import "@baklavajs/plugin-renderer-vue/dist/styles.css";
```

## Customizing Colors
Most colors can be customized by changing variables.
The default values can be found at [variables.scss](https://github.com/newcat/baklavajs/blob/master/packages/baklavajs-plugin-renderer-vue/src/styles/variables.scss).
To override values, create a scss file with the following contents:
```scss
@import "baklavajs/dist/styles/variables.scss";

// change variables here

@import "baklavajs/dist/styles/styles.scss";
```

Now you can import the scss file in your main.js/index.js file.

## Background
The grid background can be configured using the [`backgroundGrid`](!API%{ "module": "@baklavajs/plugin-renderer-vue", "type": "class", "name": "ViewPlugin", "field": "backgroundGrid"}%) property. You can configure these variables:
* `gridSize`: The size of the main grid cells in pixels (default: `100`)
* `gridDivision`: How many sub-cells the main grid should be divided into when zoomed above the `subGridVisibleThreshold` (default: `5`)
* `subGridVisibleThreshold`: When the zoom factor is larger than this threshold, the sub grid appears (default `0.6`)

## Customizing More Stuff
To do more customization, like basic layout changes or conditional colors, you can use CSS and the following classes:

### Nodes
* `.node`: Base class for nodes
* `.--type-{NodeType}`: Every node has this modifier with `NodeType` being the type specified in the class of the node (or in the parameter of the constructor of the `NodeBuilder`)
* `.--selected`: Applied whenever a node is selected

### Node Interfaces
* `.node-interface`: Base class for node interfaces
* `.--input` or `.--output`: These classes are also assigned to every node interface, depending on whether an interface is an input interface or an output interface
* `.__port`: Assigned to the "dot" of a node interface
* `.__port-{PortType}`: When the node interface has a type (through the `interface-types` plugin), this class is assigned. Note, however, that the color is set using the `style` property and can therefore not be changed through CSS but instead only through the `interface-types` plugin.

### Other Classes
* `.node-option`: Base class for node options
* `.connection`: Base class for connections

## Rendering Hooks
The `ViewPlugin` class provides hooks for rendering. The hooks provide the rendered Vue component as an argument, which you can use to make changes:

```js
this.viewPlugin.hooks.renderNode.tap(this, (node) => {
    if (node.data.type === "TestNode") {
        node.$el.style.backgroundColor = "red";
    }
    return node;
});
```

## Hardcore Customization
If these options don't fulfill your needs for customization, you can provide custom components to the `renderer-vue` plugin. This can be done for the following components:

* Node ([default component](https://github.com/newcat/baklavajs/blob/master/packages/baklavajs-plugin-renderer-vue/src/components/node/Node.vue))
* Node Option ([default component](https://github.com/newcat/baklavajs/blob/master/packages/baklavajs-plugin-renderer-vue/src/components/node/NodeOption.vue))
* Node Interface ([default component](https://github.com/newcat/baklavajs/blob/master/packages/baklavajs-plugin-renderer-vue/src/components/node/NodeInterface.vue))
* Connection ([default component](https://github.com/newcat/baklavajs/blob/master/packages/baklavajs-plugin-renderer-vue/src/components/connection/ConnectionWrapper.vue))
* Temporary Connection ([default component](https://github.com/newcat/baklavajs/blob/master/packages/baklavajs-plugin-renderer-vue/src/components/connection/TemporaryConnection.vue))
* Context Menu ([default component](https://github.com/newcat/baklavajs/blob/master/packages/baklavajs-plugin-renderer-vue/src/components/ContextMenu.vue))
* Sidebar ([default component](https://github.com/newcat/baklavajs/blob/master/packages/baklavajs-plugin-renderer-vue/src/components/Sidebar.vue))

To override the default components, change the respective property of the `ViewPlugin`s `components` property:
```js
import MyNodeComponent from "MyNodeComponent.vue";
viewPlugin.components.node = MyNodeComponent;
```

To see, what props the individual components receive, have a look at the default implementations of the components.