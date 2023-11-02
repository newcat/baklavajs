import { defineComponent, h } from "vue";

export default defineComponent({
    name: "StaticLink",
    render() {
        return h("a", { domProps: this.$attrs }, this.$slots.default?.());
    },
});
