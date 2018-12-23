import { INodeInterfacePair } from "@/types/connection";

export default function getDomElements(p: INodeInterfacePair) {

    const { node, interface: intf } = p;
    const nodeDOM = document.getElementById(`node_${node.id}`);
    const interfaceDOM = document.getElementById(`ni_${intf.id}`);

    return {
        node: nodeDOM,
        interface: interfaceDOM
    };

}
