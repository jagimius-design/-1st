import shutil
import subprocess

import openpyxl
import pytest

import clients
import expenses
import invoice
import tax

MODULES = {"invoice": invoice, "expenses": expenses, "tax": tax, "clients": clients}


@pytest.fixture(scope="session")
def recalc(tmp_path_factory):
    """recalc(name) -> the template's workbook with values, as LibreOffice computes them.

    openpyxl writes formulas without results, so the file goes through a headless
    LibreOffice round trip to get values to assert on.
    """
    soffice = shutil.which("soffice")
    if not soffice:
        pytest.skip("LibreOffice (soffice) with Calc is needed to compute formulas")
    root = tmp_path_factory.mktemp("recalc")
    cache = {}

    def get(name):
        if name not in cache:
            src = root / f"{name}.xlsx"
            MODULES[name].build(src)
            out = root / "out"
            subprocess.run([soffice, f"-env:UserInstallation=file://{root}/profile", "--headless",
                            "--convert-to", "xlsx", "--outdir", str(out), str(src)],
                           check=True, capture_output=True, timeout=300)
            if not (out / src.name).exists():
                pytest.skip("LibreOffice could not open the file (is Calc installed?)")
            cache[name] = openpyxl.load_workbook(out / src.name, data_only=True)
        return cache[name]

    return get
