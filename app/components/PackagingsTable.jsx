import {
  EmptyState,
  Card,
  DataTable,
  Link,
  Badge,
  Text
} from '@shopify/polaris';
import { useNavigate } from "@remix-run/react";

function objectToArray(rawobj,count) {
  const obj = JSON.parse(rawobj)
  const keys = Object.keys(obj);
  const result = [];
  keys.forEach(key => {
    const row = [];

    row.push(<Link url={`/app/packaging/${obj[key]["id"]}`}>{obj[key]["title"]}</Link>)
    row.push(obj[key]["description"])
    row.push(obj[key]["quantity"])
    row.push(obj[key]["status"] == 'true' ? <Badge tone="success">Active</Badge> : <Badge tone="critical">Disabled</Badge>)
    
    row.push(Number(count[key] || 0))

    result.push(row);
  });
  
  return result;
}

export default function PackagingsTable({data,count}) {
  const navigate = useNavigate();

  const rows = objectToArray(data,count)

  return rows.length === 0 ? (
    <Card>
      <EmptyState
        heading="Create a new packaging to get started"
        action={{
          content: 'Create New Packaging',
          onAction: () => navigate("/app/packaging/new")
        }}
        image="https://cdn.shopify.com/s/files/1/2376/3301/products/emptystate-files.png"
      >
        <p>
          Explore all your packaging options here. Currently, your store does not have any packaging options.
        </p>
      </EmptyState>
    </Card>
  ) : (
    <Card>
      <DataTable
          columnContentTypes={[
            'text',
            'numeric',
            'numeric',
            'numeric',
            'numeric',
          ]}
          headings={[
            <Text as="p" fontWeight="bold">Title</Text>,
            <Text as="p" fontWeight="bold">Description</Text>,
            <Text as="p" fontWeight="bold">Quantity</Text>,
            <Text as="p" fontWeight="bold">Status</Text>,
            <Text as="p" fontWeight="bold">Used in last 100 orders</Text>
          ]}
          rows={rows}
        />
    </Card>
  );
}