import {
    Card,
    DataTable,
    Text,
    BlockStack,
    Link,
    Badge
  } from '@shopify/polaris';
  
  function objectToArray(data) {
    const result = [];
    data.forEach(d => {
        const row = [];
  
        row.push(<Link url={`/app/packaging/${d["id"]}`}>{d["title"]}</Link>)
        row.push(d["description"])
        row.push(d["quantity"])
        row.push(d["status"] == 'true' ? <Badge tone="success">Active</Badge> : <Badge tone="critical">Disabled</Badge>)
        
  
        result.push(row);
    });
    
    return result;
  }
  
  export default function MinimumInventoryTable({data}) {
    const rows = objectToArray(data)
  
    return rows.length === 0 ? (
        <BlockStack gap="500">
            <Text variant="headingLg" fontWeight="regular">
                Recent Quantity changes
            </Text>
            <Card>
                <Text variant="headingLg" as="h5" tone='disabled' alignment='center'>No data to show</Text>
            </Card>
        </BlockStack>
      ) : (
        <BlockStack gap="500">
            <Text variant="headingLg" fontWeight="regular">
                Packagings with minimum inventory
            </Text>
            <Card>
                <DataTable
                    columnContentTypes={[
                    'text',
                    'text',
                    'text',
                    ]}
                    headings={[
                        <Text as="p" fontWeight="bold">Title</Text>,
                        <Text as="p" fontWeight="bold">Description</Text>,
                        <Text as="p" fontWeight="bold">Quantity</Text>,
                        <Text as="p" fontWeight="bold">Status</Text>
                    ]}
                    rows={rows}
                />
            </Card>
        </BlockStack>
    );
  }