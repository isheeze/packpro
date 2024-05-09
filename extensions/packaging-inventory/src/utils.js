const getAppId = async() => {
    let appId = await makeGraphQLQuery(
      `
        query {
          currentAppInstallation {
            id
          }
        }
      `
    )
    return await appId.data.currentAppInstallation.id
}
const removeObjectsWithFalseStatus = (obj) => {
    for (const key in obj) {
        if (Object.hasOwnProperty.call(obj, key)) {
            if (obj[key].status === 'false') {
                delete obj[key];
            }
        }
    }
}
const getAllPackagings = async() => {
    let appId = await getAppId()
    let allPackagings = JSON.parse((await makeGraphQLQuery(`query {
        appInstallation(id: "${appId}") {
            metafield(namespace: "packaging_inventory",key: "packagings"){
                key
                value
            }
        }
    }`)).data.appInstallation.metafield.value)
    return allPackagings
}
export const getActivePackagings = async() => {
    let appId = await getAppId()
    let allPackagings = JSON.parse((await makeGraphQLQuery(`query {
        appInstallation(id: "${appId}") {
            metafield(namespace: "packaging_inventory",key: "packagings"){
                key
                value
            }
        }
    }`)).data.appInstallation.metafield.value)

    removeObjectsWithFalseStatus(allPackagings)
    return allPackagings
}
export const updatePackagings = async(packagings) => {
    let appId = await getAppId()
    let allPackagings = await getAllPackagings()
    Object.keys(packagings).map(key => allPackagings = {...allPackagings,[key]:{...allPackagings[key],quantity:(Number(allPackagings[key].quantity)-Number(packagings[key].usedQuantity))}})

    let res = await makeGraphQLQuery(`
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
  `,{
      "metafieldsSetInput": [
        {
          "namespace": "packaging_inventory",
          "key": "packagings",
          "type": "json",
          "value": JSON.stringify(allPackagings),
          "ownerId": appId
        }
      ]
    })
}
export async function updateUsedPackagings(id, newQuantities) {
    return await makeGraphQLQuery(
      `mutation SetMetafield($namespace: String!, $ownerId: ID!, $key: String!, $type: String!, $value: String!) {
      metafieldDefinitionCreate(
        definition: {namespace: $namespace, key: $key, name: "Used Packagings", ownerType: ORDER, type: $type, access: {admin: MERCHANT_READ}}
      ) {
        createdDefinition {
          id
        }
      }
      metafieldsSet(metafields: [{ownerId:$ownerId, namespace:$namespace, key:$key, type:$type, value:$value}]) {
        userErrors {
          field
          message
          code
        }
      }
    }
    `,
      {
        ownerId: id,
        namespace: "packaging_inventory",
        key: "packagings_used",
        type: "json",
        value: JSON.stringify(newQuantities),
      }
    );
}
export async function getUsedQuantities(id){
  const res = (await makeGraphQLQuery(
    `
    query Order($id: ID!) {
      order(id: $id) {
        metafield(namespace: "packaging_inventory", key:"packagings_used") {
          value
          updatedAt
        }
      }
    }
    `,
    { id }
  ))?.data?.order?.metafield
  if(res){
    return JSON.parse(res.value)
  }else{
    return {}
  }
}
async function makeGraphQLQuery(query, variables) {
    const graphQLQuery = {
      query,
      variables,
    };
  
    const res = await fetch("shopify:admin/api/graphql.json", {
      method: "POST",
      body: JSON.stringify(graphQLQuery),
    });
  
    if (!res.ok) {
      console.error("Network error");
    }
  
    return await res.json();
}