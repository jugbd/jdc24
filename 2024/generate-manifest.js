const fs = require('fs');
const path = require('path');

const directory = './'; // Root directory to scan
const manifestFile = 'manifest.json';
const allowedExtensions = ['.html', '.css', '.js', '.png', '.jpg', '.jpeg', '.svg', '.webp']; // File types to include

const scanDirectory = (dir) => {
    let files = [];
    fs.readdirSync(dir).forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            files = files.concat(scanDirectory(fullPath)); // Recursive call for subdirectories
        } else if (allowedExtensions.includes(path.extname(fullPath))) {
            files.push(fullPath.replace(/\\/g, '/')); // Normalize for web paths
        }
    });
    return files;
};

const generateManifest = () => {
    const files = scanDirectory(directory);
    const manifest = {
        assets: files
    };
    fs.writeFileSync(manifestFile, JSON.stringify(manifest, null, 2));
    console.log(`Manifest generated with ${files.length} assets: ${manifestFile}`);
};

generateManifest();
