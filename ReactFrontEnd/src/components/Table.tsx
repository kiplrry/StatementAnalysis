import { DataTable, DataTableFilterEvent, DataTableFilterMeta } from "primereact/datatable";
import { Column } from "primereact/column";
import { ChangeEventHandler, useEffect, useState } from "react";
import columns, {filters as colFilters} from "../columns";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { ColumnGroup } from "primereact/columngroup";
import { Row } from "primereact/row";



export const Table = ({dataset} : {dataset: Record<string, unknown>[]}) => {
  const data = dataset;
  const [filters, setFilters] = useState<DataTableFilterMeta>()
  const [selectedRows, setSelectedRows] = useState(null);
  const [globalFilterValue, setGlobalFilterValue] = useState('')  
  const [filteredData, setFilteredData] = useState(data)

  const onFilter = (e: DataTableFilterEvent)=> {
    setFilters(e.filters)
  }

function onValChange(_data){
  setFilteredData(_data)
}

useEffect(()=>{
  initFilters()
}, [])

const onGlobalFilterChange = (e: ChangeEventHandler<HTMLInputElement>) => {
  const value = e.target?.value;
  let _filters = { ...filters };

  _filters['global'].value = value;

  setFilters(_filters);
  setGlobalFilterValue(value);
};


const initFilters = ()=>{
  setFilters(colFilters)
  setGlobalFilterValue('')
}
const clearFilter = () => {
  initFilters();
};
const headerTemplate = (data) => {
  return (
      <div className="flex align-items-center gap-2">
          <span className="font-bold">{data.Type}</span>
      </div>
  );
};
const renderHeader = () => {
  return (
      <div className="flex gap-5 justify-between flex-wrap">
          <Button type="button" icon="pi pi-filter-slash" label="Clear" outlined onClick={clearFilter} />
          <div className="flex gap-2 items-center">
            <span className=" sm:text-md sm:invisible">Export Table</span>
            <Button type="button" icon="pi pi-file-pdf" className="bg-red-400" label="PDF" onClick={exportPdf} ></Button>
            <Button type="button" icon="pi pi-file-excel" className="bg-green-400" label="Excel" onClick={exportExcel} ></Button>
          </div>
          <IconField iconPosition="left" className="max-w-full">
              <InputIcon className="pi pi-search" />
              <InputText value={globalFilterValue}
              className="max-w-full"
              onChange={onGlobalFilterChange} placeholder="Keyword Search" />
          </IconField>
      </div>
  )
};
  const getTotal = (key: string)=>{
    let total = 0
    filteredData.map(d=>{
      if(d[key]) total += parseFloat(d[key])
    })
    return total.toFixed(2)
  }
  const exportColumns = columns.map((col) => ({ title: col.header, dataKey: col.field }));
  const exportPdf = () => {
    import('jspdf').then((jsPDF) => {
        import('jspdf-autotable').then(() => {
            const doc = new jsPDF.default(0, 0);

            doc.autoTable(exportColumns, filteredData);
            doc.save('statement.pdf');
        });
    });
};
const exportExcel = () => {
  import('xlsx').then((xlsx) => {
      const worksheet = xlsx.utils.json_to_sheet(filteredData);
      const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
      const excelBuffer = xlsx.write(workbook, {
          bookType: 'xlsx',
          type: 'array'
      });

      saveAsExcelFile(excelBuffer, 'statement');
  });
};
const saveAsExcelFile = (buffer, fileName: string) => {
  import('file-saver').then((module) => {
      if (module && module.default) {
          const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
          const EXCEL_EXTENSION = '.xlsx';
          const data = new Blob([buffer], {
              type: EXCEL_TYPE
          });

          module.default.saveAs(data, fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION);
      }
  });
};

  const footerGroup = (
    <ColumnGroup>
        <Row>
            <Column footer="Totals:" colSpan={7} footerStyle={{ textAlign: 'right' }} />
            <Column footer={()=>getTotal('Paid In')} header='Paid In' />
            <Column footer={getTotal('Withdrawn')} header='Withdrawn' columnKey="Withdrawn"/>
        </Row>
    </ColumnGroup>
);
  const header = renderHeader()
  return (
    <div className="card flex justify-center  mt-3">
        <DataTable
          onValueChange={onValChange}
          filters={filters}
          emptyMessage='No records matching your search'
          value={data}
          header={header}
          onFilter={onFilter}
          tableStyle={{ minWidth: "50rem" , width: "100%"}}
          removableSort
          scrollable
          scrollHeight="flex"
          showGridlines
          footerColumnGroup= {footerGroup}
          stripedRows
          onSelectionChange={(e) => setSelectedRows(e.value)}
          paginator
          className="max-w-full"
          selection={selectedRows}
          rows={10}
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          currentPageReportTemplate="{first} to {last} of {totalRecords} records"
          rowGroupHeaderTemplate={headerTemplate}
          rowsPerPageOptions={[5, 10, 25, 50]}
          >
          {/* <Column selectionMode="multiple" headerStyle={{ width: '3rem' }}></Column> */}
          {columns.map((column) => (
            <Column
              {...column}
              key={column.field} ></Column>
          ))}
        </DataTable>
    </div>
  );
};
