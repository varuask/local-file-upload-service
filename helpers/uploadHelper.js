const fs = require('fs');
const path = require('path');
const util = require('util');
const mkdir = util.promisify(fs.mkdir);
const writeFile = util.promisify(fs.writeFile);

exports.uploadHelper = async (file, userId) => {
  try {
    const uploadDir = path.join(__dirname, '..', 'uploads', String(userId));
    await mkdir(uploadDir, { recursive: true });
    const timestamp = Date.now();
    const originalName = file.originalname.replace(/\s+/g, '_');
    const fileName = `${timestamp}_${originalName}`;
    const filePath = path.join(uploadDir, fileName);
    const relativePath = path.relative(process.cwd(), filePath);
    const extension = path.extname(originalName).toLowerCase();
    await writeFile(filePath, file.buffer);
    return { fileName, filePath: relativePath, extension };
  } catch (err) {
    throw err;
  }
};
