import stat

from sitekit import pulse


def mode(path):
    return stat.S_IMODE(path.stat().st_mode)


def test_db_is_private(tmp_path):
    path = tmp_path / 'p.sqlite3'
    db = pulse.open_db(path)
    db.execute("insert into meta values ('k', 'v')")
    db.commit()
    assert mode(path) == 0o600
    assert mode(path.with_name('p.sqlite3-wal')) == 0o600


def test_existing_db_is_made_private(tmp_path):
    path = tmp_path / 'p.sqlite3'
    pulse.open_db(path).close()
    path.chmod(0o644)
    pulse.open_db(path)
    assert mode(path) == 0o600


def test_db_uses_wal(tmp_path):
    assert pulse.open_db(tmp_path / 'p.sqlite3').execute('pragma journal_mode').fetchone()[0] == 'wal'
