const fs = require('fs');
const path = require('path');

function searchFiles(dir, pattern) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (file !== 'node_modules' || dir === '.') {
        searchFiles(fullPath, pattern);
      }
    } else if (file.endsWith('.js') || file.endsWith('.ts')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes(pattern)) {
        console.log(`Found in: ${fullPath}`);
      }
    }
  }
}

console.log('Searching for createToolCallingAgent...');
searchFiles('./node_modules/langchain', 'createToolCallingAgent');
console.log('Searching for AgentExecutor...');
searchFiles('./node_modules/langchain', 'AgentExecutor');
