import shutil
import subprocess

import openpyxl
import pytest

import book
import invoice

BUILDERS = {"book": book.build, "invoice": invoice.build}


@pytest.fixture(scope="session")
def recalc(tmp_path_factory):
    """recalc(name, edit=None) -> the built workbook with values, as LibreOffice computes them.

    openpyxl writes formulas without results, so the file goes through a headless LibreOffice
    round trip. `edit(wb)` changes inputs on the formula workbook first (charts are dropped).
    """
    soffice = shutil.which("soffice")
    if not soffice:
        pytest.skip("LibreOffice (soffice) with Calc is needed to compute formulas")
    root = tmp_path_factory.mktemp("recalc")
    cache = {}

    def get(name, edit=None):
        key = (name, edit.__name__ if edit else "")
        if key not in cache:
            src = root / f"{name}-{key[1] or 'sample'}.xlsx"
            BUILDERS[name](src)
            if edit:
                wb = openpyxl.load_workbook(src)
                edit(wb)
                wb.save(src)
            out = root / "out"
            subprocess.run([soffice, f"-env:UserInstallation=file://{root}/profile", "--headless",
                            "--convert-to", "xlsx", "--outdir", str(out), str(src)],
                           check=True, capture_output=True, timeout=300)
            if not (out / src.name).exists():
                pytest.skip("LibreOffice could not open the file (is Calc installed?)")
            cache[key] = openpyxl.load_workbook(out / src.name, data_only=True)
        return cache[key]

    return get


def clear_records(wb):
    """Empty the sample Income, Expenses, Mileage and Use of Home inputs."""
    from layout import (EXPENSES, EXP_FIRST, HOME, HOME_FIRST, HOME_LAST, INCOME, INC_FIRST,
                        MILEAGE, MIL_FIRST)
    for sheet, first, cols in [(INCOME, INC_FIRST, "BCDEFG"), (EXPENSES, EXP_FIRST, "BCDEFG"),
                               (MILEAGE, MIL_FIRST, "BCDEF")]:
        for r in range(first, first + 60):
            for c in cols:
                wb[sheet][f"{c}{r}"] = None
    for r in range(HOME_FIRST, HOME_LAST + 1):
        wb[HOME][f"D{r}"] = None
