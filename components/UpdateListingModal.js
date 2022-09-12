import { useState } from "react";
import { useWeb3Contract } from "react-moralis";
import { Modal, Input, useNotification } from "web3uikit";
import abi from "../constants/NftMarketplace.json"
import { ethers } from "ethers"

export default function UpdateListingModal({
    marketAddress,
    nftAddress,
    tokenId,
    isVisible,
    onCancel
}) {

    const dispatch = useNotification()
    const [updatedPrice, setUpdatedPrice] = useState()

    const updateListingSuccess = async (tx) => {      // tx is passed by our contract func
        await tx.wait(1)
        dispatch({
            type: "success",
            title: "listing updated",
            title: "Listing updated - please refresh",
            position: "topR"
        })
        console.log("Listing updated")

        onCancel && onCancel()
        setUpdatedPrice("0")
    }

    const { runContractFunction: updateListing } = useWeb3Contract({
        abi: abi,
        contractAddress: marketAddress,
        functionName: "updateListing",
        params: {
            nftAddress: nftAddress,
            tokenId: tokenId,
            newPrice: ethers.utils.parseEther(updatedPrice || "0")
        }
    })

    return (
        <Modal
            isVisible={isVisible}
            onCancel={onCancel}
            onCloseButtonPressed={onCancel}
            onOk={() => {
                updateListing({
                    onError: (error) => {
                        console.log(error)
                    },
                    onSuccess: updateListingSuccess
                })
            }}
        >
            <Input
                label="Update listing price in L1 currency (Eth)"
                name="New listing price"
                type="number"

                onChange={(event) => {
                    setUpdatedPrice(event.target.value)
                }}
            >
            </Input>
        </Modal>
    )
}