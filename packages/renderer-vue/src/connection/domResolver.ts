import type { AbstractNode, NodeInterface } from "@baklavajs/core";

export interface IResolvedDomElements {
    node: HTMLElement | null;
    interface: HTMLElement | null;
    port: HTMLElement | null;
}

export function getDomElementOfNode(node: AbstractNode): HTMLElement | null {
    return document.getElementById(node.id);
}

export function getDomElements(ni: NodeInterface): IResolvedDomElements {
    const interfaceDOM = document.getElementById(ni.id);
    const portDOM = interfaceDOM?.getElementsByClassName("__port");

    return {
        node: interfaceDOM?.closest(".baklava-node") ?? null,
        interface: interfaceDOM,
        port: portDOM && portDOM.length > 0 ? (portDOM[0] as HTMLElement) : null,
    };
}
