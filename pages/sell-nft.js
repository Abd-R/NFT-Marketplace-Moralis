import { Form } from "web3uikit"
import { ethers } from "ethers"
import nftMarketplaceAbi from "../constants/NftMarketplace.json"
import nftAbi from "../constants/BasicNft.json"
import { useNotification } from "web3uikit"
import { useMoralis, useWeb3Contract } from "react-moralis"
import networkMappings from "../constants/networkMappings.json"

export default function Home({ }) {

    const { chainId } = useMoralis()
    const chainIdString = chainId ? parseInt(chainId).toString() : "31337"
    const addressArray = networkMappings[chainIdString]["NftMarketplace"]
    const marketplaceAddress = addressArray[addressArray.length - 1]

    const dispatch = useNotification()
    const { runContractFunction } = useWeb3Contract()

    // data passed by the form
    const approveAndList = async (data) => {
        console.log("Approving.....")
        const nftAddress = data.data[0].inputResult
        console.log(nftAddress)
        const tokenId = data.data[1].inputResult

        const price = ethers.utils.parseUnits(data.data[2].inputResult, "ether").toString()

        console.log(price)

        const approveOptions = {
            abi: nftAbi,
            contractAddress: nftAddress,
            functionName: "approve",
            params: {
                to: marketplaceAddress,
                tokenId: tokenId,
            },
        }
        console.log("approving....")
        console.log(`Address: ${nftAddress}`)
        console.log(`TokenId: ${tokenId}`)
        console.log(`Price : ${price}`)

        await runContractFunction({
            params: approveOptions,
            onSuccess: () => handleApproveSuccess(nftAddress, tokenId, price),
            onError: err => console.log(`Approve Error: ${err}`)
        })
    }


    async function handleApproveSuccess(nftAddress, tokenId, price) {
        // await tx.wait(1)
        console.log("listing....")
        console.log(`Address: ${nftAddress}`)
        console.log(`TokenId: ${tokenId}`)
        console.log(`Price : ${price}`)
        
        const listOptions = {
            abi: nftMarketplaceAbi,
            contractAddress: marketplaceAddress,
            functionName: "listItem",
            params: {
                nftAddress: nftAddress,
                tokenId: tokenId,
                price: price
            }
        }

        await runContractFunction({
            params: listOptions,
            onSuccess: handleListSuccess,
            onError: err => console.log(`Listing Error: ${err}`),
        })
    }

    async function handleListSuccess(tx) {
        await tx.wait(1)
        dispatch({
            title: "NFT listed",
            message: "NFT is approved and listed successfully",
            position: "topR",
            type: "success"
        })

    }

    return (
        <div className="py-4 px-4">
            <Form
                onSubmit={approveAndList}
                data={[
                    {
                        name: "NFT Address",
                        type: "text",
                        inputWidth: "50%",
                        value: "",
                        key: "nftAddress"
                    },
                    {
                        name: "Token ID",
                        type: "number",
                        inputWidth: "50%",
                        value: "",
                        key: "tokenId"
                    },
                    {
                        name: "Price (in ETH)",
                        type: "number",
                        inputWidth: "50%",
                        value: "",
                        key: "price"
                    }
                ]}
            >

            </Form>
        </div>
    )
}