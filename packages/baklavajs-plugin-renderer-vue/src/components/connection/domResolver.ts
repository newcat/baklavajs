import { INodeInterface } from "../../../../baklavajs-core/types";

export interface IResolvedDomElements {
    node: HTMLElement|null;
    interface: HTMLElement|null;
    port: HTMLElement|null;
}

export default function getDomElements(ni: INodeInterface): IResolvedDomElements {

    const nodeDOM = document.getElementById(ni.parent.id);
    const interfaceDOM = document.getElementById(ni.id);
    const portDOM = interfaceDOM?.getElementsByClassName("__port");

    return {
        node: nodeDOM,
        interface: interfaceDOM,
        port: (portDOM && portDOM.length > 0) ? portDOM[0] as HTMLElement : null
    };

}
