# Patch per il bot: invalidare la cache dei moduli

In `core/database.py` (classe `Database`), da chiamare dopo la creazione del pool:

```python
    async def start_config_listener(self) -> None:
        """Il panel web scrive su guild_config e invia NOTIFY: qui si svuota la cache dei moduli."""
        self._listen_conn = await self.pool.acquire()
        await self._listen_conn.add_listener("guild_config_changed", self._on_config_changed)

    def _on_config_changed(self, conn, pid, channel, payload) -> None:
        try:
            guild_id = int(json.loads(payload)["guild_id"])
        except (ValueError, KeyError, TypeError):
            return
        self._modules_cache.delete(guild_id)
```
Nota: la connessione di ascolto resta occupata; alza `DB_POOL_MAX` di 1.
