const { readFileSync } = require("fs")

const loadPublicKeyWrap = () => {
  const key = readFileSync("key.pub", { encoding: "utf8", flag: "r" });
  console.log("load public key file");
  return function loadPublicKey() {
    // console.log('sending public key')
    return key;
  };
};
const getPublicKey = loadPublicKeyWrap();
module.exports.getPublicKey = getPublicKey
