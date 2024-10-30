import { Container, Title, Alert, Button, Group } from "@mantine/core";
import { AgGridReact } from "ag-grid-react";
import { observer } from "mobx-react-lite";
import { appStore } from "~/stores/AppStore";
import type { Claim } from "~/utils/schemas";
import { IconAlertCircle } from "@tabler/icons-react";
import type { ColDef } from 'ag-grid-community';
import { useState } from "react";

// Import AG Grid styles
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

const ApprovalPage = observer(() => {
  const [selectedClaims, setSelectedClaims] = useState<Claim[]>([]);

  const columnDefs: ColDef<Claim>[] = [
    {
      headerCheckboxSelection: true,
      checkboxSelection: true,
      width: 50,
      pinned: 'left'
    },
    { field: "Claim ID", sortable: true, filter: true },
    { field: "Service Date", sortable: true, filter: true },
    { field: "Provider Name", sortable: true, filter: true },
    { field: "Billed", sortable: true, filter: true },
    { field: "Allowed", sortable: true, filter: true },
    { field: "Paid", sortable: true, filter: true },
    { field: "Claim Status", sortable: true, filter: true }
  ];

  const handleApproveSelected = async () => {
    if (selectedClaims.length === 0) return;
    await appStore.approveSelectedClaims(selectedClaims);
    setSelectedClaims([]);
  };

  const handleRejectSelected = async () => {
    if (selectedClaims.length === 0) return;
    await appStore.rejectSelectedClaims(selectedClaims);
    setSelectedClaims([]);
  };

  const onSelectionChanged = (event: any) => {
    const selectedRows = event.api.getSelectedRows();
    setSelectedClaims(selectedRows);
  };

  if (appStore.pendingClaimsCount === 0) {
    return (
      <Container size="xl" py="xl">
        <Alert icon={<IconAlertCircle size={16} />} color="blue">
          No claims to review. Please upload a claims file first.
        </Alert>
      </Container>
    );
  }

  return (
    <Container size="xl" py="xl" className="h-full">
      <Title order={2} mb="lg">Claims Approval</Title>
      
      <Group mb="md">
        <Button
          color="green"
          onClick={handleApproveSelected}
          disabled={selectedClaims.length === 0}
        >
          Approve Selected ({selectedClaims.length})
        </Button>
        <Button
          color="red"
          onClick={handleRejectSelected}
          disabled={selectedClaims.length === 0}
        >
          Reject Selected ({selectedClaims.length})
        </Button>
      </Group>

      <div className="ag-theme-alpine w-full h-[600px]">
        <AgGridReact<Claim>
          rowData={appStore.claims}
          columnDefs={columnDefs}
          pagination={true}
          paginationPageSize={10}
          rowSelection="multiple"
          onSelectionChanged={onSelectionChanged}
          defaultColDef={{
            flex: 1,
            minWidth: 100,
            resizable: true
          }}
        />
      </div>
    </Container>
  );
});

export default ApprovalPage;