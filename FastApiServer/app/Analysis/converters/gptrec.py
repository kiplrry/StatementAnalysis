import PyPDF2.errors
import pandas 
import logging
import os
import tabula
from ..utils.helpers import generate_uuid
from ..utils.formatters import safe_atof, safe_to_datetime
from collections import defaultdict
from ..utils.categorize import categorize
import PyPDF2
import json

table_maps = {
    '26c8d482': 'summary',
    '7e53c43f': 'details',
    'bf518e45': 'data',
    '0e76eded': 'code'
}

class MpesaCSVConverter:
    def __init__(self, pdf_filepath: str, pages : int=None, password : str=None, templates: str|dict=None, table_mapping: dict = None):
        self.pdf_filepath = pdf_filepath
        self.password = password
        self.pages = pages
        self.tables : dict[str, pandas.DataFrame] = None
        self.dfs = None
        self.templates = templates
        self.table_map = table_maps

    def process_pages(self):
        dfs = self.extract_tables()
        if dfs:
            self.dfs = dfs
            self.tables = self.merge_tables(dfs)
            if 'details' in self.tables:
                df = self.tables['details']
                df.loc[-1] = df.columns  # Add header as the first row
                df.index = df.index + 1  # Shift index
                df = df.sort_index()     # Sort index to keep the header row at the top
                # Reset the column headers to generic or index-based names
                df.columns = ['detail', 'value']
                self.tables['details'] = df
        
    def extract_tables(self) -> list[pandas.DataFrame]:
        if self.templates:
            dfs = []
            if isinstance(self.templates, dict):
                for page, template in self.templates.items():
                    refined = self._refine_page_opts(page)
                    if isinstance(template, dict):
                        tabs = tabula.read_pdf(input_path=self.pdf_filepath, password=self.password, pages=self.pages, force_subprocess=True, **template)
                    else:
                        tabs = tabula.read_pdf_with_template(input_path=self.pdf_filepath, template_path=template, pages=refined, password=self.password, force_subprocess=True)
                    if tabs:
                        dfs.extend(tabs)
        else:
            dfs = tabula.read_pdf(input_path=self.pdf_filepath, password=self.password, pages=self.pages, \
                                    lattice=True, force_subprocess=True)
    
        return [self.clean_and_transform_table(df) 
                for df in dfs]

    def get_len(self):
        with open(self.pdf_filepath, 'rb') as fp:
            reader = None
            try:
                reader = PyPDF2.PdfReader(fp, password=self.password or None)
            except PyPDF2.errors.FileNotDecryptedError:
                raise DecryptionError('Wrong password')
            except PyPDF2.errors.PdfReadError as error:
                reader = PyPDF2.PdfReader(fp)
            num_pages = len(reader.pages)
            del reader

        return num_pages

    def _refine_page_opts(self, page_opts: str):
        end = self.get_len()
        refined = page_opts.replace('end', f'{end}')
        refined = refined.replace('bfe', f'{end - 1}')
        return refined

    def transform_column(self, col: pandas.Series):
        funcs = [safe_atof, safe_to_datetime]
        try:
            col = col.astype(str).str.replace('\r', ' ')
        except AttributeError:
            pass
        for func in funcs:
            try:
                return  col.apply(func)
            except:
                
                continue
        if col.nunique() < len(col) * 0.2:
            return pandas.Categorical(col)
        return col
    
    def merge_tables(self, tables: list[pandas.DataFrame]):
        merged_tables = defaultdict(list)
        # Group tables based on their headers
        for table in tables:
            header = generate_uuid(''.join(table.columns.to_list()))
            if header in self.table_map:
                header = self.table_map[header]
            merged_tables[header].append(table.dropna(axis=1, how='all'))
        _tables =  merged_tables
        # Merge grouped tables into single DataFrames
        result = {header: pandas.concat(dfs, ignore_index=True, verify_integrity=True) 
                for header, dfs in _tables.items()}
        return result
            

    def clean_and_transform_table(self, df: pandas.DataFrame):
        df = df.dropna(axis=0, how='all').fillna('')
        df  = df.apply(self.transform_column, axis=1)
        return df

    def save_csv(self, output_file, separated=False):
        if not self.tables:
            raise ValueError("No tables to save.")
        if not isinstance(self.tables, dict):
            raise TypeError(' self.tables must be a dict')
        if separated:
            for key, table in self.tables.items():
                filename = f"{key}.csv"
                table.to_csv(filename, index=False)
        else:
            pandas.concat(self.tables.values(), ignore_index=True).to_csv(output_file, index=False)

    def save_excel(self, outupfile):
        if not self.tables:
            raise ValueError('No tables to save')
        with pandas.ExcelWriter(f"{outupfile}.xlsx") as excel:
            for head, table in self.tables.items():
                tablename = generate_uuid(head)
                table.to_excel(excel, sheet_name=tablename)

    def map_tables(self, tables):
        if self.table_map:
            mapped_tables = {}
            for key, val in tables.items():
                if key in self.table_map.keys():
                    mapped_tables[self.table_map[key]] = val
                else:
                    mapped_tables[key] = val
            return mapped_tables
        return tables
        
    def categorize(self):
        if not self.tables: return None
        if 'data' in self.tables:
            self.tables['data'] = categorize(self.tables['data'])

    def to_json(self):
        if not self.tables: return None
        data = {}
        for name, table in self.tables.items():
            data[name] = json.loads(table.to_json(orient='records'))
        return json.dumps(data)

class DecryptionError(Exception):
    """Error with password"""