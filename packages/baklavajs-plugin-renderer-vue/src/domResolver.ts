import { NodeInterface } from "@baklavajs/core";

export default function getDomElements(ni: NodeInterface) {

    const nodeDOM = document.getElementById(ni.parent.id);
    const interfaceDOM = document.getElementById(ni.id);

    return {
        node: nodeDOM,
        interface: interfaceDOM
    };

}
