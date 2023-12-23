export function deepObjectToMap(obj: Record<string, any>): Map<string, any> {
    return new Map(
        Object.entries(obj).map(([k, v]) => {
            if (typeof v === "object") {
                return [k, deepObjectToMap(v)];
            } else {
                return [k, v];
            }
        }),
    );
}
