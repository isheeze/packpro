const getAppId = async(graphql) => {
  let appId = await graphql(
    `
      query {
        currentAppInstallation {
          id
        }
      }
    `
  )
  return (await appId.json()).data.currentAppInstallation.id
}
const updateDataBase = async (allPackagings,graphql) => {
  let appId = await getAppId(graphql)

  const response = await graphql(
    `
      mutation CreateAppDataMetafield($metafieldsSetInput: [MetafieldsSetInput!]!) {
        metafieldsSet(metafields: $metafieldsSetInput) {
          metafields {
            id
            namespace
            key
          }
          userErrors {
            field
            message
          }
        }
      }
    `,
    {
      variables: {
        "metafieldsSetInput": [
          {
            "namespace": "packaging_inventory",
            "key": "packagings",
            "type": "json",
            "value": JSON.stringify(allPackagings),
            "ownerId": appId
          }
        ]
      },
    }
  )

  return await response.json()
}
const updateDashboardLogs = async (log,graphql) => {
  let appId = await getAppId(graphql)

  const response = await graphql(
    `
      mutation CreateAppDataMetafield($metafieldsSetInput: [MetafieldsSetInput!]!) {
        metafieldsSet(metafields: $metafieldsSetInput) {
          metafields {
            id
            namespace
            key
          }
          userErrors {
            field
            message
          }
        }
      }
    `,
    {
      variables: {
        "metafieldsSetInput": [
          {
            "namespace": "packaging_inventory",
            "key": "logs",
            "type": "json",
            "value": JSON.stringify([...JSON.parse(await getdashboardLogs(graphql)),{...log, createdAt:  new Date()}]),
            "ownerId": appId
          }
        ]
      },
    }
  )

  return await response.json()
}
function generateUniqueId() {
  const timestamp = performance.now();
  const randomPart = Math.floor(Math.random() * 10000);
  return `${timestamp}-${randomPart}`;
}

export const getPackaging = async (id, graphql) => {
  const res = JSON.parse(await getAllPackagings(graphql))[id]

  if(res){
    return res
  }else{
    return false
  }
}

export const getAllPackagings = async (graphql) => {
  let appId = await getAppId(graphql)

  let packagings = await graphql(
    `
      query {
        appInstallation(id: "${appId}") {
          app {
            id
          }
          metafield(namespace: "packaging_inventory",key: "packagings"){
            key
            value
          }
        }
      }
    `
  )

  packagings = (await packagings.json()).data.appInstallation.metafield

  return packagings == null ? '{}' : packagings.value
}
export const createPackaging = async (data, graphql) => {
  let id = generateUniqueId()
  let newPackaging = {...data, id, createdAt: new Date(), lastUpdated: new Date()}

  let allPackagings = JSON.parse(await getAllPackagings(graphql))
  allPackagings = {...allPackagings,[id]:newPackaging}

  await updateDataBase(allPackagings,graphql)

  if(Number(data.quantity) > 0){
    await updateDashboardLogs({
      packagingId:id,
      adjustedVal:Number(data.quantity),
      adjustedNote:"Created New Packaging"
    },graphql)
  }
  return id
}

export const updatePackaging = async(data, graphql) => {
  let newPackaging = await getPackaging(data.id, graphql)
  newPackaging = {...newPackaging,title:data.data.title,description:data.data.description,quantity:data.data.quantity, lastUpdated: new Date(), status:data.data.status}
  
  let allPackagings = JSON.parse(await getAllPackagings(graphql))
  allPackagings = {...allPackagings,[data.id]:newPackaging}

  await updateDataBase(allPackagings,graphql)

  if(data.data.adjustedVal != 0){
    await updateDashboardLogs({
      packagingId:data.id,
      adjustedVal:Number(data.data.adjustedVal),
      adjustedNote:data.data.adjustedNote
    },graphql)
  }
  return data.id
}

export const deletePackaging = async(id,graphql) => {
  let allPackagings = JSON.parse(await getAllPackagings(graphql))
  delete allPackagings[id]

  await updateDataBase(allPackagings,graphql)
}

export function validatePackaging(data) {
    const errors = {};
  
    if (!data.title) {
      errors.title = "Title is required";
    }
  
    if (!data.description) {
      errors.destination = "Description is required";
    }
  
    if (data.quantity < 0) {
      errors.quantity = "Quantity cannot be less than 0";
    }
  
    if (Object.keys(errors).length) {
      return errors;
    }
}
/*** orders ***/

