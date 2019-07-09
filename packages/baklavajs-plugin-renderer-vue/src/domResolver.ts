import { INodeInterface } from "../../baklavajs-core/types";

export default function getDomElements(ni: INodeInterface) {

    const nodeDOM = document.getElementById(ni.parent.id);
    const interfaceDOM = document.getElementById(ni.id);

    return {
        node: nodeDOM,
        interface: interfaceDOM
    };

}
