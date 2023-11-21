<script setup>
import ApiLink from "../components/ApiLink.vue";
</script>

# Customization

Baklava offers many levels of customization, from simple theming up to full-blown custom components.

## Theming

You can use a theme by installing the `@baklavajs/themes` package and importing the theme-specific CSS file.

For example:

```js
import "@baklavajs/themes/syrup-dark.css";
```

There are currently two themes available:

-   Classic (Baklava v1 theme): `classic.css`
-   Syrup Dark: `syrup-dark.css`

Baklava's themes make heavy use of CSS variables.
This means that you can easily change colors or other visual properties by overriding the values of the variables in your CSS.
Check out [this file](https://github.com/newcat/baklavajs/blob/master/packages/themes/src/classic/variables.scss) for a list of variables.

## CSS Classes

Baklava applies different CSS classes to the HTML elements to make customization via CSS as easy as possible.
You can override styles to customize most aspects of the look and feel.
Apart from the [standard CSS classes](#list-of-css-classes), Baklava also sets certain `data-` properties you can use for styling.

For example, to make all nodes of type `MyNodeType` have a blue background, you can use the following CSS:

```css
.baklava-node[data-node-type="MyNodeType"] {
    background-color: lightblue;
}
```

## Custom Components

If these options don't fulfill your needs for customization, you can provide custom components.
For this, the editor provides the following slots:

-   `background` [(default component)](https://github.com/newcat/baklavajs/blob/master/packages/renderer-vue/src/editor/Background.vue)
-   `toolbar` [(default component)](https://github.com/newcat/baklavajs/blob/master/packages/renderer-vue/src/toolbar/Toolbar.vue)
-   `palette` [(default component)](https://github.com/newcat/baklavajs/blob/master/packages/renderer-vue/src/nodepalette/NodePalette.vue)
-   `connection` [(default component)](https://github.com/newcat/baklavajs/blob/master/packages/renderer-vue/src/connection/ConnectionWrapper.vue)
    -   Props:
        -   `connection` (type: <code><ApiLink type="classes" module="@baklavajs/core" name="Connection">Connection</ApiLink></code>)
-   `temporaryConnection` [(default component)](https://github.com/newcat/baklavajs/blob/master/packages/renderer-vue/src/connection/TemporaryConnection.vue)
    -   Props:
        -   `temporaryConnection` (type: <code><ApiLink type="interfaces" module="@baklavajs/core" name="ITemporaryConnection">ITemporaryConnection</ApiLink> | null</code>)
-   `node` [(default component)](https://github.com/newcat/baklavajs/blob/master/packages/renderer-vue/src/node/Node.vue)
    -   Props:
        -   `node` (type: <code><ApiLink type="classes" module="@baklavajs/core" name="AbstractNode">AbstractNode</ApiLink></code>)
        -   `selected` (type: `boolean`)
        -   `select` (type: `() => void`) callback for node being selected
-   `sidebar` [(default component)](https://github.com/newcat/baklavajs/blob/master/packages/renderer-vue/src/sidebar/Sidebar.vue)
-   `minimap` [(default component)](https://github.com/newcat/baklavajs/blob/master/packages/renderer-vue/src/components/Minimap.vue)

There are other components that provide slots as well:

- Node
  - `nodeInterface` [(default component)](https://github.com/newcat/baklavajs/blob/master/packages/renderer-vue/src/node/NodeInterface.vue)
    - Props:
      - `type` (type: `"input"|"output"`)
      - `node` (type: <code><ApiLink type="classes" module="@baklavajs/core" name="AbstractNode">AbstractNode</ApiLink></code>)
      - `intf` (type: <code><ApiLink type="classes" module="@baklavajs/core" name="NodeInterface">NodeInterface</ApiLink></code>)
- NodeInterface
  - `portTooltip` [(default content)](https://github.com/newcat/baklavajs/blob/master/packages/renderer-vue/src/node/NodeInterface.vue#L11-L13)
    - Props:
      - `showTooltip` (type: `boolean`)

So, for example, if you want to use a custom component for a certain node type, you could do it like this:

```vue
<template>
    <Editor>
        <template #node="nodeProps">
            <MyNodeRenderer v-if="nodeProps.node.type === 'MyNodeType'" :key="nodeProps.node.id" v-bind="nodeProps" />
            <BaklavaNode v-else :key="nodeProps.node.id" v-bind="nodeProps" />
        </template>
    </Editor>
</template>

<script setup>
import { Editor, Components } from "@baklavajs/renderer-vue";
const BaklavaNode = Components.Node;

// example, replace with your component:
import MyNodeRenderer from "./MyNodeRenderer.vue";
</script>
```

## List of CSS Classes

Below you can find a list of CSS classes used in Baklava:

-   **Editor:**
    -   `baklava-editor`: Base class for the editor
-   **Nodes:**
    -   `baklava-node`: Base class for each node
    -   `--selected`: Applied when a node is selected
    -   `--dragging`: Applied when a node is being dragged
    -   `--two-column`: Applied if a node is a two-column node
    -   `--palette`: Applied to a node if it is used as an entry in the node palette
    -   `__title`: Title (top-bar) of a node
        -   `__title-label`: Actual title (label) of the node
        -   `__menu`: Contains the three dots (menu button) on the right side of each node
    -   `__content`: Container for the inputs and outputs of the node
        -   `__inputs`: Container for all inputs
        -   `__outputs`: Container for all outputs
-   **Node Interfaces:**
    -   `baklava-node-interface`: Base class for each node interface
    -   `--input`: Applied when the node interface is an input
    -   `--output`: Applied when the node interface is an output
    -   `--connected`: Applied when the node interface has a connection
    -   `__port`: The "dot" via which the node interface can be connected
    -   `__tooltip`: The tooltip that is shown when hovering over the node interface
-   **Connection:**
    -   `baklava-connection`: Base class for each connection
    -   `--temporary`: Applied when the connection is still being dragged (in the process of being created or changed)
    -   `--allowed`: Applied when the connection can be created (the default styles display the connection green in this case)
    -   `--forbidden`: Applied when the connection can not be created (the default styles display the connection red in this case) or when this connection would be destroyed when creating a different connection
-   **Sidebar:**
    -   `baklava-sidebar`: Base class for the sidebar
    -   `--open`: Applied when the sidebar should be visible
    -   `__resizer`: Handle for resizing the sidebar
    -   `__header`: Header of the sidebar.
        -   `__close`: Close button
        -   `__node-name`: The title of the currently selected node
    -   `__interface`: Each interface shown in the sidebar
-   **Toolbar:**
    -   `baklava-toolbar`: Base class for the toolbar
    -   `baklava-toolbar-entry`: Base class for each entry in the toolbar
    -   `baklava-toolbar-button`: This class is applied to every entry that is clickable
-   **Others:**
    -   `baklava-node-palette`: Base class for the node palette