function calculateSum(data) {
  const result = {};

  data.forEach(item => {
    const metafield = item.metafield;
    if (metafield && metafield.value) {
      const parsedValue = JSON.parse(metafield.value);
      for (const key in parsedValue) {
        const value = parseFloat(parsedValue[key]);
        result[key] = (result[key] || 0) + value;
      }
    }
  });

  return result;
}
export async function findMaxKeyAndValue (graphql) {
  const obj = await getOrderMetafieldsOfPast100Orders(graphql)

  let maxKey = null;
  let maxValue = -Infinity;

  for (const key in obj) {
    if (obj[key] > maxValue) {
      maxValue = obj[key];
      maxKey = key;
    }
  }

  return { key: (await getPackaging(maxKey, graphql)).title, value: maxValue };
}
export const minimumInventory = async(graphql) => {
  const obj = JSON.parse(await getAllPackagings(graphql))
  
  let minQuantityObject = null;
  let minQuantity = Infinity;

  for (const key in obj) {
    const quantity = parseInt(obj[key].quantity);
    if (quantity < minQuantity) {
      minQuantity = quantity;
      minQuantityObject = obj[key];
    }
  }

  return {
    title: minQuantityObject.title,
    quantity: minQuantity
  };
}
export const TotalPackagingsUsedInPast100Orders = async(graphql) => {
  const obj = await getOrderMetafieldsOfPast100Orders(graphql)

  let sum = 0;

  for (const key in obj) {
    if (typeof obj[key] === 'number') {
      sum += obj[key];
    } else if (typeof obj[key] === 'string' && !isNaN(parseFloat(obj[key]))) {
      sum += parseFloat(obj[key]);
    }
  }

  return sum;
}
export const getOrderMetafieldsOfPast100Orders = async(graphql, count=100) => {
  let orders = await graphql(
    `
      query Orders {
        orders(first: ${count}, sortKey:CREATED_AT, reverse:true) {
          nodes{
            metafield(namespace: "packaging_inventory", key:"packagings_used") {
              value
            }
          }
        }
      }
    `
  )
  const rawData = (await orders.json())?.data?.orders?.nodes
  return calculateSum(rawData) || {}
}
/**** Tables ****/
export const getdashboardLogs = async (graphql) => {
  let appId = await getAppId(graphql)

  let packagings = await graphql(
    `
      query {
        appInstallation(id: "${appId}") {
          app {
            id
          }
          metafield(namespace: "packaging_inventory",key: "logs"){
            key
            value
          }
        }
      }
    `
  )

  packagings = (await packagings.json()).data.appInstallation.metafield

  return packagings == null ? '[]' : packagings.value
}

export const getdashboardLogsTable = async (graphql) => {
  let res = JSON.parse(await getdashboardLogs(graphql))
  for(let r of res){
    if(r.packagingId){
      r.packaging = (await getPackaging(r.packagingId,graphql)).title
    }
  }
  const ary = res.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  if(ary.length > 100){
    let appId = await getAppId(graphql)
    const response = await graphql(
      `
        mutation CreateAppDataMetafield($metafieldsSetInput: [MetafieldsSetInput!]!) {
          metafieldsSet(metafields: $metafieldsSetInput) {
            metafields {
              id
              namespace
              key
            }
            userErrors {
              field
              message
            }
          }
        }
      `,
      {
        variables: {
          "metafieldsSetInput": [
            {
              "namespace": "packaging_inventory",
              "key": "logs",
              "type": "json",
              "value": JSON.stringify(ary.slice(0, 100)),
              "ownerId": appId
            }
          ]
        },
      }
    )
    return await response.json()
  }
  return ary.slice(0, 5)
}

export const getOrdersTable = async (graphql) => {
  let orders = await graphql(
    `
      query Orders {
        orders(first: 5, sortKey:CREATED_AT, reverse:true) {
          nodes{
            name
            metafield(namespace: "packaging_inventory", key:"packagings_used") {
              value
            }
          }
        }
      }
    `
  )
  const rawData = (await orders.json())?.data?.orders?.nodes

  for(let r of rawData){
    if(r.metafield){
      let obj = JSON.parse(r.metafield.value)

      r.packagings = []
      for(let key of Object.keys(obj)){
        r.packagings.push((await getPackaging(key,graphql)).title + ": " + obj[key])
      }
    }
  }
  
  return rawData
}
function sortByProperty(array, property) {
  return array.sort((a, b) => {
    if (Number(a[property]) < Number(b[property])) {
      return -1;
    }
    if (Number(a[property]) > Number(b[property])) {
      return 1;
    }
    return 0;
  });
}
export const getLowInventoryTable = async (graphql) => {
  let res = JSON.parse(await getAllPackagings(graphql))
  return sortByProperty(Object.values(res), "quantity").slice(0, 5)
}