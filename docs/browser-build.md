# Browser Build

While not recommended, it is possible to use BaklavaJS standalone; without Vue and any build tools.

```html
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Document</title>

        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@baklavajs/themes@2.0.2-beta.3/dist/syrup-dark.css" />
        <style>
            html,
            body {
                margin: 0;
            }

            #editor {
                width: 100vw;
                height: 100vh;
            }
        </style>
    </head>
    <body>
        <div id="editor"></div>

        <script src="https://cdn.jsdelivr.net/npm/baklavajs@2.0.2-beta.3/dist/bundle.js"></script>
        <script>
            const viewModel = BaklavaJS.createBaklava(document.getElementById("editor"));
            const TestNode = BaklavaJS.Core.defineNode({
                type: "TestNode",
                inputs: {
                    a: () => new BaklavaJS.RendererVue.TextInputInterface("Hello", "world"),
                },
                outputs: {
                    b: () => new BaklavaJS.RendererVue.TextInputInterface("Hello", "world"),
                },
            });
            viewModel.editor.registerNodeType(TestNode);
        </script>
    </body>
</html>

```