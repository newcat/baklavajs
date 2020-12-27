import Vue from "vue";

export default Vue.extend({
    props: [ "name", "node" ],
    render(h) {
        return h("button", {
            on: {
                click: () => { this.node.action(this.name); }
            }
        }, this.name as string);
    }
});
