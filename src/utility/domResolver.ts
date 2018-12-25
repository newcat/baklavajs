import { INodeInterfacePair } from "@/model/connection";

export default function getDomElements(p: INodeInterfacePair) {

    const { node, interface: intf } = p;
    const nodeDOM = document.getElementById(node.id);
    const interfaceDOM = document.getElementById(intf.id);

    return {
        node: nodeDOM,
        interface: interfaceDOM
    };

}
