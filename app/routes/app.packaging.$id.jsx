import {
    Card,
    Layout,
    Checkbox,
    Page,
    Text,
    BlockStack,
    PageActions,
    TextField
  } from "@shopify/polaris"
  import {
    useActionData,
    useLoaderData,
    useSubmit,
    useNavigation
  } from "@remix-run/react";
  import {DeleteIcon} from '@shopify/polaris-icons'
  
  import { authenticate } from "../shopify.server";

  import {useState} from 'react';
  import { json, redirect } from "@remix-run/node";
  import { getPackaging, validatePackaging, deletePackaging, createPackaging, updatePackaging } from '../utils'

  import QuantityPopover from "../components/QuantityPopover";

  export async function loader({ request, params }) {
    const { admin } = await authenticate.admin(request);
  
    if (params.id === "new") {
      return json({
        title: "",
        description: "",
        quantity: 0,
        status: true,
        adjustedVal:0,
        adjustedNote:""
      });
    }
  
    let data = {...(await getPackaging(params.id, admin.graphql)), adjustedVal:0, adjustedNote:""}
    return json({...data, status: data.status == 'true'});
  }

  export async function action ({ request, params }){
    const { admin } = await authenticate.admin(request)

    const data = {
      ...Object.fromEntries(await request.formData())
    }

    if (data.action === "delete") {
      await deletePackaging(params.id, admin.graphql)
      return redirect("/app/packagings");
    }

    const errors = validatePackaging(data);

    if (errors) {
      return json({ errors }, { status: 422 });
    }

    const newId = params.id === "new"
      ? await createPackaging(data, admin.graphql)
      : await updatePackaging({id:params.id, data}, admin.graphql);

    
    return redirect(`/app/packaging/${newId}`)
  }

  export default function SinglePackagingsPage() {
    const errors = useActionData()?.errors || {}

    const packaging = useLoaderData()
    const [formState, setFormState] = useState(packaging);

    const [cleanFormState, setCleanFormState] = useState(packaging);
    const isDirty = JSON.stringify(formState) !== JSON.stringify(cleanFormState);

    const nav = useNavigation();
    const isSaving =
      nav.state === "submitting" && nav.formData?.get("action") !== "delete";
    const isDeleting =
      nav.state === "submitting" && nav.formData?.get("action") === "delete";

    const submit = useSubmit();
    function handleSave() {
      const data = {
        title: formState.title,
        description: formState.description || "",
        quantity: Number(formState.quantity || 0),
        status: formState.status,
        adjustedVal: Number(formState.adjustedVal || 0),
        adjustedNote: formState.adjustedNote || "",
      };

      setFormState({ ...formState, adjustedVal:0, adjustedNote:""})
      setCleanFormState({ ...formState })
      submit(data, { method: "post" });
    }

    return (
      <Page
        backAction={{content: 'Packagings', url: '/app/packagings'}}
        title={packaging.createdAt ? `Edit Packaging` : `Create new Packaging`}
        primaryAction={{
          content: 'Save',
          disabled: !isDirty || isSaving || isDeleting,
          loading: isSaving,
          onAction: handleSave
        }}
      >
        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="300">
                <TextField
                    label="Packaging Type"
                    value={formState.title}
                    onChange={(newTitle) => setFormState({ ...formState, title:newTitle})}
                    autoComplete="off"
                    error={errors.title}
                />
                <TextField
                    label="Small Description"
                    value={formState.description}
                    onChange={(newVal) => setFormState({ ...formState, description:newVal})}
                    autoComplete="off"
                    helpText="A small note (i.e. use for small products)"
                    error={errors.description}
                />
                {packaging.createdAt ? 
                  <QuantityPopover formState={formState} setFormState={setFormState} />
                :
                  <TextField
                    label="Available Quantity"
                    type="number"
                    value={formState.quantity}
                    onChange={(newVal) => setFormState({ ...formState, quantity:newVal})}
                    autoComplete="off"
                    error={errors.quantity}
                  />
                }
              </BlockStack>
            </Card>
          </Layout.Section>
          <Layout.Section variant="oneThird">
            <Card>
              <BlockStack gap="200">
                <Text as="h2" variant="headingMd">
                  Status
                </Text>
                <Checkbox
                    label="Active"
                    checked={formState.status}
                    onChange={(newVal) => {setFormState({ ...formState, status:newVal});console.log(formState)}}
                />
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>
        
        <PageActions
            primaryAction={{
              content: 'Save',
              disabled: !isDirty || isSaving || isDeleting,
              loading: isSaving,
              onAction: handleSave
            }}
            secondaryActions={[{
              content: 'Delete',
              icon: DeleteIcon,
              disabled: !packaging || isDeleting || isSaving,
              loading: isDeleting,
              onAction: () => submit({ action: "delete"}, { method: "post" })
            }]}
        />
      </Page>
    );
  }