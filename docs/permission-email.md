# Draft: permission request to the DMBB

Send from a real, monitored address. Keep the reply — it is the thing that makes
everything else defensible.

Adjust the bracketed parts. Do not oversell it; a short, plain, slightly humble
email from an actual member of the basketball community lands far better than
anything that sounds like a legal notice or a startup pitch.

---

**Subject:** Permission request — unofficial Dublin basketball fixtures site

Hi,

My name is [NAME] and I play / coach / help out with [CLUB] in the Dublin men's
leagues.

I've built a small website that shows DMBB fixtures and tables in a format
that's easier to read on a phone. It's at [URL]. It's a hobby project — there's
no advertising on it, nothing is sold, and I make no money from it.

I want to be upfront about two things before it goes any further:

1. **It's clearly marked as unofficial.** Every page carries a notice saying the
   site isn't affiliated with the DMBB and linking to dmbb.ie as the official
   source. It doesn't use the board's logo or crest, and it isn't named after
   the board.

2. **I've turned off the automatic data collection.** I noticed your robots.txt
   asks automated clients not to crawl the site, so I've disabled it rather than
   ignore that. At the moment the site is running from a single stored copy of
   the fixture list.

What I'd like to ask is whether you'd be willing to let me show DMBB fixtures
and results on the site — either by allowing a low-volume, clearly identified
automated check (I'd suggest no more than once every 15 minutes, a few requests
at a time), or by sending me a data export in whatever format suits you.

If the answer is no, that's genuinely fine — just say so and I'll either take the
fixture data down or keep it entirely manual. And if the board would find this
useful, I'm very happy to hand the whole thing over, run it under the board's
direction, or build what you'd actually want instead.

Either way, thanks for reading, and thanks for running the leagues.

Best,
[NAME]
[PHONE / EMAIL]
[CLUB]

---

## If they say yes

Save the email. Then:

1. Set `DMBB_SYNC_USER_AGENT` to identify the site and give a contact route.
2. Set `DMBB_LIVE_SYNC=true`.
3. Note the date and scope of the permission in `docs/data-permission.md`.

## If they say no

Leave live sync off and remove `src/lib/data/snapshot.json` from anything
public. The site can still run on manually entered data.

## If they don't reply

Follow up once after a few weeks. Silence is not permission — keep sync off.
