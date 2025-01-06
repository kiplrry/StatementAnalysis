from .converters.gptrec import MpesaCSVConverter, DecryptionError
import os

def analysempesa(filepath, pages='all', password=None):
    conv = MpesaCSVConverter(filepath, pages, password=password)
    base_dir = os.path.dirname(__file__)    
    conv.templates = {
    '1': os.path.join(base_dir, 'static/mpesa_temp_page1.json'),
    '2-end': os.path.join(base_dir, 'static/mpesa_temp_rest.json'),
    }
    conv.process_pages()
    conv.categorize()
    data = conv.to_json()
    keys_to_check = ['summary', 'data']
    all_exist = all(key in data for key in keys_to_check)
    if not all_exist:
        raise ValueError('might not be a valid mpesa file')
    return data