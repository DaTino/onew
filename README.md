# OneW: Occupied NorthEast Wisconsin

A satirical NGO-style website about the "Occupation" of Northeast Wisconsin (the Upper Peninsula of Michigan), based on the 2019 presentation *Occupied Northeast Wisconsin: An American Travesty*.

**Live site:** https://datino.github.io/onew/

## Viewing and deploying

Plain HTML, CSS and JavaScript in the `site/` folder, with no build step. To view it locally, open `site/index.html` in a browser.

Every push to `main` that changes `site/` is published to GitHub Pages by [`.github/workflows/pages.yml`](.github/workflows/pages.yml). You can also run it by hand from the repo's **Actions** tab ("Deploy site to GitHub Pages", then **Run workflow**).

## Pages

All files below are in `site/`.

| File | Section |
| --- | --- |
| `index.html` | Home: hero, the ONEW to One W pun, the "As it is / As it should be" map, stats, projects, testimonials, news |
| `history.html` | The Occupation: interactive, filterable timeline from 1787 to today |
| `crisis.html` | The Crisis: resources, forced labor, Quincy Hill, symbols of oppression, the FOIA log, signs of hope |
| `action.html` | Take Action: petition with signature counter, the four demands, call script |
| `donate.html` | Mock donation form (no payment fields; the button opens a joke thank-you) |
| `news.html` | Newsroom: press releases and statements that expand in place |
| `about.html` | Mission, story, values, team, FAQ, contact |

The header and footer are repeated in each page, so a change to the navigation has to be made in all seven files.

## How the interactive parts work

- **Petition:** the public tally is calculated from the date. A visitor's own signature is kept only in their browser's `localStorage`, and nothing is sent anywhere.
- **Donate and newsletter:** these are mocks. No payment details or email addresses are collected or stored.
- **Occupation clock:** counts days since Michigan statehood (January 26, 1837).

## Assets

Paths are relative to `site/`.

- `assets/js/maps.js`, `assets/img/one-wisconsin.svg`, `assets/img/onew-mark.svg` and `favicon.svg` are original artwork generated from public-domain map data (U.S. Census Bureau boundaries via us-atlas; Canada and lakes from Natural Earth).
- The photos and portraits in `assets/img/*.jpg` come from the original Keynote deck. The Jackson and Mason portraits, the 19th-century engraving, the 1830s map and the Quincy Hill photograph are old enough that they are likely public domain. The source of the Mackinac Bridge photo is unknown, so check its license or replace it before publishing.

## Colors

Navy `#12284B` and gold `#FFC52F`, defined as CSS variables at the top of `assets/css/style.css`.
