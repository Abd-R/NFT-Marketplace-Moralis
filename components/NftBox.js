import { useState, useEffect } from "react"
import { useWeb3Contract, useMoralis } from "react-moralis"
import nftMarketplaceAbi from "../constants/NftMarketplace.json"
import { Card, useNotification } from "web3uikit"
import nftAbi from "../constants/BasicNft.json"
import Image from "next/image"          // to render image, so our site wont be static site
import { ethers } from "ethers"
import UpdateListingModal from "./UpdateListingModal"

export default function NFTBox({ price, nftAddress, tokenId, marketplaceAddress, seller }) {

    const { isWeb3Enabled, account } = useMoralis()
    const [imageURI, setImageURI] = useState("")
    const [tokenName, settokenName] = useState("")
    const [tokenDescr, settokenDescr] = useState("")
    const [showModal, setShowModal] = useState(false)

    const dispatch = useNotification()

    const hideModal = () => setShowModal(false)
    const handleBuyItem = async (tx) => {
        await tx.wait(1)
        dispatch({
            type: "success",
            title: "Item bought",
            message: "You bought the NFT",
            position: "topR"
        })
    }
    
    const { runContractFunction: getTokenURI } = useWeb3Contract({
        abi: nftAbi,
        contractAddress: nftAddress,
        functionName: "tokenURI",
        params: {
            tokenId,
        },
    })

    const { runContractFunction: buyItem } = useWeb3Contract({
        abi: nftMarketplaceAbi,
        contractAddress: marketplaceAddress,
        functionName: "buyItem",
        msgValue: price,
        params: {
            nftAddress: nftAddress,
            tokenId: tokenId,
        },
    })


    async function updateUI() {
        const tokenURI = await getTokenURI()
        console.log(`TokenURI : ${tokenURI}`)

        if (tokenURI) {
            const requestURL = tokenURI.replace("ipfs://", "https://ipfs.io/ipfs/")
            console.log(`RequestURL : ${requestURL}`)
            const requestURIResponse = await (await fetch(requestURL)).json()
            const imageURI = requestURIResponse.image
            const imageURIURL = imageURI.replace("ipfs://", "https://ipfs.io/ipfs/")
            console.log(imageURIURL)
            setImageURI(imageURIURL)
            settokenName(requestURIResponse.name)
            settokenDescr(requestURIResponse.description)
        }
    }

    // web3 enabled hook
    useEffect(() => {
        if (isWeb3Enabled) {
            updateUI()
        }
    }, [isWeb3Enabled])

    // checking if active user is the owner
    const isOwnedbyYou = seller === account || seller === undefined
    const newSeller = isOwnedbyYou ? "you" : sliceString(seller)

    // Handle modal click
    function handleCardClick(){
        isOwnedbyYou 
            ? setShowModal(true) 
            : buyItem({
                onError: (err) => console.log(err),
                onSuccess: handleBuyItem

            })
    }  

    return (
        <div className="px-2">
            {
                imageURI
                    ?
                    <div>
                        <UpdateListingModal 
                            isVisible={showModal}
                            marketAddress={marketplaceAddress}
                            nftAddress={nftAddress}
                            tokenId={tokenId}
                            onCancel={hideModal}
                        />
                        <Card title={tokenName} description={tokenDescr} onClick={handleCardClick}>
                            <div className="p-2">
                                <div className="flex flex-col items-end gap-2">
                                    <div>#{tokenId}</div>
                                    <div className="italic text-sm"> Owned by {newSeller}</div>
                                    <Image
                                        loader={() => imageURI}
                                        src={imageURI}
                                        width="200" height={200}
                                    />
                                    <div className="font-bold"> {ethers.utils.formatUnits(price, "ether")} Eth</div>
                                </div>
                            </div>
                        </Card>
                    </div>
                    : "Loading Image ....."
            }
        </div>
    )
}

const sliceString = function (address) {
    const frontString = address.substring(0, 7);
    const endString = address.substring(38)
    return frontString + ".." + endString
}