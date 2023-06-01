import { AbstractNode } from "@baklavajs/core";

export function getNodePosition(node: AbstractNode): { x: number; y: number } {
    return node.position;
}

export function setNodePosition(node: AbstractNode, x: number, y: number) {
    node.position.x = x;
    node.position.y = y;
}
