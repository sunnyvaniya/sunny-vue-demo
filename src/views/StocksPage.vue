<template>
  <MDBContainer fluid class="py-4">

    <MDBRow class="justify-content-center">

      <MDBCol lg="11" xl="10">


        <!-- Header Section -->
        <MDBCard class="mb-4 border-0 shadow-sm">
          <MDBCardBody class="py-3">
            <div class="d-flex justify-content-between align-items-center flex-wrap">
              <h2 class="mb-0 text-primary fw-bold">📊 Stocks List</h2>
              <div class="d-flex gap-2">
                <MDBBtn color="secondary" @click="logout" class="d-flex align-items-center">
                  <span class="me-2">🚪</span>
                  Logout
                </MDBBtn>
                <MDBBtn color="primary" @click="addStock" class="d-flex align-items-center">
                  <span class="me-2">➕</span>
                  Add Stock
                </MDBBtn>
              </div>
            </div>
          </MDBCardBody>

        </MDBCard>

        <!-- Search Section -->
        <MDBCard class="mb-4 border-0 shadow-sm">
          <MDBCardBody class="py-3">
            <MDBRow>
              <MDBCol md="6" lg="4">
                <MDBInput type="text" v-model="searchQuery" label="Search stocks..." class=" mb-0" />
              </MDBCol>
            </MDBRow>
          </MDBCardBody>
        </MDBCard>

        <!-- Table Section -->
        <MDBCard class="border-0 shadow">
          <MDBCardHeader class="bg-light py-3">
            <h5 class="mb-0 text-dark fw-semibold">
              <i class="fas fa-table me-2"></i>
              Stock Records
            </h5>
          </MDBCardHeader>
          <MDBCardBody class="p-0">
            <div class="table-responsive">
              <div ref="tableRef"></div>
            </div>
          </MDBCardBody>
        </MDBCard>

      </MDBCol>
    </MDBRow>
  </MDBContainer>
</template>

<script>
import { ref, onMounted, watch } from "vue";
import { useStore } from "vuex";
import { TabulatorFull as Tabulator } from "tabulator-tables";
import "tabulator-tables/dist/css/tabulator.min.css";
import {
  MDBContainer,
  MDBRow,
  MDBCol,
  MDBCard,
  MDBCardBody,
  MDBCardHeader,
  MDBBtn,
  MDBInput
} from "mdb-vue-ui-kit";
import { useRouter } from "vue-router";
import { debounce } from "lodash";

export default {
  components: {
    MDBContainer,
    MDBRow,
    MDBCol,
    MDBCard,
    MDBCardBody,
    MDBCardHeader,
    MDBInput,
    MDBBtn,
  },
  setup() {
    const store = useStore();
    const tableRef = ref(null);
    const table = ref(null);
    const searchQuery = ref("");
    const router = useRouter();

    // 🟢 Watch store stocks so table updates automatically
    watch(
      () => store.getters["stocks/allStocks"],
      (newStocks) => {
        if (table.value) {
          table.value.replaceData(newStocks);
        }
      },
      { immediate: true }
    );

    const fetchStocks = debounce(async (query) => {
      await store.dispatch("stocks/fetchStocks", query);
    }, 300); // 300ms debounce

    // Watch searchQuery with debounce
    watch(searchQuery, (newVal) => {
      fetchStocks(newVal);
    });


    const addStock = () => {
      router.push({ name: 'BulkCreate' });
    };

    onMounted(async () => {
      try {
        const stocks = await store.dispatch("stocks/fetchStocks", searchQuery.value);

        console.log("Fetched stocks:", stocks);
        // Init Tabulator with fetched data
        table.value = new Tabulator(tableRef.value, {
          layout: "fitColumns",
          pagination: "local",
          paginationSize: 5,
          data: stocks,
          columns: [
            { title: "ID", field: "id", width: 70 },
            { title: "Name", field: "item_name" },
            { title: "Item Code", field: "item_code" },
            { title: "Quantity", field: "quantity" },
            { title: "Location", field: "location" },
            { title: "Store Name", field: "store.name" },



            {
              title: "Status",
              field: "status",
              hozAlign: "center",
              formatter: (cell) => {
                const value = cell.getValue();
                if (value === "in_stock") {
                  return `<span class="badge bg-success">In Stock</span>`;
                }
                if (value === "out_of_stock") {
                  return `<span class="badge bg-info text-dark">Out Of Stock</span>`;
                }
                return `<span class="badge bg-secondary">Unknown</span>`;
              },
            },
            {
              title: "Actions",
              formatter: () => "<button class='delete-btn'>Delete</button>",
              width: 100,
              hozAlign: "center",
              cellClick: (e, cell) => {
                const id = cell.getRow().getData().id;
                if (confirm("Are you sure you want to delete this stock?")) {
                  store.dispatch("stocks/deleteStock", id).then(() => {
                    cell.getRow().delete();
                  });
                }
              },
            },
          ],
        });
      } catch (error) {
        console.error("Error fetching stocks", error);
      }
    });


    const logout = async () => {

      const logout = await store.dispatch("auth/logout");
      if (logout?.success == true) {
        router.push({ name: "Login" });
      }
    }

    return {
      tableRef,
      searchQuery,
      addStock,
      logout
    };
  },
};
</script>

<style>
/* Minimal Tabulator styling for delete button */
.delete-btn {
  background-color: #dc3545;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.delete-btn:hover {
  background-color: #c82333;
}

/* AG-Grid theme customization for MDB colors */
.tabulator {
  border: 1px solid #dee2e6 !important;
  border-radius: 8px !important;
  font-size: 0.875rem;
  background: white;
}

.tabulator-header {
  background-color: #f8f9fa !important;
  border-bottom: 2px solid #dee2e6 !important;
  font-weight: 600;
}

.tabulator-header .tabulator-col {
  border-right: 1px solid #dee2e6 !important;
  padding: 12px !important;
}

.tabulator-header .tabulator-col:last-child {
  border-right: none !important;
}

.tabulator-header .tabulator-col-title {
  color: #212529 !important;
  font-weight: 600 !important;
  font-size: 0.875rem;
}

.tabulator-row {
  border-bottom: 1px solid #dee2e6 !important;
}

.tabulator-row:hover {
  background-color: #f8f9fa !important;
}

.tabulator-row:nth-child(even) {
  background-color: #f8f9fa;
}

.tabulator-cell {
  border-right: 1px solid #dee2e6 !important;
  padding: 12px !important;
  color: #212529;
}

.tabulator-cell:last-child {
  border-right: none !important;
}

.tabulator-footer {
  background-color: #f8f9fa !important;
  border-top: 1px solid #dee2e6 !important;
  padding: 12px !important;
}

.tabulator-paginator {
  color: #6c757d !important;
  font-size: 0.875rem;
}

.tabulator-page {
  background-color: white !important;
  color: #212529 !important;
  border: 1px solid #dee2e6 !important;
  border-radius: 4px !important;
  margin: 0 2px !important;
  padding: 6px 10px !important;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.tabulator-page:hover {
  background-color: #e9ecef !important;
  border-color: #adb5bd !important;
}

.tabulator-page.active {
  background-color: #0d6efd !important;
  color: white !important;
  border-color: #0d6efd !important;
}

.tabulator-placeholder {
  color: #6c757d !important;
  font-style: italic;
  padding: 2rem !important;
  text-align: center;
}

.badge {
  font-size: 0.75rem;
  padding: 6px 10px;
  border-radius: 6px;
}
</style>
