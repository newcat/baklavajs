# Node Options

Node Options can be used to give users the ability to change more advanced settings of a node than node interfaces would allow. They can display arbitrary HTML in the form of Vue components.

Every option is just a Vue component, that supports the `v-model` directive.
This means, they receive the option's value through the `value` prop and can write updates
to the value using the `input` event.
Additionally, each option can emit the `openSidebar` event, which will open the [sidebar](#sidebar)
to display a more advanced UI for the option.
For more advanced use-cases, every option will also receive the node instance through the `node` prop.
This can be used to call functions in your node model.

Their value can be written or read programatically by using the
[setOptionValue](!!API%{ "type": "class", "name": "node", "field": "setoptionvalue" }%) and
[getOptionValue](!!API%{ "type": "class", "name": "node", "field": "getoptionvalue" }%) methods.

### Options in the ViewPlugin
When adding an option to a node, you only specify the type of the option as a string. This is done to separate logic and view.
The ViewPlugin then contains the [options](!!API%{ "type": "class", "name": "viewplugin", "field": "options" }%) field that maps these strings to actual view components.

To add your custom option to this mapping, use the [registerOption](!!API%{ "type": "class", "name": "viewplugin", "field": "registerOption" }%) method.

### Sidebar
Some options can require a more complex UI which would not fit in the limited space that a node provides.
In this case, you can display a button in the node that will open the sidebar when pressed.
The advanced UI can now be displayed in the sidebar. To open the sidebar, emit the `openSidebar` event in your option.

> The prebuilt ButtonOption will open the sidebar by default when clicked.
> Use this, if you just want a button in your node that opens the sidebar when clicked.
> (the ButtonOption is part of the [option plugin](/plugins/options.md))

```js
// in the node constructor
this.addOption("SidebarTest", "ButtonOption", () => ({ testtext: "any" }), "MySidebarOption");
```

Both the component in the node as well as the component in the sidebar
will receive the current option value through the `value` prop.

### Prebuilt Options
There are prebuilt options like text and number input, dropdown menu and many more available.
They can be used through the [option plugin](/plugins/options.md).

### Default Values
> When providing complex default values like arrays or objects as default values using the NodeBuilder's
> [addInputInterface](!!API%{ "type": "class", "name": "nodebuilder", "field": "addinputinterface"}%) method,
> you need to provide a function that returns the default array or object.
> This ensures that multiple instances of the node interface or node option
> all have their own data objects.

Example:
```js
new NodeBuilder("MyNode")
    // This is fine, because we provide a primitive as default value
    .addInputInterface("Primitive", "MyOption", "default")
    // But in this case we need to provide a function to create an object
    .addInputInterface("Complex", "MyOption", () => {
        return { a: 1, b: "Hello World!" };
    })
```