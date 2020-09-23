let counter = 0;

export default function generateId(): string {
    return Date.now().toString() + (counter++).toString();
}
