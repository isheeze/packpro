import {
    Card,
    DataTable,
    Text,
    BlockStack
  } from '@shopify/polaris';
  
  function objectToArray(data) {
    const result = [];
    console.log(data)
    data.forEach(d => {
        const row = [];
  
        row.push(d["packaging"])
        row.push(d["adjustedVal"])
        row.push(d["adjustedNote"])
        
  
        result.push(row);
    });
    
    return result;
  }
  
  export default function DashboadLogsTable({data}) {
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
                Recent Quantity changes
            </Text>
            <Card>
                <DataTable
                    columnContentTypes={[
                    'text',
                    'text',
                    'text',
                    ]}
                    headings={[
                    <Text as="p" fontWeight="bold">Packaging</Text>,
                    <Text as="p" fontWeight="bold">Adjusted Quantity</Text>,
                    <Text as="p" fontWeight="bold">Note</Text>
                    ]}
                    rows={rows}
                />
            </Card>
        </BlockStack>
    );
  }