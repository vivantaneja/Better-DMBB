# Data permission status

**Status: permission NOT yet requested. Live sync is OFF.**

## Why this file exists

`https://dmbb.ie/robots.txt` ends with:

```
User-agent: *
Disallow: /
Disallow: /uploads/
Disallow: /content/
Disallow: /images/
Disallow: /pdf/
```

`User-agent: * / Disallow: /` asks **every** automated client not to fetch **any**
path on the site. An earlier version of this project fetched roughly 40 pages
from dmbb.ie on every cache miss, with no identifying user-agent and unbounded
concurrency. That is now disabled.

## Current behaviour

- The site runs entirely from `src/lib/data/snapshot.json`, a stored dataset.
- `DMBB_LIVE_SYNC` defaults to `false`. Nothing contacts dmbb.ie.
- `src/lib/data/dmbb-source.ts` throws immediately unless that flag is `"true"`.

## Before turning live sync on

1. Get **written** permission from the board (email is fine — keep it).
2. Set `DMBB_SYNC_USER_AGENT` to something that identifies the site and gives a
   contact route.
3. Only then set `DMBB_LIVE_SYNC=true`.

If permission is refused, leave it off. The site still works from a snapshot or
from manually maintained data.

## A note on the snapshot

Ireland recognises *sui generis* database rights in addition to copyright.
Individual facts (who played whom, and the score) are not themselves protected,
but a **substantial extraction** of someone's database can be. The snapshot in
this repo contains 843 fixtures and 39 competitions, which is a substantial
extraction by any reasonable reading.

Practical takeaway: the snapshot is fine for local development. Publishing it
to the open web while permission is still pending is the main remaining legal
exposure on this project. The conservative order of operations is **ask first,
publish after**.
