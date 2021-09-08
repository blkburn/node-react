const NodeRSA=require("node-rsa")
const {writeFileSync}=require('fs')

const key = new NodeRSA({ b: 512 });
let keypair = {
    private: key.exportKey(),
    public: key.exportKey("public")
};
console.log(keypair)
writeFileSync('key', keypair.private)
writeFileSync('key.pub', keypair.public)
