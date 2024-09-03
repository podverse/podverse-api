const fs = require('fs').promises;
const path = require('path');

export async function saveObjectAsFileLocally(obj: object): Promise<void> {
  const filePath = path.join(__dirname, 'saveObjectAsFileLocally.json');
  await fs.writeFile(filePath, JSON.stringify(obj, null, 2), 'utf8');
}
