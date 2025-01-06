import { FilterMatchMode, FilterOperator } from "primereact/api";
import { Calendar } from "primereact/calendar";
import { ColumnProps } from "primereact/column";
import { DataTableRowData } from "primereact/datatable";
const dateFilterTemplate = (options) => {
  return <Calendar value={options.value} onChange={(e) => options.filterCallback(e.value, options.index)} dateFormat="dd/mm/yy" placeholder="dd/mm/yy" mask="99/99/9999" />;
};
const formatDate = (value) => {
  const newVal = new Date(value)
  return newVal.toLocaleDateString('en-ke', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false  // Set to true if you prefer 12-hour format
});
}

const dateBodyTemplate = (rowData) => {
    return formatDate(rowData['Completion Time']);
}

export const filters = {
      global: { value: null, matchMode: FilterMatchMode.CONTAINS },
      'Receipt No.': { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
      'Details': { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
      'Account': { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
      'Business': { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
      'Type': { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
      "Completion Time": { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }] },
      'Balance': { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
      'Paid In': { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
      'Withdrawn': { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
      }



const columns: ColumnProps[] = [
    {
      field: "Receipt No.",
      header: "Receipt No.",
      filterField: 'Receipt No.',
      sortable: true,
      filter: true,
      showApplyButton: true
    },
    {
      field: "Completion Time",
      header: "Completion Time",
      sortable: true,
      filterField: "Completion Time",
      dataType: "date",
      filter: true,
      filterElement: dateFilterTemplate,
      body: dateBodyTemplate,
    },
    {
      field: "Details",
      header: "Details",
      filterField: 'Details',
      filter: true,
      style: {
        // width: '50px'
      }
    },
    {
      field: "Transaction Status",
      header: "Transaction Status",
    },
    {
      field: "Account",
      header: "Account",
      filterField: 'Account',
      filter: true,
    },
    {
      field: "Type",
      header: "Type",
      filter: true,
      sortable: true
     
    },
    {
      field: "Business",
      header: "Business",
      filterField: 'Business',
      filter: true
    },
    {
      field: "Paid In",
      header: "Paid In",
      sortable: true,
      filter: true,
      filterField: 'Paid In',
      dataType: 'numeric'
      
    },
    {
      field: "Withdrawn",
      filterField: "Withdrawn",
      header: "Withdrawn",
      sortable:true,
      filter: true,
      dataType: 'numeric'
    },
    {
      field: "Balance",
      filterField: "Balance",
      header: "Balance",
      sortable: true,
      filter: true,
      dataType: 'numeric'
    },
  ];
  
export default columns