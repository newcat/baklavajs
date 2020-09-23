# Options Plugin

## Usage

### As Plugin
```js
import { Editor } from "@baklavajs/core";
import { OptionPlugin } from "@baklavajs/plugin-options-vue";
const editor = new Editor();
editor.use(new OptionPlugin());

// in the node constructor
this.addOption("MyOption", "InputOption");
```

### Import Single Options
```js
import { InputOption } from "@baklavajs/plugin-options-vue";
```

## List of Prebuilt Options

### `ButtonOption`
A button that opens the sidebar when clicked. The label of the button is determined by the name of the option.


### `CheckboxOption`
A checkbox for setting boolean values.

**Value Type**: `boolean`


### `InputOption`
A simple text field. The option name will be displayed as placeholder.

**Value Type**: `string`


### `IntegerOption`
A numeric up/down field for integer values.

**Value Type**: `number`

**Additional Properties**
* `min`: `number` (optional) The minimum value. If a user enters a value below the specified min value, the input is rejected.
* `max`: `number` (optional) The maximum value. If a user enters a value above the specified max value, the input is rejected.


### `NumberOption`
A numeric up/down field for numeric values.

**Value Type**: `number`

**Additional Properties**
* `min`: `number` (optional) The minimum value. If a user enters a value below the specified min value, the input is rejected.
* `max`: `number` (optional) The maximum value. If a user enters a value above the specified max value, the input is rejected.


### `SelectOption`
A dropdown select which allows the user to choose one of predefined values.

**Value Type**: `string`

**Additional Properties**
* `items`: `string[]|Array<{ text: string, value: any }>` (required) An array of items the user can choose from


### `SliderOption`
A slider for choosing a value in a range. The user can also click on the slider to set a specific value.

**Value Type**: `number`

**Additional Properties**
* `min`: `number` (required) The minimum value of the slider
* `max`: `number` (required) The maximum value of the slider


### `TextOption`
Displays arbitrary strings

**Value Type**: `string`


## Electron
If you want to use this plugin in Electron, you need to add it to the whitelisted externals.
To do that, add the following code to your `package.json`:
```json
{
    "electronWebpack": {
        "whiteListedModules": [ "@baklavajs/plugin-options-vue" ]
    }
}
```