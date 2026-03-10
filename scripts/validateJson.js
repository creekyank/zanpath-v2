const fs = require('fs');
const path = require('path');

const filePath = process.argv[2];
if (!filePath) {
  console.error("No file path provided.");
  process.exit(1);
}

try {
  const absolutePath = path.resolve(filePath);
  const content = fs.readFileSync(absolutePath, 'utf-8');
  JSON.parse(content);
  console.log(`✅ JSON Valid: ${filePath}`);
} catch (e) {
  console.error(`❌ JSON Invalid (${filePath}): ${e.message}`);
  process.exit(1);
}