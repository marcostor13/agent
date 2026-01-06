const fs = require('fs');
const path = require('path');
const dir = './public/images';
if (fs.existsSync(dir)) {
  const files = fs.readdirSync(dir);
  files.forEach((file, index) => {
    const oldPath = path.join(dir, file);
    const newPath = path.join(dir, `foto${index + 1}.jpg`);
    fs.renameSync(oldPath, newPath);
  });
  console.log('Renamed files successfully');
} else {
  console.log('Directory not found');
}
