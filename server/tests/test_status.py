import dataclasses, httpx
UC = "UC" + "a" * 22
FEED = "<feed><published>2001-01-01T00:00:00+00:00</published><entry><published>2026-09-30T10:00:00+00:00</published></entry><entry><published>2026-09-29T08:00:00+00:00</published></entry></feed>"

def mock(calls):
    def h(req: httpx.Request):
        calls.append(req.url.host)
        if req.url.host == "id.twitch.tv": return httpx.Response(200, json={"access_token": "t"})
        if req.url.host == "api.twitch.tv": return httpx.Response(200, json={"data": [{"title": "Live!"}]})
        if req.url.host == "www.youtube.com": return httpx.Response(200, text=FEED)
        return httpx.Response(404)
    return httpx.MockTransport(h)

async def test_status_twitch_and_youtube_cached(client):
    app = client._transport.app; calls = []
    app.state.s = dataclasses.replace(app.state.s, twitch_client_id="i", twitch_client_secret="s", twitch_login="kit", yt_channels=(UC, "non-valido"))
    app.state.http = httpx.AsyncClient(transport=mock(calls))
    d = (await client.get("/api/status")).json()
    assert d["twitch"] == {"live": True, "title": "Live!"}
    assert d["youtube"][0]["latest"] == ["2026-09-30T10:00:00+00:00", "2026-09-29T08:00:00+00:00"]  # niente data di creazione del canale
    assert d["youtube"][1]["latest"] is None
    n = len(calls); await client.get("/api/status"); assert len(calls) == n  # seconda richiesta dalla cache
    assert calls.count("www.youtube.com") == 1  # canale non valido: nessuna richiesta

async def test_status_unconfigured_is_unknown(client):
    d = (await client.get("/api/status")).json()
    assert d == {"twitch": None, "youtube": []}

async def test_status_errors_are_unknown_not_offline(client):
    app = client._transport.app
    app.state.s = dataclasses.replace(app.state.s, twitch_client_id="i", twitch_client_secret="s", twitch_login="kit")
    app.state.http = httpx.AsyncClient(transport=httpx.MockTransport(lambda r: httpx.Response(500)))
    assert (await client.get("/api/status")).json()["twitch"] is None
