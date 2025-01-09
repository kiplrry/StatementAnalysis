import pandas 
import logging
import os
from pdfplumber import open as open_pdf
from utils.helpers import generate_uuid
from utils.formatters import safe_atof, safe_to_datetime
from collections import defaultdict


class MpesaCSVConverter:
    def __init__(self, pdf_filepath: str, pages : int=None, password : str=None):
        self.pdf_filepath = pdf_filepath
        self.pages = pages
        self.password = password
        self.tables : dict[tuple, pandas.DataFrame] = None

    def process_pages(self):
        pdf = open_pdf(self.pdf_filepath, pages=self.pages, password=self.password)
        all_tables = []
        for page in pdf.pages:
            tables = self.extract_tables(page)
            all_tables.extend(tables)
        if all_tables:
            self.tables = self.merge_tables(all_tables)
        
    # async def async_process_pages(self):
    #     pdf = open_pdf(self.pdf_filepath, pages=self.pages, password=self.password)
    #     all_tables = await asyncio.gather(*[self.async_extract_tables(page) for page in pdf.pages])
    #     # Flatten the list of lists
    #     all_tables = [table for sublist in all_tables for table in sublist]
    #     if all_tables:
    #         self.tables = self.merge_tables(all_tables)

    def extract_tables(self, page):

        return [self.clean_and_transform_table(pandas.DataFrame(table[1:], columns=table[0])) 
                for table in page.extract_tables()]

    # async def async_extract_tables(self, page):
    #     return await asyncio.to_thread(self.extract_tables, page)

    def transform_column(self, col):
        funcs = [safe_atof, safe_to_datetime]
        for func in funcs:
            try:
                cole = col.apply(func)
                return cole
            except:
                continue
        if col.nunique() < len(col) * 0.2:
            return pandas.Categorical(col)
        return col
    
    def merge_tables(self, tables: list[pandas.DataFrame]):
        merged_tables = defaultdict(list)

        # Group tables based on their headers (as tuples)
        for table in tables:
            header_tuple = tuple(table.columns)
            merged_tables[header_tuple].append(table)

        # Merge grouped tables into single DataFrames
        result = {header: pandas.concat(dfs, ignore_index=True) 
                for header, dfs in merged_tables.items()}
        return result
            

    def clean_and_transform_table(self, df: pandas.DataFrame):
        df = df.dropna(axis=1, how='all').dropna(axis=0, how='all')

        return df.apply(self.transform_column, axis=1)

    def save_csv(self, output_file, separated=False):
        if not self.tables:
            raise ValueError("No tables to save.")
        if not isinstance(self.tables, dict):
            raise TypeError(' self.tables must be a dict')
        if separated:
            for key, table in self.tables.items():
                filename = f"{generate_uuid(key)}.csv"
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
