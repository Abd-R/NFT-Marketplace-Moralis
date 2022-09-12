import { Card } from "web3uikit"
import { ethers } from "ethers"
import { useMoralis, useWeb3Contract } from "react-moralis"
import { useState } from "react"
import { useNotification } from "web3uikit"
import networkMappings from "../constants/networkMappings.json"
import nftMarketplaceAbi from "../constants/NftMarketplace.json"

export default function Home({ }) {
    const { chainId, account } = useMoralis()
    const chainIdString = chainId ? parseInt(chainId).toString() : "31337"
    const addressArray = networkMappings[chainIdString]["NftMarketplace"]
    const marketplaceAddress = addressArray[addressArray.length - 1]
    const dispatch = useNotification()

    const { runContractFunction: getProceeds } = useWeb3Contract({
        abi: nftMarketplaceAbi,
        contractAddress: marketplaceAddress,
        functionName: "getProceeds",
        params: {
            seller: account
        }
    })
    const { runContractFunction: withdrawProceeds } = useWeb3Contract({
        abi: nftMarketplaceAbi,
        contractAddress: marketplaceAddress,
        functionName: "withdrawProceeds",

    })

    const [withdrawAmount, setWithdrawAmount] = useState("0")

    const showBalance = async () => {
        console.log("Withdraw Amount")
        const balance = ethers.utils.formatEther(await getProceeds())
        setWithdrawAmount(balance)
    }

    const handleWithdrawProceeds = async () => {
        console.log("Withdrawing...")
        console.log(parseInt(withdrawAmount))
        if (parseInt(withdrawAmount) === 0)
            return
        withdrawProceeds({
            onSuccess: handleWithdrawSuccess,
            onError: err => console.log(`Withdraw Error: ${err}`)
        })
        setWithdrawAmount("0")
    }

    const handleWithdrawSuccess = async (tx) => {
        await tx.wait(1)
        dispatch({
            title: "Funds Withdrawn",
            message: "Funds have been transfered to your wallet",
            type: "success",
            position: "topR"
        })
    }

    return (
        <div className="container mx-auto px-4 py-10">
            {
                withdrawAmount == "0"
                    ?
                    <Card onClick={showBalance}>
                        <div className="py-4 px-4 font-bold text-2xl">
                            {`Check withdraw amount`}
                        </div>
                    </Card>
                    :
                    <Card onClick={handleWithdrawProceeds}>
                        <div className="py-4 px-4 font-bold text-2xl">
                            {`Withdraw amount : ${withdrawAmount} Eth`}
                        </div>
                    </Card>
            }
        </div>
    )
}
