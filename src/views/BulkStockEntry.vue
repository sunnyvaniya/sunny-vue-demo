<template>
    <MDBContainer fluid class="py-5">


        <MDBRow class="justify-content-center">
            <MDBCol lg="11" xl="10">
                <div class="text-center mb-5">
                    <h2 class="fw-bold text-primary mb-3">📦 Bulk Stock Entry</h2>
                    <p class="text-muted fs-5">Manage your inventory with ease</p>
                </div>

                <!-- Controls Section -->
                <MDBCard class="mb-4 border-0 shadow-sm">
                    <MDBCardBody class="py-3">
                        <div class="d-flex flex-wrap gap-3 align-items-center">
                            <MDBBtn color="info" @click="back" class="d-flex align-items-center">
                                Back
                            </MDBBtn>
                            <MDBBtn color="primary" @click="addNewRow" class="d-flex align-items-center">
                                <span class="me-2">➕</span>
                                Add New Record
                            </MDBBtn>
                            <MDBBtn color="success" @click="saveAll" class="d-flex align-items-center">
                                <span class="me-2">💾</span>
                                Save All
                            </MDBBtn>
                        </div>
                    </MDBCardBody>
                </MDBCard>

                <!-- Validation Messages -->
                <MDBAlert v-if="validationErrors.length > 0" color="danger" class="mb-4">
                    <h6 class="alert-heading mb-2">
                        <i class="fas fa-exclamation-triangle me-2"></i>
                        Validation Errors:
                    </h6>
                    <ul class="mb-0 ps-3">
                        <li v-for="error in validationErrors" :key="error" class="mb-1">{{ error }}</li>
                    </ul>
                </MDBAlert>

                <!-- Success Message -->
                <MDBAlert v-if="successMessage" color="success" class="mb-4">
                    <i class="fas fa-check-circle me-2"></i>
                    {{ successMessage }}
                </MDBAlert>

                <!-- Grid Section -->
                <MDBCard class="border-0 shadow">
                    <MDBCardHeader class="bg-light py-3">
                        <h5 class="mb-0 text-dark fw-semibold">
                            <i class="fas fa-table me-2"></i>
                            Stock Records
                        </h5>
                    </MDBCardHeader>
                    <MDBCardBody class="p-0">
                        <div class="table-responsive">
                            <ag-grid-vue class="ag-theme-alpine w-100" style="height: 500px;" :rowData="rowData"
                                :columnDefs="columnDefs" :defaultColDef="defaultColDef" :getRowId="getRowId"
                                :immutableData="true" rowSelection="multiple" @grid-ready="onGridReady"
                                @cell-value-changed="onCellValueChanged" />
                        </div>
                    </MDBCardBody>
                </MDBCard>

            </MDBCol>
        </MDBRow>
    </MDBContainer>
</template>

<script>
import { shallowRef, ref } from "vue";
import { AgGridVue } from "ag-grid-vue3";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { useStore } from "vuex";
import { onMounted } from "vue";
import {
    MDBContainer,
    MDBRow,
    MDBCol,
    MDBCard,
    MDBCardBody,
    MDBCardHeader,
    MDBBtn,
    MDBAlert
} from "mdb-vue-ui-kit";
import { useRouter } from "vue-router";

