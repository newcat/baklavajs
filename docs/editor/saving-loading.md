<script setup>
import ApiLink from "../components/ApiLink.vue";
</script>

# Saving and Loading

## Saving

The editor provides a <code><ApiLink type="classes" module="@baklavajs/core" name="Editor" hash="save-1">save()</ApiLink></code> method.
This method can be used to save the current state into a plain JS object. This object can, for example, be JSONified and saved.

### Saving custom data

It is possible to add additional data to the save object. This can be done using the `afterSave` hook:
```ts
node.hooks.afterSave.subscribe(token, (state) => {
    state.myCustomValue = "hello world";
    return state;
});
```

If you want to do it for all nodes in all graphs, use the `nodeHooks` property of the editor instance:
```ts
editor.nodeHooks.afterSave.subscribe(token, (state, node) => {
    state.myCustomValue = "hello world";
    return state;
});
```

## Loading

Similar to saving, the editor also provides a <code><ApiLink type="classes" module="@baklavajs/core" name="Editor" hash="load-1">load(state)</ApiLink></code> method.
It receives the previously saved JS object as its only parameter.

The function returns an array of strings with every entry in the array being an error that occured during loading. If the array is empty, there were no errors.

### Loading custom data

To load your previously saved custom data, use the `beforeLoad` hook:
```ts
node.hooks.beforeLoad.subscribe(token, (state) => {
    console.log(state.myCustomValue);
});
```

If you want to do it for all nodes in all graphs, use the `nodeHooks` property of the editor instance as shown in the example for saving.
