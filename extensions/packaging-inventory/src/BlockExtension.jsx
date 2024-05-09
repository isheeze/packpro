import {
  reactExtension,
  useApi,
  AdminBlock,
  Box,
  Text,
  InlineStack,
  NumberField,
  Form,
  Badge,
  Divider,
  ProgressIndicator
} from '@shopify/ui-extensions-react/admin';
import { useEffect, useState, Fragment } from "react";
import { getActivePackagings, updatePackagings, updateUsedPackagings, getUsedQuantities } from './utils'

// The target used here must match the target used in the extension's toml file (./shopify.extension.toml)
const TARGET = 'admin.order-details.block.render';

export default reactExtension(TARGET, () => <App />);

function App() {
  const {i18n, data} = useApi(TARGET);
  const [loading, setLoading] = useState(true);
  const [packagings, setPackagings] = useState({});
  const [newQuantity, setNewQuantity] = useState({});
  const [prevQuantity, setPrevQuantity] = useState({});

  useEffect(() => {
    (async function getProductInfo() {
      // Load the product's metafield of type issues
      setPackagings(await getActivePackagings())
      let usedQuantity = await getUsedQuantities(data.selected[0].id)
      setPrevQuantity(prevQuant => ({ ...prevQuant, ...usedQuantity }))
      setNewQuantity(prevQuant => ({ ...prevQuant, ...usedQuantity }))

      setPackagings(prevState => {
        const newState = { ...prevState };
        for (const key in newState) {
          if (Object.hasOwnProperty.call(newState, key)) {
            newState[key].usedQuantity = 0;
          }
        }
        return newState;
      })
      setLoading(false);
    })();
  }, [])

  const onSubmit = async () => { await updatePackagings(packagings); await updateUsedPackagings(data.selected[0].id,newQuantity) }
  const onReset = async () => { }

  return loading ? (
    <InlineStack blockAlignment='center' inlineAlignment='center'>
      <ProgressIndicator size="large-100" />
    </InlineStack>
  ) : (
    <AdminBlock title="Packaging">
      <Form id={`issues-form`} onSubmit={onSubmit} onReset={onReset}>
        {Object.values(packagings).map(({id, title, description, quantity},index) => <Fragment key={id}>
          {index != 0 && <Divider />}
          <Box padding="base small">
            <InlineStack
              blockAlignment="center"
              inlineSize="100%"
              gap="large"
            >
              <Box inlineSize="53%">
                <Box inlineSize="100%">
                  <Text fontWeight="bold-300" textOverflow="ellipsis">{title}</Text>
                </Box>
                <Box inlineSize="100%">
                    <Text fontWeight="normal" textOverflow="ellipsis">{description}</Text>
                </Box>
              </Box>
              <Box inlineSize="22%">
                <NumberField
                  label="Used Quantity"
                  min={0}
                  max={Number(quantity)+Number(prevQuantity[id] || 0)}
                  value={Number(newQuantity[id] || 0)}
                  onChange={(newVal) => {
                    setNewQuantity(prev => ({...prev,[id]:newVal}))
                    setPackagings(prev => ({...prev,[id]:{...prev[id],usedQuantity:Number(newVal)-Number(prevQuantity[id] || 0)}}))
                  }}
                />
              </Box>
              <Box inlineSize="25%">
                <Box inlineSize="100%">
                  <Text fontWeight="bold" textOverflow="ellipsis">Inventory</Text>
                </Box>
                <Box inlineSize="100%">
                  {
                    Number(quantity || 0)+Number(prevQuantity[id] || 0)-Number(newQuantity[id] || 0) > 15 ?
                    <Badge tone="info">{Number(quantity || 0)+Number(prevQuantity[id] || 0)-Number(newQuantity[id] || 0)} remaining</Badge> :
                    <Badge tone="critical">{Number(quantity || 0)+Number(prevQuantity[id] || 0)-Number(newQuantity[id] || 0)} remaining</Badge>
                  }
                </Box>
              </Box>
            </InlineStack>
          </Box>
        </Fragment>
        )}
      </Form>
    </AdminBlock>
  );
}