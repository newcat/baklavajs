/* eslint-disable @typescript-eslint/no-var-requires */
/*eslint-env node*/

const packageJson = require("./package.json");
const path = require("path");
const fs = require("fs");

const pkgNameRegex = /@baklavajs\/([a-z-]+)/;
function packageNameToFolder(pkgName) {
    return path.resolve(__dirname, "..", pkgName.replace(pkgNameRegex, "baklavajs-$1"));
}

for (let dep in packageJson.dependencies) {
    if (dep.startsWith("@baklavajs")) {
        const folder = packageNameToFolder(dep);
        const depPackageJson = require(path.resolve(folder, "package.json"));
        packageJson.dependencies[dep] = "^" + depPackageJson.version;
    }
}

fs.writeFileSync("package.json", JSON.stringify(packageJson, null, 4));