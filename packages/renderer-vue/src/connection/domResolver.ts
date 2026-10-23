import type { AbstractNode, NodeInterface } from "@baklavajs/core";

export interface IResolvedDomElements {
    node: HTMLElement | null;
    interface: HTMLElement | null;
    port: HTMLElement | null;
}

let editorElement: HTMLElement | null = null;

/**
 * @internal
 * Called by the editor component so that elements can also be found when the editor is inside a Shadow DOM
 */
export function setEditorElement(el: HTMLElement) {
    editorElement = el;
}

/** Returns the root element of the editor */
export function getEditorElement(): HTMLElement | null {
    return editorElement ?? document.querySelector(".baklava-editor");
}

function getElementById(id: string): HTMLElement | null {
    // the root node is either the document or a shadow root, both of which support getElementById
    const root = editorElement?.getRootNode() as Document | ShadowRoot | undefined;
    return root?.getElementById?.(id) ?? document.getElementById(id);
}

export function getDomElementOfNode(node: AbstractNode): HTMLElement | null {
    return getElementById(node.id);
}

export function getDomElements(ni: NodeInterface): IResolvedDomElements {
    const interfaceDOM = getElementById(ni.id);
    const portDOM = interfaceDOM?.getElementsByClassName("__port");

    return {
        node: interfaceDOM?.closest(".baklava-node") ?? null,
        interface: interfaceDOM,
        port: portDOM && portDOM.length > 0 ? (portDOM[0] as HTMLElement) : null,
    };
}
