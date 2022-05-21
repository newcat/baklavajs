/** A function that receives raw x and y values and returns the new x and y values, which the node should be snapped to */
export type SnappingProvider = (x: number, y: number) => { x: number; y: number };

export function createSimpleSnappingProvider(xGrid: number, yGrid: number): SnappingProvider {
    return (x, y) => ({
        x: Math.round(x / xGrid) * xGrid,
        y: Math.round(y / yGrid) * yGrid
    });
}
