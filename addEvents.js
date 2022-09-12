const Moralis = require("moralis-v1/node");
const contractAddresses = require("./constants/networkMappings.json")
require("dotenv").config()
let chainId = process.env.CHAIN_ID || 31337
const contractAddressArray = contractAddresses[chainId]["NftMarketplace"]
const contractAddress = contractAddressArray[contractAddressArray.length - 1] // last address

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL
const APP_ID = process.env.NEXT_PUBLIC_APP_ID
const MASTER_KEY = process.env.moralisMasterKey

let moralisChainId = chainId == "31337" ? "1337" : chainId

async function main() {
    // connecteing server

    await Moralis.start({ 
        serverUrl: SERVER_URL,
        appId: APP_ID, 
        masterKey: MASTER_KEY
    });

    // configuring events

    let itemListedOptions = {
        // moralis knows local chain is 1337
        chainId: moralisChainId,
        address: contractAddress,
        sync_historical: true,      // all the historical events ever emitted will be indexed
        topic: "ItemListed(address,address,uint256,uint256)",
        abi: {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "seller",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "nftAddress",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "internalType": "uint256",
                    "name": "tokenId",
                    "type": "uint256"
                },
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "price",
                    "type": "uint256"
                }
            ],
            "name": "ItemListed",
            "type": "event"
        },
        tableName: "ItemListed"
    }

    let itemBoughtOptions = {
        // moralis knows local chain is 1337
        chainId: moralisChainId,
        address: contractAddress,
        sync_historical: true,      // all the historical events ever emitted will be indexed
        topic: "ItemBought(address,address,uint256,uint256)",
        abi: {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "buyer",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "nftAddress",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "internalType": "uint256",
                    "name": "tokenId",
                    "type": "uint256"
                },
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "price",
                    "type": "uint256"
                }
            ],
            "name": "ItemBought",
            "type": "event"
        },
        tableName: "ItemBought"
    }

    let itemCancelledOptions = {
        // moralis knows local chain is 1337
        chainId: moralisChainId,
        address: contractAddress,
        sync_historical: true,      // all the historical events ever emitted will be indexed
        topic: "ItemCancelled(address,address,uint256)",
        abi: {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "seller",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "nftAddress",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "internalType": "uint256",
                    "name": "tokenId",
                    "type": "uint256"
                }
            ],
            "name": "ItemCancelled",
            "type": "event"
        },
        tableName: "ItemCancelled"
    }

    const listedResponse = await Moralis.Cloud.run("watchContractEvent", itemListedOptions, {
        useMasterKey: true
    })
    const boughtResponse = await Moralis.Cloud.run("watchContractEvent", itemBoughtOptions, {
        useMasterKey: true
    })
    const cancelledResponse = await Moralis.Cloud.run("watchContractEvent", itemCancelledOptions, {
        useMasterKey: true
    })
    if (listedResponse.success && cancelledResponse.success && boughtResponse.success)
        console.log("Events Indexed")
    else
        console.log("Something went wrong")
}

main()
    .then(() => process.exit(0))
    .catch(ex => {
        console.log(ex)
        process.exit(0)
    })