import pandas as pd
import locale

# locale.setlocale()
locale.setlocale(locale.LC_NUMERIC, '')  # Set to system locale

def safe_atof(x):
    """Convert to float if possible, otherwise return original."""
    if not x and x != 0: return None
    try:
        ans = locale.atof(x) # Remove currency symbols, etc.
    except:
        ans = x
    return ans

    

def safe_to_datetime(x):
    """Convert to datetime if possible, otherwise return original."""
    if not x: return None
    try:
        dt = pd.to_datetime(x, errors='raise')
        return dt
    except:
        return x

def safe_to_bool(x):
    """Convert strings like 'True', 'Yes', '1' to boolean."""
    if isinstance(x, str) and x.strip().lower() in ['true', 'yes', '1']:
        return True
    elif isinstance(x, str) and x.strip().lower() in ['false', 'no', '0']:
        return False
    return x  # Return original if not convertible

def transform_column(col):
    """Apply a transformation pipeline to each column."""
    try:
        col = col.apply(safe_atof) 
    except ValueError:
        try:
            col = col.apply(safe_to_datetime,)     # Try to convert to datetime
        except:
            pass

    # col = col.apply(safe_to_bool)         # Try to convert to boolean
    if col.nunique() < len(col) * 0.2:    # If many repeated values, make categorical
        col = pd.Categorical(col)
    return col

