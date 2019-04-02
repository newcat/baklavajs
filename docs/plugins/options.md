# Options Plugin

## Usage

### As Plugin
```js
import { Editor } from "@baklavajs/core";
import { OptionsPlugin } from "@baklavajs/plugin-options-vue";
const editor = new Editor();
editor.use(new OptionsPlugin());

// in the node constructor
this.addOption("MyOption", "InputOption");
```

### Import Single Options
```js
import { InputOption } from "@baklavajs/plugin-options-vue";
```

## List of Prebuilt Options
| Name | Description | Value Type |
| --- | --- | --- |
| `ButtonOption` | A button that opens the sidebar when clicked. The label of the button is determined by the name of the option. | `undefined` |
| `CheckboxOption` | A checkbox for setting boolean values. | `boolean` |
| `InputOption` | A simple text field. The option name will be displayed as placeholder. | `string` |
| `NumberOption` | A numeric up/down field for numeric values. | `number` |
| `SelectOption` | A dropdown select which allows the user to choose one of predefined values. | `{ selected: string, items: string[] }` |
| `TextOption` | Displays arbitrary strings | `string` |