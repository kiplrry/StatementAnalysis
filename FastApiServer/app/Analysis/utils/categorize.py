from pandas import DataFrame

def categorize(df: DataFrame):
    df[['detail', 'Account']] = df['Details'].str.split(r' \- |\s\-\n|^\-\s', n=1, expand=True).fillna('')
    pattern = r'\b(?:to|from|At|at)\b|\s(?:to|from|At|at)\n|^(?:to|from|At|at)\s'
    df[['Type', 'Business']] = df['detail'].str.split(pattern, n=1, expand=True, regex=True).fillna('')
    df = df.drop('detail', axis=1)

    skip_patt = r' (?:by|from|to|At|at)$'

    df['Type'] = df['Type'].str.strip().str.replace(skip_patt, '', regex=True).str.strip()
    df['Business'] = df['Business'].str.strip().str.replace(skip_patt, '',  regex=True).str.strip()
    df = df.map(lambda x: x.replace('\n', ' ') if isinstance(x, str) else x)
    return df