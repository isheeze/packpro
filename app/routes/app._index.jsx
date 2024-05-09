import {
  Page,
  Layout,
  BlockStack,
  InlineGrid
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";

import Stats from '../components/Stats'
import DashboardActivities from '../components/DashboardActivities'
import RecentOrders from '../components/RecentOrders'
import MinimumInventoryPackagings from '../components/MinimumInventoryPackagings'

import {
  findMaxKeyAndValue,
  minimumInventory,
  TotalPackagingsUsedInPast100Orders,
  getdashboardLogsTable,
  getOrdersTable,
  getLowInventoryTable
} from '../utils'
import { useLoaderData } from "@remix-run/react";

export const loader = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const maximumUsedPackaging = await findMaxKeyAndValue(admin.graphql)
  const minimumInventoryPackaging = await minimumInventory(admin.graphql)
  const totalPackagings = await TotalPackagingsUsedInPast100Orders(admin.graphql)

  const dashboardLogs = await getdashboardLogsTable(admin.graphql)
  const OrdersTable = await getOrdersTable(admin.graphql)
  const LowInventoryTable = await getLowInventoryTable(admin.graphql)
  return {
    maximumUsedPackaging,
    minimumInventoryPackaging,
    totalPackagings,

    dashboardLogs,
    OrdersTable,
    LowInventoryTable
  };
};

export default function Index() {
  const {
    maximumUsedPackaging,
    minimumInventoryPackaging,
    totalPackagings,

    dashboardLogs,
    OrdersTable,
    LowInventoryTable
  } = useLoaderData()
  return (
    <Page>
      <ui-title-bar title="Packaging Inventory" />
      <BlockStack gap="500">
        <Layout>
          <Layout.Section>
            <Stats
              maximumUsedPackaging={maximumUsedPackaging}
              minimumInventoryPackaging={minimumInventoryPackaging}
              totalPackagings={totalPackagings}
            />
          </Layout.Section>
          <Layout.Section>
            <InlineGrid gap="400" columns={2}>
              <DashboardActivities data={dashboardLogs} />
              <RecentOrders data={OrdersTable} />
            </InlineGrid>
          </Layout.Section>
          <Layout.Section>
            <MinimumInventoryPackagings data={LowInventoryTable} />
          </Layout.Section>
        </Layout>
      </BlockStack>
      
    </Page>
  );
}
