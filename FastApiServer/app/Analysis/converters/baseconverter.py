import os
import pandas
import pdfplumber
import pdfplumber.page
import pdfplumber.table 
from utils.helpers import generate_uuid
from utils.formatters import safe_atof, safe_to_bool, safe_to_datetime

## not implemented yet

class BaseCSVConverter:
    """Converter class that implements the M-PESA CSV converter."""

    def __init__(self, pdf_filepath: str, pages: list[int]= None, password: str = None) -> None:
        self.pdf_filepath = pdf_filepath
        self.tables: list[pandas.DataFrame] = []
        self.pdf = None
        self.password = password 
        self.pages = pages

    def process_pages(self):
        """ Process pages """
        pdf = self._openPDF(self.pdf_filepath, pages=self.pages, password=self.password)
        pages = pdf.pages
        if pages:
            for page in pages:
                tables = self.extract_tables(page)
                if tables:
                    self.tables.append(*tables)


    def extract_tables(self, page: pdfplumber.page.Page,  expected_headers: list[str] = None) -> list[pandas.DataFrame]:
        """Extracts tables from the PDF file matching the expected headers."""

        # if not isinstance(expected_headers, list) or not all(isinstance(item, str) for item in expected_headers):
        #     raise ValueError("Expected headers should be a list of strings.")

        matching_tables = []
        # pdf = self._openPDF()
        tables = page.extract_tables()
        for table in tables:
            # Convert table to DataFrame
            df = pandas.DataFrame(table[1:], columns=table[0])  # Header = First Row
            df = self.clean_and_transform_table(df)
            if expected_headers:
                if list(df.columns) == expected_headers:
                    matching_tables.append(df)
            else:
                    matching_tables.append(df)
        self.tables = matching_tables
        

    def transform_column(self, col: pandas.Series):
        """Apply a transformation pipeline to each column."""
        try:
            col = col.apply(safe_atof) 
        except ValueError:
            try:
                col = col.apply(safe_to_datetime)     # Try to convert to datetime
            except:
                pass

        # col = col.apply(safe_to_bool)         # Try to convert to boolean
        if col.nunique() < len(col) * 0.2:    # If many repeated values, make categorical
            col = pandas.Categorical(col)
        return col

    def clean_and_transform_table(self, table: pandas.DataFrame | pdfplumber.table.Table):
        """
        Create a DataFrame from the table and apply transformations
        Assumes first row is the index cols
        """
        if isinstance(table, pdfplumber.table.Table):
            df = pandas.DataFrame(table[1:], columns=table[0])
        else:
            df = table

        df = df.dropna(axis=1, how='all')  # Drop empty columns
        df = df.dropna(axis=0, how='all')  # Drop empty rows
        df = df.apply(self.transform_column, axis='columns')   # Transform each column
        return df


    def save_csv(self, outpath: str = "output", separated: bool =False):
        """Saves the extracted tables to a CSV file."""
        if not self.tables:
            raise ValueError('No tables to save.')
        if separated:
            for df in self.tables:
                uuid = generate_uuid(df.columns)
                fp = f'outpath_{uuid}.csv'
                exists = os.path.exists(fp)
                df.to_csv(fp, mode='a', index=False, header= not exists)
            print("CSV saved successfully!")
            return 0
            
        final_df = pandas.concat(self.tables, ignore_index=True)
        final_df.to_csv(f"{outpath}.csv", index=False)
        print("CSV saved successfully!")
        return 0

    def _openPDF(self, pdffilepath: str, pages: list[int]=None, password=None, **options):
        """ Opens the pdf and retuns the file instance """
        
        return pdfplumber.open(self.pdf_filepath, pages=pages, password=password, **options)
        

    def _tables(self):
        """return tables according to the headers gotten
        expensive op
        """
        
        