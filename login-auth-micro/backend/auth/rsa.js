import NodeRSA from "node-rsa"
import {writeFileSync} from 'fs'

const key = new NodeRSA({ b: 512 });
let keypair = {
    private: key.exportKey(),
    public: key.exportKey("public")
};
console.log(keypair)
writeFileSync('key', keypair.private)
writeFileSync('key.pub', keypair.public)
