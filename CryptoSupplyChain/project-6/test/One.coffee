  One
  
  uint    itemSKU,0
  uint    itemUPC,1
  address ownerID,2
  address originFarmerID,3
  string  memory originFarmName, 4
  string  memory originFarmInformation,5
  string  memory originFarmLatitude,6
  string  memory originFarmLongitude,7



  throw


  uint    itemSKU, 0
  uint    itemUPC, 1
  uint    productID,2 
  string  memory productNotes, 3
  uint    productPrice, 4
  uint    itemState, 5
  address distributorID, 6
  address retailerID,7
  address consumerID, 8


      console.log("ganache-cli accounts used here...")
    console.log("Contract Owner: accounts[0] ", accounts[0])
    console.log("Farmer: accounts[1] ", accounts[1])
    console.log("Distributor: accounts[2] ", accounts[2])
    console.log("Retailer: accounts[3] ", accounts[3])
    console.log("Consumer: accounts[4] ", accounts[4])