import {
    Card,
    DataTable,
    Text,
    BlockStack
  } from '@shopify/polaris';
import React from 'react'
  
  function objectToArray(data) {
    const result = [];
    data.forEach(d => {
        if(d["packagings"]){
            const row = [];
  
            row.push(d["name"])
            row.push(d["packagings"].map((item, index) => (
                <React.Fragment key={index}>
                  {index !== 0 && <br />}
                  {item}
                </React.Fragment>
              )))
            
            result.push(row);
        }
    });
    
    return result;
  }
  
  export default function RecentOrderTable({data}) {
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
                    ]}
                    headings={[
                    <Text as="p" fontWeight="bold">Order</Text>,
                    <Text as="p" fontWeight="bold">Packagings</Text>,
                    ]}
                    rows={rows}
                />
            </Card>
        </BlockStack>
    );
  }