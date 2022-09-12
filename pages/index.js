import Head from 'next/head'
import { useMoralisQuery, useMoralis } from "react-moralis"
import NftBox from '../components/NftBox'

export default function Home() {
  const {isWeb3Enabled} = useMoralis()          // hook
  // Rendering Information of Active Nfts
  const { data: listedNfts, isFetching: fetchingListedNfts } = useMoralisQuery(
    "ActiveItem",
    query => query.limit(10).descending("tokenId")
  )

  return (
    <div className='container mx-auto'>
      <h1 className='py-4  font-bold text-2xl'> Recently Listed</h1>
      <div className='flex flex-wrap'>
      {
        isWeb3Enabled 
        ?
          fetchingListedNfts ? `Loading` : listedNfts.map(nft => {
            const { price, nftAddress, marketplaceAddress, seller, tokenId } = nft.attributes
            // console.log(nft.attributes)
            return (
              <>
                {/* Price: {price}. Nft Address: {nftAddress}. TokenId: {tokenId} Seller: {
                  seller} Market: {marketplaceAddress} */}
                <NftBox
                  price={price}
                  nftAddress={nftAddress}
                  tokenId={tokenId}
                  marketplaceAddress={marketplaceAddress}
                  seller={seller}
                  key={`${nftAddress}${tokenId}`}
                />
              </>
            )
          })
        :
        `Web3 is disabled`
      }
      </div>
    </div>
  )
}
