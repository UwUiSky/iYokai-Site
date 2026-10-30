"""Transaction adapter tests with an in-memory connection, not a PostgreSQL server."""
import pytest
from app.db import Db,ModuleConflict

class Connection:
    def __init__(self,current):self.current=current;self.statements=[]
    async def __aenter__(self):return self
    async def __aexit__(self,*args):return False
    def transaction(self):return self
    async def fetchrow(self,*args):return None if self.current=='missing' else {'v':self.current}
    async def execute(self,*args):self.statements.append(args)
class Pool:
    def __init__(self,c):self.c=c
    def acquire(self):return self.c

async def test_conflict_and_missing_row_never_write_or_notify():
    for current,error in [(True,ModuleConflict),('missing',LookupError)]:
        connection=Connection(current)
        with pytest.raises(error):await Db(Pool(connection)).set_module(111,'automod',True,999,False)
        assert connection.statements==[]

async def test_unchanged_setting_has_no_duplicate_audit_or_notification():
    connection=Connection(False)
    await Db(Pool(connection)).set_module(111,'automod',False,999,False)
    assert connection.statements==[]

async def test_first_enable_preserves_null_audit_and_emits_invalidation():
    connection=Connection(None)
    await Db(Pool(connection)).set_module(111,'automod',True,999,False)
    assert len(connection.statements)==3
    update,audit,notification=connection.statements
    assert update[1:]==(111,'automod',True)
    assert audit[1:]==(111,999,'automod','null','true')
    assert 'guild_config_changed' in notification[0]
