# Themes

You can use a theme by installing the `@baklavajs/themes` package and importing the theme-specific CSS file.

For example:

```js
import "@baklavajs/themes/syrup-dark.css";
```

There are currently two themes available:

-   Classic (Baklava v1 theme): `classic.css`
-   Syrup Dark: `syrup-dark.css`

## Customization

Baklava's themes make heavy use of CSS variables.
This means that you can easily change colors or other visual properties by overriding the values of the variables in your CSS.
Check out [this file](https://github.com/newcat/baklavajs/blob/dev-v2.0/packages/themes/src/classic/variables.scss) for a list of variables.