export default {
    components: {
        AgGridVue,
        MDBContainer,
        MDBRow,
        MDBCol,
        MDBCard,
        MDBCardBody,
        MDBCardHeader,
        MDBBtn,
        MDBAlert
    },
    setup() {
        const store = useStore();

        const router = useRouter();
        let gridApi = null;

        // Validation states
        const validationErrors = ref([]);
        const successMessage = ref('');
        const storeOptions = [
            { id: 1, name: 'Main Warehouse' },
            { id: 2, name: 'Outlet Store' },
            { id: 3, name: 'Remote Storage' }
        ];


        const rowData = shallowRef([]);

        const defaultColDef = {
            editable: true,
            sortable: true,
            filter: true,
            resizable: true,
            cellClassRules: {
                'invalid-cell': params => {
                    const field = params.colDef.field;
                    const value = params.value;

                    if (field === 'item_code' || field === 'item_name') {
                        return !value || value.trim() === '';
                    }
                    if (field === 'quantity') {
                        return !value || value <= 0;
                    }
                    if (field === 'storeName') {
                        return !value || value.trim() === '';
                    }
                    return false;
                }
            }
        };



        const columnDefs = [
            {
                headerName: "Stock No",
                field: "stockNo",
                editable: false,
                cellStyle: { backgroundColor: '#f8f9fa', fontWeight: 'bold', color: '#0d6efd' }
            },
            {
                headerName: "Item Code *",
                field: "item_code",
                tooltipField: 'item_code',
                headerTooltip: 'Item Code is required'
            },
            {
                headerName: "Item Name *",
                field: "item_name",
                tooltipField: 'item_name',
                headerTooltip: 'Item Name is required'
            },
            {
                headerName: "Quantity *",
                field: "quantity",
                cellEditor: 'agNumberCellEditor',
                cellEditorParams: {
                    min: 1,
                    precision: 0
                },
                valueParser: params => {
                    const val = parseInt(params.newValue, 10);
                    return isNaN(val) ? null : val;
                }
            },

            {
                headerName: "Location",
                field: "location",
                tooltipField: 'location'
            },
            {
                headerName: "Store Name *",
                field: "storeName",
                cellEditor: 'agSelectCellEditor',
                cellEditorParams: {
                    values: storeOptions.map(store => store.name)
                },
                tooltipField: 'storeName',
                headerTooltip: 'Please select a store'
            },
        ];

        const getRowId = (params) => String(params.data.id);

        const onGridReady = (params) => {
            gridApi = params.api;
            // do NOT call api.setRowData here
        };

        const onCellValueChanged = (params) => {
            // Clear messages when user starts editing
            clearMessages();

            // Auto-validate the changed cell
            validateCell(params);
        };

        const validateCell = (params) => {
            const field = params.colDef.field;
            const value = params.newValue;

            const cellKey = `${params.node.data.id}-${field}`;
            validationErrors.value = validationErrors.value.filter(error => !error.includes(cellKey));

            if (field === 'item_code' && (!value || value.trim() === '')) {
                validationErrors.value.push(`Row ${params.node.data.stockNo}: Item Code is required`);
            }
            if (field === 'item_name' && (!value || value.trim() === '')) {
                validationErrors.value.push(`Row ${params.node.data.stockNo}: Item Name is required`);
            }
            if (field === 'quantity' && (!value || value <= 0)) {
                validationErrors.value.push(`Row ${params.node.data.stockNo}: Quantity must be greater than 0`);
            }
            if (field === 'storeName' && (!value || value.trim() === '')) {
                validationErrors.value.push(`Row ${params.node.data.stockNo}: Store Name is required`);
            }

            if (gridApi) {
                gridApi.refreshCells({ rowNodes: [params.node] });
            }
        };

        const validateAll = () => {
            if (!gridApi) return;

            const errors = [];
            gridApi.forEachNode(node => {
                const data = node.data;
                const rowNum = data.stockNo;

                if (!data.item_code || data.item_code.trim() === '') {
                    errors.push(`Row ${rowNum}: Item Code is required`);
                }
                if (!data.item_name || data.item_name.trim() === '') {
                    errors.push(`Row ${rowNum}: Item Name is required`);
                }
                if (!data.quantity || data.quantity <= 0) {
                    errors.push(`Row ${rowNum}: Quantity must be greater than 0`);
                }
                if (!data.storeName || data.storeName.trim() === '') {
                    errors.push(`Row ${rowNum}: Store Name is required`);
                }
            });

            validationErrors.value = errors;

            if (errors.length === 0) {
                setTimeout(() => {
                    successMessage.value = '';
                }, 3000);
            }

            gridApi.refreshCells();
        };

        const clearMessages = () => {
            validationErrors.value = [];
            successMessage.value = '';
        };

        const addNewRow = () => {
            const nextId = rowData.value.length ? Math.max(...rowData.value.map(r => r.id)) + 1 : 1;
            const newRow = {
                id: nextId,
                stockNo: nextId,
                item_code: "",
                item_name: "",
                quantity: "",
                location: "",
                // storeName: storeOptions[0] // Default to first store
            };
            rowData.value = [...rowData.value, newRow];
            clearMessages();
        };

        onMounted(async () => {
            try {
                const storeData = await store.dispatch("stocks/fetchStores");

                console.log("Fetched stores:", storeData); // This should log the stores correctly

                // // Ensure the response is an array of stores
                // if (Array.isArray(storeData)) {
                //     console.log(storeData, "storeData")
                //     storeOptions.value = storeData?.map(store => ({
                //         id: store.id,
                //         name: store.name
                //     }));
                //     // console.log("Store options set to:", storeOptions);
                // } else {
                //     console.error("Invalid store data format:", storeData);
                // }
            } catch (error) {
                console.error("Error fetching stores:", error);
            }
        });

        const back = () => {
            router.push({ name: 'Stocks' });
            // Navigate back to StocksPage
        };

        const saveAll = async () => {
            if (!gridApi) return;

            // Validate before saving
            validateAll();

            if (validationErrors.value.length > 0) {
                return; // Don't save if there are validation errors
            }

            const toSave = [];
            gridApi.forEachNode(n => toSave.push(n.data));

            try {
                let saved = await store.dispatch("stocks/saveBulkStocks", toSave);

               
                rowData.value = saved; // immutable replace works with :immutableData="true"

                successMessage.value = `✅ Successfully saved ${saved.length} records`;
                setTimeout(() => {
                    successMessage.value = '';
                }, 5000);
            } catch (e) {
                console.error(e);
                validationErrors.value = ['❌ Failed to save records. Please try again.'];
            }
        };

        return {
            rowData,
            columnDefs,
            defaultColDef,
            getRowId,
            onGridReady,
            addNewRow,
            saveAll,
            validateAll,
            validationErrors,
            successMessage,
            onCellValueChanged,
            back
        };
    },
};
</script>

<style>
.invalid-cell {
    background-color: #f8d7da !important;
    border: 2px solid #dc3545 !important;
}

.ag-theme-alpine {
    --ag-header-background-color: #f8f9fa;
    --ag-odd-row-background-color: #f8f9fa;
    --ag-header-foreground-color: #212529;
    --ag-border-color: #dee2e6;
    --ag-row-hover-color: #e3f2fd;
    --ag-selected-row-background-color: #bbdefb;
}
</style>
