import { FunctionalComponentOptions } from "vue";
import { Components } from "@baklavajs/plugin-renderer-vue/src";
import { Node } from "@baklavajs/core/src";
import CommentNode from "./CommentNodeRenderer.vue";

export default {
    functional: true,
    render(h, context) {
        const getComponent = () => {
            const node = context.props.data as Node;
            return node.type === "CommentNode" ? CommentNode : Components.Node;
        };

        return h(getComponent(), context.data);
    },
} as FunctionalComponentOptions;
