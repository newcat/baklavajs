import { defineComponent, h } from "vue";
import { Components } from "../../baklavajs-plugin-renderer-vue/src";
import { Node } from "../../baklavajs-core/src";
import CommentNode from "./CommentNodeRenderer.vue";

export default defineComponent({
    functional: true,
    props: {
        node: {
            type: Object as () => Node,
            required: true,
        },
    },
    render() {

        const getComponent = () => {
            const node = this.$props.node;
            return node.type === "CommentNode" ? CommentNode : Components.Node;
        };

        return h(getComponent(), this.$props);

    }
});
