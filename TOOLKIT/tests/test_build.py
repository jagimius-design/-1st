import zipfile

import pytest

from build import FOLDER, PARTS, build
from conftest import BUILDERS


def test_zip_holds_every_part(tmp_path):
    with zipfile.ZipFile(build(tmp_path)) as z:
        assert sorted(z.namelist()) == sorted(f"{FOLDER}/{name}" for name, _ in PARTS)


@pytest.mark.parametrize("name", BUILDERS)
def test_no_formula_errors(recalc, name):
    errors = [(ws.title, c.coordinate, c.value) for ws in recalc(name) for row in ws.iter_rows()
              for c in row if isinstance(c.value, str) and c.value.startswith("#")]
    assert errors == []
