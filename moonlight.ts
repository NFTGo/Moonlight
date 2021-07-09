import Web3 from 'web3';
import { TransactionReceipt } from 'web3-core';
import { Contract } from 'web3-eth-contract';
import { ERC1155_ABI_INTERFACE, ERC721_ABI_INTERFACE } from './abi';
import { AIRDROP_TARGETS, ERC1155_CONTRACT, ERC721_CONTRACT, PRIVATE_KEY, URIS, WEB3_ENDPOINT } from './config';

enum Standard {
  ERC721 = 'erc721',
  ERC1155 = 'erc1155'
}

async function abort(web3: Web3) {
  return await web3.eth.sendTransaction({
    from: web3.defaultAccount as string,
    to: web3.defaultAccount as string,
    gasPrice: Number(await web3.eth.getGasPrice) * 1.12
  });
}

/**
 * Mint NFT from sky to everyone on the earth.
 */
class MoonLight721 {
  web3: Web3;
  contract: Contract;
  constructor(endpoint: string, contract: string, privateKey: string) {
    this.web3 = new Web3(endpoint);
    this.web3.eth.accounts.wallet.add(privateKey);
    this.web3.eth.defaultAccount = this.web3.eth.accounts.privateKeyToAccount(privateKey).address;
    this.contract = new this.web3.eth.Contract(ERC721_ABI_INTERFACE, contract);
  }

  async nonce(): Promise<number> {
    return await this.web3.eth.getTransactionCount(this.web3.defaultAccount as string, 'latest');
  };

  /**
   * Mint NFT(s) to an address
   * @param to Target address that receives the NFT
   * @param uri NFT Uri
   * @param amount Amount to mint
   */
  async mint(to: string, uri: string, amount: number): Promise<TransactionReceipt> {
    return await this.contract.methods.mint(to, uri, amount).send({
      nonce: await this.nonce(),
      from: this.web3.defaultAccount,
      gasPrice: await this.web3.eth.getGasPrice()
    });
  };

  /**
   * Mint multiple NFTs to a list of addresses
   * @param targets Target list of addresses
   * @param uris Uri list
   */
  async airdrop(targets: string[], uris: string[]): Promise<TransactionReceipt> {
    return await this.contract.methods.mintMulti(targets, uris).send({
      from: this.web3.defaultAccount,
    })
  };

  /**
   * Abort last transaction with nonce by a new tx with higher gas price.
   * @param nonce Last tx nonce
   */
  async abort(): Promise<TransactionReceipt> {
    return await this.web3.eth.sendTransaction({
      from: this.web3.defaultAccount as string,
      to: this.web3.defaultAccount as string,
      gasPrice: Number(await this.web3.eth.getGasPrice) * 1.12
    });
  };
}

// Mint erc1155-based NFT and airdrops
class MoonLight1155 {
  web3: Web3;
  contract: Contract;
  constructor(endpoint: string, contract: string, privateKey: string) {
    this.web3 = new Web3(endpoint);
    this.web3.eth.accounts.wallet.add(privateKey);
    this.web3.eth.defaultAccount = this.web3.eth.accounts.privateKeyToAccount(privateKey).address;
    this.contract = new this.web3.eth.Contract(ERC1155_ABI_INTERFACE, contract);
  }

  async nonce(): Promise<number> {
    return await this.web3.eth.getTransactionCount(this.web3.defaultAccount as string, 'latest');
  };

  async setCreator(to: string, ids: number[]): Promise<TransactionReceipt> {
    return await this.contract.methods.setCreator(to, ids).send({
      nonce: await this.nonce(),
      from: this.web3.defaultAccount,
      gasPrice: await this.web3.eth.getGasPrice()
    })
  }

  async mint(to: string, id: number, amount: number): Promise<TransactionReceipt> {
    return await this.contract.methods.mint(to, id, amount, "").send({
      nonce: await this.nonce(),
      from: this.web3.defaultAccount,
      gasPrice: await this.web3.eth.getGasPrice()
    })
  }

  async airdrop(targets: string[], id: number, amount: number): Promise<TransactionReceipt> {
    return await this.contract.methods.airdrop(targets, id, amount).send({
      nonce: await this.nonce(),
      from: this.web3.defaultAccount,
      gasPrice: await this.web3.eth.getGasPrice()
    })
  }

  async setURI(uri: string, id?: number): Promise<TransactionReceipt> {
    if (!id) {
      return await this.contract.methods.setURI(uri).send({
        nonce: await this.nonce(),
        from: this.web3.defaultAccount,
        gasPrice: await this.web3.eth.getGasPrice()
      })
    } else {
      return await this.contract.methods.setCustomURI(id, uri).send({
        nonce: await this.nonce(),
        from: this.web3.defaultAccount,
        gasPrice: await this.web3.eth.getGasPrice()
      })
    }
  }

  async abort(): Promise<TransactionReceipt> {
    return abort(this.web3);
  }

}

async function run() {
  const moonlight = new MoonLight1155(WEB3_ENDPOINT, ERC1155_CONTRACT, PRIVATE_KEY);

  // await moonlight.airdrop(AIRDROP_TARGETS, URIS);
}

run();