import { markRaw } from "vue";
import { NodeInterface } from "@baklavajs/core";
import TextInterfaceComponent from "./TextInterface.vue";

export class TextInterface extends NodeInterface<string> {
    component = markRaw(TextInterfaceComponent);

    public constructor(name: string, value: string) {
        super(name, value);
        this.setPort(false);
    }
}
