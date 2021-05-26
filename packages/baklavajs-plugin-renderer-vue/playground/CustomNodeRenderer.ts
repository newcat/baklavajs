import { ComponentOptions, defineComponent, h } from "vue";
import { Components } from "../src";
import { AbstractNode } from "@baklavajs/core";
import CommentNode from "./CommentNodeRenderer.vue";

export default defineComponent({
    props: {
        node: {
            type: Object as () => AbstractNode,
            required: true,
        },
    },
    render() {
        const getComponent = (): ComponentOptions => {
            const node = this.node;
            return node.type === "CommentNode" ? CommentNode : (Components.Node as ComponentOptions);
        };

        return h(getComponent(), { ...this.$props, ...this.$attrs });
    },
});
