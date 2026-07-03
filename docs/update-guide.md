# Lab W Website Content Update Guide

This site is now a static multi-page website. Most frequently edited content lives in `data/*.json`.

## Local Preview

1. Open a terminal in the website root.
2. Run `python -m http.server 8000`.
3. Open `http://localhost:8000/`.
4. Check the page you changed and any preview on the homepage.

Do not use `file://` as the only preview method because JSON loading may fail.

## Add News

1. Open `data/news.json`.
2. Add a new object at the top of the `news` array.
3. Use `YYYY-MM-DD` for `date`.
4. Put an image in `img/news/` or leave `image` empty.
5. Preview `index.html` and `news.html`.

## Add A Current Member

1. Open `data/people.json`.
2. Add a new object to the `people` array.
3. Set `status` to `current`.
4. Set `group` to one of `pi`, `postdoc`, `graduate`, `research_assistant`, or `undergraduate`.
5. Put the photo path in `photo`; leave it empty if no confirmed photo exists.
6. Preview `people.html`.

## Move A Member To Alumni

1. Open `data/people.json`.
2. Find the member.
3. Change `status` from `current` to `alumni`.
4. Change `group` to `alumni`.
5. Add `currentPosition` only if confirmed.
6. Preview `people.html` and `alumni.html`.

## Add A Publication

1. Open `data/publications.json`.
2. Add a new publication object.
3. Fill `year`, `title`, `authors`, `journal`, and any confirmed `doi`, `url`, or `pdf`.
4. Do not invent PDF links.
5. Add tags such as `TCR Immunology`, `Single-cell Omics`, `Spatial Omics`, `Autoimmune Disease`, `Epigenomics`, `Stem Cell Biology`, or `Tools & Databases`.
6. Preview `publications.html` and the homepage.

## Add Software Or Data

1. Open `data/software.json`.
2. Add a new object to the `software` array.
3. Fill confirmed links only.
4. Preview `software.html` and the homepage.

## Add Life / Gallery Images

1. Put images in a suitable folder such as `img/life/`, `img/cat/`, or `img/outsideof/`.
2. Open `data/gallery.json`.
3. Add an item with `src`, `thumb`, `alt`, `caption`, and optional `date`.
4. Every image must have meaningful `alt` text.
5. Preview `life.html`.

## CMS Notes

The Decap CMS entry is available at `/admin/`, but saving content online requires GitHub repository and authentication setup.

Before launch, update `admin/config.yml`:

1. Replace `TODO_OWNER/TODO_REPO`.
2. Confirm the branch name.
3. Confirm the authentication provider.
4. Consider self-hosting Decap CMS assets if CDN access is a concern.

## Send For Review

After editing JSON:

1. Preview locally.
2. Check desktop and mobile width.
3. Confirm no image is broken.
4. Send the changed page and data file to the PI or website maintainer for confirmation.
