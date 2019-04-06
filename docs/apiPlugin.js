const regex = /!!API%([^%]+)%/g;
const apiPlugin = function(hook, vm) {
    hook.beforeEach(function(content) {
        let m;
        const toTransform = [];

        while ((m = regex.exec(content)) !== null) {
            // This is necessary to avoid infinite loops with zero-width matches
            if (m.index === regex.lastIndex) {
                regex.lastIndex++;
            }
            
            // The result can be accessed through the `m`-variable.
            const data = JSON.parse(m[1]);
            let url = `/baklavajs/api/${encodeURIComponent(data.module)}/`;
            if (data.type === "class") {
                url += `classes/${data.name}`;
                if (data.field) {
                    url += "#" + data.field;
                }
            }

            toTransform.unshift({ index: m.index, length: m[0].length, value: url });
            
        }

        toTransform.forEach((t) => {
            content = content.substring(0, t.index) + t.value + content.substring(t.index + t.length);
        });

        return content;

    });
}