// Importing specific modules from the "@aptos-labs/ts-sdk" package
import { Account, Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";

// Define the initial balance constant
const INITIAL_BALANCE = 100_000_000;

const APTOS_NETWORK: Network = Network.DEVNET;
const config = new AptosConfig({ network: APTOS_NETWORK });
const aptos = new Aptos(config);

const BitCraft = async () => {
  console.log(
    "This code sets up funds for both Solar and Nik. Solar creates a collection along with a digital asset within it, then transfers the asset to Nik.",
  );

  const Solar = Account.generate();
  const Nik = Account.generate();

  console.log("== Addresses ==\n");
  console.log(`Solar's address is: ${Solar.accountAddress}`);

  // Fund and create the accounts
  await aptos.faucet.fundAccount({
    accountAddress: Solar.accountAddress,
    amount: INITIAL_BALANCE,
  });
  await aptos.faucet.fundAccount({
    accountAddress: Nik.accountAddress,
    amount: INITIAL_BALANCE,
  });

  const collectionName = "BitCraft Collection";
  const collectionDescription = "Presenting a sample collection featuring BitCraft NFT's";
  const collectionURI = "aptos.dev";

  const createCollectionTransaction = await aptos.createCollectionTransaction({
    creator: Solar,
    description: collectionDescription,
    name: collectionName,
    uri: collectionURI,
  });

  console.log("\n== Create the collection ==\n");
  let committedTxn = await aptos.signAndSubmitTransaction({ signer: Solar, transaction: createCollectionTransaction });
  let pendingTxn = await aptos.waitForTransaction({ transactionHash: committedTxn.hash });

  const SolarsCollection = await aptos.getCollectionData({
    creatorAddress: Solar.accountAddress,
    collectionName,
    minimumLedgerVersion: BigInt(pendingTxn.version),
  });
  console.log(`Solar's collection: ${JSON.stringify(SolarsCollection, null, 4)}`);

  const tokenName = "Asset 1";
  const tokenDescription = "This is the first asset of the token collection";
  const tokenURI = "Bitcraft.ie/asset";

  console.log("\n== Solar Mints the digital asset ==\n");

  const mintTokenTransaction = await aptos.mintDigitalAssetTransaction({
    creator: Solar,
    collection: collectionName,
    description: tokenDescription,
    name: tokenName,
    uri: tokenURI,
  });

  committedTxn = await aptos.signAndSubmitTransaction({ signer: Solar, transaction: mintTokenTransaction });
  pendingTxn = await aptos.waitForTransaction({ transactionHash: committedTxn.hash });

  const SolarsDigitalAsset = await aptos.getOwnedDigitalAssets({
    ownerAddress: Solar.accountAddress,
    minimumLedgerVersion: BigInt(pendingTxn.version),
  });
  console.log(`Solar's digital assets balance: ${SolarsDigitalAsset.length}`);
  console.log(`Solar's digital asset: ${JSON.stringify(SolarsDigitalAsset[0], null, 4)}`);
  
  console.log("\n== Transfer the digital asset to Nik ==\n");
  const transferTransaction = await aptos.transferDigitalAssetTransaction({
    sender: Solar,
    digitalAssetAddress: SolarsDigitalAsset[0].token_data_id,
    recipient: Nik.accountAddress,
  });
  committedTxn = await aptos.signAndSubmitTransaction({ signer: Solar, transaction: transferTransaction });
  pendingTxn = await aptos.waitForTransaction({ transactionHash: committedTxn.hash });

  const SolarsDigitalAssetsAfter = await aptos.getOwnedDigitalAssets({
    ownerAddress: Solar.accountAddress,
    minimumLedgerVersion: BigInt(pendingTxn.version),
  });
  console.log(`Solars's digital assets balance: ${SolarsDigitalAssetsAfter.length}`);

  const NikDigitalAssetsAfter = await aptos.getOwnedDigitalAssets({
    ownerAddress: Nik.accountAddress,
    minimumLedgerVersion: BigInt(pendingTxn.version),
  });
  console.log(`Nik's digital assets balance: ${NikDigitalAssetsAfter.length}`);
};

BitCraft();