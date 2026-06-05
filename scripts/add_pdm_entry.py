#!/usr/bin/env python3
"""Add or update one PDM data row in PDM_Data.txt.

Usage:
    python scripts/add_pdm_entry.py 2026-06-05 0.6720 0.7010
"""

from __future__ import annotations

import argparse
import csv
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[1]
DATA_FILE = REPO_ROOT / "PDM_Data.txt"
EXPECTED_HEADER = ["date", "fraction_time_elapsed", "fraction_PDM_spent"]


@dataclass(frozen=True)
class PdmRow:
    date: str
    fraction_time_elapsed: float
    fraction_pdm_spent: float

    def as_csv_row(self) -> list[str]:
        return [
            self.date,
            f"{self.fraction_time_elapsed:.4f}",
            f"{self.fraction_pdm_spent:.4f}",
        ]


def parse_fraction(value: str, field_name: str) -> float:
    try:
        parsed = float(value)
    except ValueError as error:
        raise argparse.ArgumentTypeError(f"{field_name} must be a number between 0 and 1.") from error

    if not 0 <= parsed <= 1:
        raise argparse.ArgumentTypeError(f"{field_name} must be between 0 and 1.")

    return parsed


def parse_date(value: str) -> str:
    try:
        datetime.strptime(value, "%Y-%m-%d")
    except ValueError as error:
        raise argparse.ArgumentTypeError("date must use YYYY-MM-DD format, for example 2026-06-05.") from error

    return value


def load_rows() -> list[PdmRow]:
    with DATA_FILE.open(newline="", encoding="utf-8") as data_file:
        reader = csv.reader(line for line in data_file if line.strip())
        header = next(reader, None)
        if header != EXPECTED_HEADER:
            raise ValueError(f"Expected header {EXPECTED_HEADER}, found {header}.")

        rows: list[PdmRow] = []
        for row in reader:
            if len(row) != 3:
                raise ValueError(f"Expected 3 columns, found {len(row)} in row: {row}")
            rows.append(PdmRow(row[0], float(row[1]), float(row[2])))

    return rows


def save_rows(rows: list[PdmRow]) -> None:
    sorted_rows = sorted(rows, key=lambda row: row.date)
    with DATA_FILE.open("w", newline="", encoding="utf-8") as data_file:
        writer = csv.writer(data_file, lineterminator="\n")
        writer.writerow(EXPECTED_HEADER)
        writer.writerows(row.as_csv_row() for row in sorted_rows)


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Add or update one row in PDM_Data.txt.")
    parser.add_argument("date", type=parse_date, help="Data date in YYYY-MM-DD format.")
    parser.add_argument(
        "fraction_time_elapsed",
        type=lambda value: parse_fraction(value, "fraction_time_elapsed"),
        help="Fiscal-year fraction elapsed, as a decimal from 0 to 1.",
    )
    parser.add_argument(
        "fraction_pdm_spent",
        type=lambda value: parse_fraction(value, "fraction_PDM_spent"),
        help="PDM spent fraction, as a decimal from 0 to 1.",
    )
    return parser


def main() -> None:
    args = build_parser().parse_args()
    new_row = PdmRow(args.date, args.fraction_time_elapsed, args.fraction_pdm_spent)

    rows_by_date = {row.date: row for row in load_rows()}
    action = "Updated" if new_row.date in rows_by_date else "Added"
    rows_by_date[new_row.date] = new_row
    save_rows(list(rows_by_date.values()))

    print(f"{action} {DATA_FILE.name}: {','.join(new_row.as_csv_row())}")


if __name__ == "__main__":
    main()
