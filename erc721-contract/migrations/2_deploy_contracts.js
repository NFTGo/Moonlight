const NFT721 = artifacts.require("./NFT721Enumerable");
const Address = artifacts.require("utils/AddressUtils");
const SafeMath = artifacts.require("utils/SafeMath");
const Strings = artifacts.require("utils/Strings");

module.exports = function (deployer) {
  deployer.deploy(Address);
  deployer.deploy(SafeMath);
  deployer.deploy(Strings);
  deployer.link(Address, NFT721);
  deployer.link(SafeMath, NFT721);
  deployer.link(Strings, NFT721);
  deployer.deploy(NFT721, "NFT-GO Token", "NFTGO");
};
