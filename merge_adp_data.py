import pandas as pd
from pathlib import Path

csv_dir = Path("historical_csvs")
csv_files = sorted(csv_dir.glob("*.csv"))
dfs = []

for csv_file in csv_files:
    filename = csv_file.stem  # e.g., "04-01", "04-15"
    
    # Parse month and day from MM-DD format
    parts = filename.split("-")
    month = int(parts[0])
    day = int(parts[1])
    
    df = pd.read_csv(csv_file)
    
    # Column 5 (0-indexed) is the ADP column for the file's date
    adp_date_col = df.columns[5]
    
    # Convert to datetime format 2026-MM-DD
    date_str = f"2026-{month:02d}-{day:02d}"
    
    # Select Player, Position, and the date ADP column
    df = df[["Player", "Position", adp_date_col]].copy()
    df = df.rename(columns={adp_date_col: date_str})
    
    dfs.append((month, day, df))

# Merge all on Player + Position
result = dfs[0][2].copy()
for month, day, df in dfs[1:]:
    result = result.merge(df, on=["Player", "Position"], how="outer")

# Reorder: Player, Position, then ADP columns chronologically
adp_cols = sorted([col for col in result.columns if col.startswith("2026")], 
                  key=lambda x: (int(x.split("-")[1]), int(x.split("-")[2])))
result = result[["Player", "Position"] + adp_cols]

# Fill NaN values with 240.0
result = result.fillna(240.0)

result.to_csv("merged_adp.csv", index=False)
print(f"Merged {len(csv_files)} files -> merged_adp.csv ({len(result)} players)")
print(f"Columns: {list(result.columns)}")