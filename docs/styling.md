# Styling

## Default styles
The default styles can be loaded by simply importing them:
```js
import "baklavajs/dist/styles.css";
```

## Customizing
Most styles can be customized by changing variables.
The default values can be found at [variables.scss](../packages/baklavajs-plugin-renderer-vue/src/styles/variables.scss).
To override values, create a scss file with the following contents:
```scss
@import "baklavajs/dist/styles/variables.scss";

// change variables here

@import "baklavajs/dist/styles/styles.scss";
```

Now you can import the scss file in your main.js/index.js file.
