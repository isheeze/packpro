import {
  Layout,
  Page
} from "@shopify/polaris";
import { useNavigate, useLoaderData } from "@remix-run/react";
import PackagingsTable from '../components/PackagingsTable'
import { getAllPackagings, getOrderMetafieldsOfPast100Orders } from "../utils";

import { authenticate } from "../shopify.server";
import { json } from "@remix-run/node";

export async function loader({ request, params }) {
  const { admin } = await authenticate.admin(request);
  return json({data: await getAllPackagings(admin.graphql), count: await getOrderMetafieldsOfPast100Orders(admin.graphql)});
}

export default function PackagingsPage() {

  const navigate = useNavigate();
  const packagings = useLoaderData()

  return (
    <Page>
      <ui-title-bar title="Packagings">
        <button variant="primary" onClick={() => navigate("/app/packaging/new")}>
          Create New Packaging
        </button>
      </ui-title-bar>
      <Layout>
        <Layout.Section>
          <PackagingsTable data={packagings.data} count={packagings.count} />
        </Layout.Section>
      </Layout>
    </Page>
  );
}
