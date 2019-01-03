# Styling

## Default styles
The default styles can be loaded by simply importing them:
```js
import "baklavajs/dist/styles.css";
```

## Customizing
Most styles can be customized by changing variables.
The default values can be found at [variables.scss](../src/styles/variables.scss).
To override values, create a scss file with the following contents:
```scss
@import "baklavajs/dist/styles/variables.scss";

// change variables here

@import "baklavajs/dist/styles/styles.scss";
```

Now you can import the scss file in your main.js/index.js file.

## Customize interface colors
The color of node interface dots can be changed as well.
For that you need to overwrite the `$iftypes` variable.
To override variables, see the section above.

As an example, we want to make dots of type `string` blue and dots of type `number` yellow.
To do that, we need to set the `$iftypes` variable to following value:
```scss
$iftypes: (
    string: blue,
    number: yellow
);
```
You can also use hex codes or rgba() instead of color names.
