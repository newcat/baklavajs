# Prebuilt Options

## Usage
All options are provided through the `Options` namespace:
```js
import { Options } from "baklavajs";

// in the node constructor
this.addOption("MyOption", Options.InputOption);
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