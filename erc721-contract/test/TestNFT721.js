const NFT721 = artifacts.require("NFT721Enumerable");

const zeroAddr = "0x0000000000000000000000000000000000000000";

contract("NFT721", (accounts) => {
  let inst;

  async function mint(accountIndex, n) {
    await inst.mint(accounts[accountIndex], "uri", n, {
      from: accounts[0],
    });
  }

  async function mintMulti(addresses, uris) {
    await inst.mintMulti(addresses, uris, {
      from: accounts[0],
    });
  }

  beforeEach(async () => {
    inst = await NFT721.new("name", "symbol");
  });

  it("metadata", async () => {
    await mint(0, 1);
    let tokenId = await inst.tokenOfOwnerByIndex(accounts[0], 0);
    let name = await inst.name();
    let symbol = await inst.symbol();
    let uri = await inst.tokenURI(tokenId);
    assert(name === "name");
    assert(symbol === "symbol");
    assert(uri === "uri");
  });

  it("balanceOf", async () => {
    await mint(0, 5);
    await mint(1, 6);

    let nftCount0 = await inst.balanceOf(accounts[0]);
    let nftCount1 = await inst.balanceOf(accounts[1]);

    assert(nftCount0.toNumber() === 5);
    assert(nftCount1.toNumber() === 6);
  });

  it("totalSupply", async () => {
    await mint(0, 5);
    let count = await inst.totalSupply();
    assert(count.toNumber() === 5);

    await mint(1, 6);
    count = await inst.totalSupply();
    assert(count.toNumber() === 11);
  });

  it("ownerOf", async () => {
    await mint(0, 1);
    let tokenId = await inst.tokenOfOwnerByIndex(accounts[0], 0);

    let owner = await inst.ownerOf(tokenId);
    assert(owner === accounts[0]);
  });

  it("approve", async () => {
    await mint(0, 1);
    let owner = accounts[0];
    let approve = accounts[1];
    let tokenId = await inst.tokenOfOwnerByIndex(accounts[0], 0);

    // approve other account
    await inst.approve(approve, tokenId, { from: owner });
    let approveRes = await inst.getApproved(tokenId);
    assert(approveRes === approve);

    // approve zero account
    await inst.approve(zeroAddr, tokenId, { from: owner });
    approveRes = await inst.getApproved(tokenId);
    assert(approveRes === zeroAddr);

    // approve self, fail
    let fail = false;
    try {
      await inst.approve(owner, tokenId, { from: owner });
    } catch (e) {
      fail = true;
    }
    assert(fail === true);
  });

  it("setApprovalForAll", async () => {
    let owner = accounts[0];
    let approve = accounts[1];

    // no approval
    let isApproved = await inst.isApprovedForAll(owner, approve);
    assert(isApproved === false);

    // set approval
    await inst.setApprovalForAll(approve, true, { from: owner });
    isApproved = await inst.isApprovedForAll(owner, approve);
    assert(isApproved === true);

    // set no approval
    await inst.setApprovalForAll(approve, false, { from: owner });
    isApproved = await inst.isApprovedForAll(owner, approve);
    assert(isApproved === false);
  });

  it("transferFrom", async () => {
    await mint(0, 1);
    let tokenId = await inst.tokenOfOwnerByIndex(accounts[0], 0);

    await inst.transferFrom(accounts[0], accounts[1], tokenId, {
      from: accounts[0],
    });
    const newOwner = await inst.ownerOf(tokenId);
    assert(newOwner === accounts[1]);
  });

  it("transferFrom, 0 approve 1, 1 transfer to 2", async () => {
    await mint(0, 1);
    let tokenId = await inst.tokenOfOwnerByIndex(accounts[0], 0);
    await inst.approve(accounts[1], tokenId, { from: accounts[0] });

    await inst.transferFrom(accounts[0], accounts[2], tokenId, {
      from: accounts[1],
    });
    const newOwner = await inst.ownerOf(tokenId);
    assert(newOwner === accounts[2]);
  });

  it("transferFrom, 0 approve all 1, 1 transfer to 2", async () => {
    await mint(0, 1);
    let tokenId = await inst.tokenOfOwnerByIndex(accounts[0], 0);
    await inst.setApprovalForAll(accounts[1], true, { from: accounts[0] });

    await inst.transferFrom(accounts[0], accounts[2], tokenId, {
      from: accounts[1],
    });
    const newOwner = await inst.ownerOf(tokenId);
    assert(newOwner === accounts[2]);
    const newApprove = await inst.getApproved(tokenId);
    assert(newApprove === zeroAddr);
  });

  it("transferFrom, no permission", async () => {
    await mint(0, 1);
    let tokenId = await inst.tokenOfOwnerByIndex(accounts[0], 0);

    let fail = false;
    try {
      await inst.transferFrom(accounts[0], accounts[2], tokenId, {
        from: accounts[1],
      });
    } catch (e) {
      fail = true;
    }
    assert(fail === true);
  });

  it("safeTransferFrom", async () => {
    await mint(0, 1);
    let tokenId = await inst.tokenOfOwnerByIndex(accounts[0], 0);

    let inst2 = await NFT721.new("", "");
    await inst.safeTransferFrom(accounts[0], inst2.address, tokenId);
    const newOwner = await inst.ownerOf(tokenId);
    assert(newOwner === inst2.address);
  });

  it("multi mint", async () => {
    const targets = [accounts[4], accounts[4], accounts[5]];
    const uris = ["uri1", "uri2", "uri3"];
    await mintMulti(targets, uris);
    const balance0 = await inst.balanceOf(accounts[4]);
    const balance1 = await inst.balanceOf(accounts[5]);
    assert(balance0.toNumber() === 2);
    assert(balance1.toNumber() === 1);
    const tokenId1 = await inst.tokenOfOwnerByIndex(accounts[4], 0);
    const tokenId2 = await inst.tokenOfOwnerByIndex(accounts[5], 0);
    const uri1 = await inst.tokenURI(tokenId1);
    const uri3 = await inst.tokenURI(tokenId2);
    assert(uri1 === "uri1");
    assert(uri3 === "uri3");
  });
});
