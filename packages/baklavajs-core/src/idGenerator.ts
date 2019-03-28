let counter = 0;

export default function generateId() {
    return (Date.now() + counter++).toString();
}
