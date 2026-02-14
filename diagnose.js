const os = require('os');
const path = require('path');
const fs = require('fs');

let output = '';
output += 'Platform: ' + process.platform + '\n';
output += 'Arch: ' + os.arch() + '\n';
output += 'Endianness: ' + os.endianness() + '\n';

try {
    const esbuildPath = require.resolve('esbuild');
    output += 'esbuild path: ' + esbuildPath + '\n';
} catch (e) {
    output += 'esbuild not found in main node_modules\n';
}

const remixEsbuildPkg = '/home/tyson/Desktop/Student Management/node_modules/@remix-run/dev/node_modules/esbuild/package.json';
if (fs.existsSync(remixEsbuildPkg)) {
    output += 'Remix esbuild package.json exists\n';
} else {
    output += 'Remix esbuild package.json NOT found\n';
}

fs.writeFileSync('diagnose.log', output);
console.log('Diagnosis written to diagnose.log');
