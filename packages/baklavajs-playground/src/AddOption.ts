import { defineComponent, h } from "vue";

export default defineComponent({
    props: ["name", "node"],
    render() {
        return h(
            "button",
            {
                on: {
                    click: () => {
                        this.node.action(this.name);
                    }
                }
            },
            this.name as string
        );
    }
});
