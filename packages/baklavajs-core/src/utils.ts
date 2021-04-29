/** Key type is limited due to https://github.com/microsoft/TypeScript/pull/37457 */
export function mapValues<I, O>(obj: Record<string, I>, fn: (value: I) => O): Record<string, O> {
    return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, fn(v)]));
}
