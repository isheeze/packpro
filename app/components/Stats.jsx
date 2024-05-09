import {
    Text,
    Card,
    Box,
    InlineGrid
  } from "@shopify/polaris";
  
  const Stats = ({
    maximumUsedPackaging,
    minimumInventoryPackaging,
    totalPackagings
  }) => {
    return (
        <InlineGrid gap="400" columns={3}>
            <Card style={{ minWidth: "500px"}}>
            <Text>
                Most Used
            </Text>
            <Box padding="400">
                <Text variant="heading2xl" as="h3" alignment="center">
                {maximumUsedPackaging.value}
                </Text>
                <Text alignment="center" fontWeight="bold">
                {maximumUsedPackaging.key}
                </Text>
            </Box>
            </Card>
            
            <Card>
            <Text>
                Minimum Inventory
            </Text>
            <Box padding="400">
                <Text variant="heading2xl" as="h3" alignment="center">
                {minimumInventoryPackaging.quantity}
                </Text>
                <Text alignment="center" fontWeight="bold">
                {minimumInventoryPackaging.title}
                </Text>
            </Box>
            </Card>
            
            <Card>
            <Text>
                Total Packagings
            </Text>
            <Box padding="400">
                <Text variant="heading2xl" as="h3" alignment="center">
                {totalPackagings}
                </Text>
                <Text alignment="center" fontWeight="bold">
                for last 100 orders
                </Text>
            </Box>
            </Card>
        </InlineGrid>
    )
}

export default Stats