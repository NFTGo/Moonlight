import PinataSDK, { PinataClient, PinataPinResponse } from '@pinata/sdk';
import { PINATA_API_KEY, PINATA_SECRET_API_KEY } from './config';
import * as fs from 'fs';
import { MetaData } from './type';

class IPFS {
  pinata: PinataClient;
  constructor() {
    this.pinata = PinataSDK(PINATA_API_KEY, PINATA_SECRET_API_KEY);
  }

  async uploadFile(filepath: string): Promise<PinataPinResponse> {
    const data = fs.readFileSync(filepath);
    // should be larger than 2MB
    if (data.buffer.byteLength > 2 * 1024 * 1024) {
      throw new Error('Image size should be lower than 2MB')
    }
    const streamForFile = fs.createReadStream(filepath);
    const result = await this.pinata.pinFileToIPFS(streamForFile, {
      pinataOptions: {
        cidVersion: 1
      }
    })
    fs.unlinkSync(filepath);
    return result;
  }

  async uploadMetadata(metadata: MetaData): Promise<PinataPinResponse> {
    return this.pinata.pinJSONToIPFS({
      ...metadata,
    }, {
      pinataOptions: {
        cidVersion: 1
      }
    });
  }

}

async function run() {
  const ipfs = new IPFS();
  const filepath = '';
  const ipfsResp = await ipfs.uploadFile(filepath);
  const hash = `ipfs://${ipfsResp.IpfsHash}`;

  // metadata sample
  const metaData: MetaData = {
    name: '',
    description: '',
    image: hash
  }

  const resp = await ipfs.uploadMetadata(metaData);
  const uri = `ipfs://${resp.IpfsHash}`;

  console.log('Final URI:', uri);
}

run();