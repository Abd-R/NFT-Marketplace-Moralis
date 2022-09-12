// we will run the the cloud functions conditional to events
/**
 * we need to  
 *  1. add items to marketplace when listed or updated
 *  2. remove from marketplace when bought
 */
// Moralis is injected into our script by server, no need to require
// every time something is saved on table
Moralis.Cloud.afterSave("ItemListed", async (request) => {
    // this event is triggered twice, 
    // 1. when Tx is fired, confirmed is false
    // 2. when Tx is confirmed(true), (we only need this, so we mine blocks in our utils script)
    // get confirmed column from table
    const confirmed = request.object.get("confirmed")
    const logger = Moralis.Cloud.getLogger()
    // logger.info(`Marketplace | Object: ${request.object}`)
    // logs on the Moralis Logs
    logger.info("Looking for confirmed Tx")

    if (confirmed) {

        logger.info("Tx Confirmed")

        const ActiveItem = Moralis.Object.extend("ActiveItem")
        // checking if already exists
        const query = new Moralis.Query(ActiveItem)
        query.equalTo("nftAddress", request.object.get("nftAddress"))
        query.equalTo("tokenId", request.object.get("tokenId"))
        query.equalTo("marketplaceAddress", request.object.get("address"))
        query.equalTo("seller", request.object.get("seller"))
        const alreadyListed = await query.first()
       
        if (alreadyListed) {
            logger.info("Already Listed!")
            await alreadyListed.destroy()

            logger.info(`Deleting tokenid: ${request.object.get("tokenId")} at address 
            ${request.object.get("address")}
            as it was Updated`)
        }
        
        logger.info("Listing Item....")
        // creating a new table 
        // request comes from event address, that is our contract address, and it always contains this address column
        // creating a new entry in table
        const activeItem = new ActiveItem()
        // getting address column : our contract address
        activeItem.set("marketplaceAddress", request.object.get("address"))
        // getting tokenId, nft address, nft address, seller, price
        activeItem.set("nftAddress", request.object.get("nftAddress"))
        activeItem.set("price", request.object.get("price"))
        activeItem.set("tokenId", request.object.get("tokenId"))
        activeItem.set("seller", request.object.get("seller"))
        logger.info(
            `Adding Address: ${request.object.get("address")} TokenId: ${request.object.get(
                "tokenId"
            )}`
        )
        logger.info("Saving...")
        await activeItem.save()
    }
})

Moralis.Cloud.afterSave("ItemCancelled", async function (request) {
    const confirmed = request.object.get("confirmed")
    const logger = Moralis.Cloud.getLogger()

    if (confirmed) {
        const ActiveItem = Moralis.Object.extend("ActiveItem")
        const query = new Moralis.Query(ActiveItem)
        // adding filters 
        query.equalTo("marketplaceAddress", request.object.get("address"))
        query.equalTo("tokenId", request.object.get("tokenId"))
        query.equalTo("nftAddress", request.object.get("nftAddress"))
        // find the first item that matches the description
        const activeItem = await query.first()
        if (activeItem) {
            logger.info(`Deleting tokenid: ${request.object.get("tokenId")} at address 
            ${request.object.get("address")}
            as it was cancelled`)
            await activeItem.destroy()
        } else {
            logger.info(`No item found with tokenId: ${request.object.get("tokenId")
                } at address ${request.object.get("nftAddress")}`)
        }
    }
})

Moralis.Cloud.afterSave("ItemBought", async function (request) {
    const confirmed = request.object.get("confirmed")
    const logger = Moralis.Cloud.getLogger()
    if (confirmed) {
        const ActiveItem = Moralis.Object.extend("ActiveItem")
        const query = new Moralis.Query(ActiveItem)
        // adding filters 
        query.equalTo("marketplaceAddress", request.object.get("address"))
        query.equalTo("tokenId", request.object.get("tokenId"))
        query.equalTo("nftAddress", request.object.get("nftAddress"))
        // find the first item that matches the description
        const activeItem = await query.first()
        if (activeItem) {
            logger.info(`Deleting tokenid: ${request.object.get("tokenId")} at address 
            ${request.object.get("address")}
            as it was bought`)
            await activeItem.destroy()
        } else {
            logger.info(`No item found with tokenId: ${request.object.get("tokenId")
                } at address ${request.object.get("nftAddress")}`)
        }
    }
})