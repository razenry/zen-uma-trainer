const fs = require('fs');
const path = require('path');

const avatarsDir = path.join(__dirname, '..', 'public', 'avatars');
if (!fs.existsSync(avatarsDir)) {
  fs.mkdirSync(avatarsDir, { recursive: true });
}

// 1x1 pixel transparent PNG base64
const pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
const buffer = Buffer.from(pngBase64, 'base64');

fs.writeFileSync(path.join(avatarsDir, 'default.png'), buffer);
fs.writeFileSync(path.join(avatarsDir, 'admin.png'), buffer);
fs.writeFileSync(path.join(avatarsDir, 'moderator.png'), buffer);
fs.writeFileSync(path.join(avatarsDir, 'dataentry.png'), buffer);

console.log('PNG avatars created successfully.');
