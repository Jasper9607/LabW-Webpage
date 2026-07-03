(function () {
  "use strict";

  const jsonCache = new Map();

  document.addEventListener("DOMContentLoaded", () => {
    setupNavigation();
    markActiveNav();
    setCurrentYear();
    routePage();
  });

  function setupNavigation() {
    const button = document.querySelector(".nav-toggle");
    const nav = document.querySelector(".site-nav");
    if (!button || !nav) return;

    button.addEventListener("click", () => {
      const isOpen = button.getAttribute("aria-expanded") === "true";
      button.setAttribute("aria-expanded", String(!isOpen));
      button.setAttribute("aria-label", isOpen ? "Open navigation" : "Close navigation");
      document.body.classList.toggle("nav-open", !isOpen);
    });

    nav.addEventListener("click", (event) => {
      if (event.target.closest("a")) {
        button.setAttribute("aria-expanded", "false");
        button.setAttribute("aria-label", "Open navigation");
        document.body.classList.remove("nav-open");
      }
    });
  }

  function markActiveNav() {
    const path = window.location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".site-nav a").forEach((link) => {
      const href = link.getAttribute("href");
      if (href === path || (path === "" && href === "index.html")) {
        link.setAttribute("aria-current", "page");
      }
    });
  }

  function setCurrentYear() {
    document.querySelectorAll("[data-current-year]").forEach((node) => {
      node.textContent = new Date().getFullYear();
    });
  }

  function routePage() {
    const page = document.body.dataset.page;
    if (page === "home") renderHome();
    if (page === "research") renderResearchRelated();
    if (page === "people") renderPeople();
    if (page === "alumni") renderAlumni();
    if (page === "publications") renderPublicationsPage();
    if (page === "software") renderSoftwarePage();
    if (page === "news") renderNewsPage();
    if (page === "life") renderLifePage();
  }

  async function loadJson(path) {
    if (jsonCache.has(path)) return jsonCache.get(path);
    const request = fetch(path, { cache: "no-cache" })
      .then((response) => {
        if (!response.ok) throw new Error(`Could not load ${path}`);
        return response.json();
      });
    jsonCache.set(path, request);
    return request;
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function validUrl(value) {
    const url = String(value || "").trim();
    if (!url || url.startsWith("TODO")) return "";
    return url;
  }

  function formatDate(dateValue) {
    if (!dateValue) return "";
    const date = new Date(`${dateValue}T00:00:00`);
    if (Number.isNaN(date.getTime())) return escapeHtml(dateValue);
    return date.toLocaleDateString("en", { year: "numeric", month: "short", day: "numeric" });
  }

  function initials(name) {
    return String(name || "Lab W")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  }

  function tagMarkup(tags) {
    if (!Array.isArray(tags) || !tags.length) return "";
    return `<div class="publication-tags">${tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}</div>`;
  }

  function linkButtons(item) {
    const links = [
      ["Website", item.website],
      ["GitHub", item.github],
      ["Docs", item.documentation],
      ["Paper", item.publication],
      ["Link", item.url],
      ["PDF", item.pdf]
    ].filter(([, url]) => validUrl(url));
    if (!links.length) return "";
    return `<div class="card-actions">${links.map(([label, url]) => `<a class="button button-secondary" href="${escapeHtml(validUrl(url))}" target="_blank" rel="noopener">${escapeHtml(label)}</a>`).join("")}</div>`;
  }

  function publicationCard(publication) {
    const url = validUrl(publication.url);
    const pdf = validUrl(publication.pdf);
    const doi = validUrl(publication.doi);
    const linkHtml = [
      url ? `<a href="${escapeHtml(url)}" target="_blank" rel="noopener">Article</a>` : "",
      pdf ? `<a href="${escapeHtml(pdf)}" target="_blank" rel="noopener">PDF</a>` : "",
      doi && !doi.startsWith("TODO") ? `<a href="https://doi.org/${escapeHtml(doi)}" target="_blank" rel="noopener">DOI</a>` : ""
    ].filter(Boolean).join(" · ");

    return `
      <article class="publication-card">
        <h3>${escapeHtml(publication.title)}</h3>
        <p class="publication-meta">${escapeHtml(publication.journal || "")}${publication.year ? ` · ${publication.year}` : ""}</p>
        <p>${escapeHtml(publication.authors || publication.citation || "")}</p>
        ${tagMarkup(publication.tags)}
        ${linkHtml ? `<p class="publication-links">${linkHtml}</p>` : ""}
      </article>
    `;
  }

  function softwareCard(item) {
    return `
      <article class="resource-card labw-glass-subtle">
        <span class="type">${escapeHtml(item.type || "Resource")}</span>
        <h3>${escapeHtml(item.name)}</h3>
        <p>${escapeHtml(item.description)}</p>
        ${item.audience ? `<p><strong>Audience:</strong> ${escapeHtml(item.audience)}</p>` : ""}
        ${tagMarkup(item.tags)}
        ${linkButtons(item)}
      </article>
    `;
  }

  function newsCard(item) {
    const image = validUrl(item.image);
    const link = validUrl(item.link);
    return `
      <article class="news-card labw-glass-subtle">
        ${image ? `<img src="${escapeHtml(image)}" alt="${escapeHtml(item.title)}" loading="lazy" decoding="async" width="640" height="400">` : ""}
        <div>
          <span class="date">${formatDate(item.date)}</span>
          <h3>${escapeHtml(item.title)}</h3>
          <p>${escapeHtml(item.description)}</p>
          ${tagMarkup(item.tags)}
          ${link ? `<a href="${escapeHtml(link)}" target="_blank" rel="noopener">Related link</a>` : ""}
        </div>
      </article>
    `;
  }

  function personCard(person) {
    const photo = validUrl(person.photo);
    const photoMarkup = photo
      ? `<img class="person-photo" src="${escapeHtml(photo)}" alt="${escapeHtml(person.alt || person.name)}" loading="lazy" decoding="async" width="320" height="320" onerror="this.replaceWith(Object.assign(document.createElement('div'),{className:'person-placeholder',textContent:'${escapeHtml(initials(person.name))}'}))">`
      : `<div class="person-placeholder" aria-hidden="true">${escapeHtml(initials(person.name))}</div>`;
    const email = validUrl(person.email);
    const links = Array.isArray(person.links) ? person.links.filter((link) => validUrl(link.url)) : [];
    const linkMarkup = [
      email ? `<a href="mailto:${escapeHtml(email)}">Email</a>` : "",
      ...links.map((link) => `<a href="${escapeHtml(validUrl(link.url))}" target="_blank" rel="noopener">${escapeHtml(link.label || "Link")}</a>`)
    ].filter(Boolean).join("");

    return `
      <article class="person-card">
        ${photoMarkup}
        <h3>${escapeHtml(person.name)}</h3>
        <span class="person-role">${escapeHtml(person.role || person.currentPosition || "Lab member")}</span>
        ${person.bio ? `<p>${escapeHtml(person.bio)}</p>` : ""}
        ${person.research ? `<p><strong>Research:</strong> ${escapeHtml(person.research)}</p>` : ""}
        ${linkMarkup ? `<div class="person-links">${linkMarkup}</div>` : ""}
      </article>
    `;
  }

  async function renderHome() {
    const [publications, software, news, people] = await Promise.allSettled([
      loadJson("data/publications.json"),
      loadJson("data/software.json"),
      loadJson("data/news.json"),
      loadJson("data/people.json")
    ]);

    if (publications.status === "fulfilled") {
      const container = document.querySelector("#home-publications");
      const limit = Number(container?.dataset.limit || 4);
      const list = publications.value.publications.slice(0, limit);
      container.innerHTML = list.map(publicationCard).join("");
    }

    if (software.status === "fulfilled") {
      const container = document.querySelector("#home-software");
      const limit = Number(container?.dataset.limit || 4);
      container.innerHTML = software.value.software.slice(0, limit).map(softwareCard).join("");
    }

    if (news.status === "fulfilled") {
      const container = document.querySelector("#home-news");
      const limit = Number(container?.dataset.limit || 5);
      container.innerHTML = sortedNews(news.value.news).slice(0, limit).map(newsCard).join("");
    }

    if (people.status === "fulfilled") {
      const summary = document.querySelector("#home-people-summary");
      const current = people.value.people.filter((person) => person.status === "current");
      const pi = current.find((person) => person.group === "pi");
      const trainees = current.filter((person) => person.group !== "pi").length;
      summary.textContent = `${pi ? `${pi.name} leads` : "Lab W includes"} ${current.length} current members, including ${trainees} trainees and staff members across computational, biomedical and clinical backgrounds.`;
    }

    showRejected([publications, software, news, people]);
  }

  async function renderResearchRelated() {
    try {
      const [publicationData, softwareData] = await Promise.all([
        loadJson("data/publications.json"),
        loadJson("data/software.json")
      ]);
      const tcr = publicationData.publications
        .filter((item) => (item.tags || []).includes("TCR Immunology"))
        .slice(0, 4);
      const resources = softwareData.software
        .filter((item) => (item.tags || []).some((tag) => ["TCR Immunology", "Database", "Single-cell Omics"].includes(tag)))
        .slice(0, 4);
      document.querySelector("#research-tcr-publications").innerHTML = tcr.map(miniPublication).join("");
      document.querySelector("#research-software").innerHTML = resources.map(miniSoftware).join("");
    } catch (error) {
      setError("#research-tcr-publications", "Related publications could not be loaded.");
      setError("#research-software", "Related resources could not be loaded.");
    }
  }

  function miniPublication(item) {
    return `<article class="mini-item"><strong>${escapeHtml(item.title)}</strong><p>${escapeHtml(item.journal || "")}${item.year ? ` · ${item.year}` : ""}</p></article>`;
  }

  function miniSoftware(item) {
    const website = validUrl(item.website);
    return `<article class="mini-item"><strong>${escapeHtml(item.name)}</strong><p>${escapeHtml(item.description)}</p>${website ? `<a href="${escapeHtml(website)}" target="_blank" rel="noopener">Open resource</a>` : ""}</article>`;
  }

  async function renderPeople() {
    try {
      const data = await loadJson("data/people.json");
      const people = data.people
        .filter((person) => person.status === "current")
        .sort((a, b) => (a.order || 999) - (b.order || 999));
      const groups = [
        ["pi", "Principal Investigator"],
        ["graduate", "Current Members"],
        ["research_assistant", "Research Assistants"],
        ["undergraduate", "Undergraduate Researchers"]
      ];
      const html = groups.map(([group, title]) => {
        const items = people.filter((person) => person.group === group);
        if (!items.length) return "";
        const shouldCollapse = group === "undergraduate" && items.length > 8;
        const visible = shouldCollapse ? items.slice(0, 8) : items;
        const hidden = shouldCollapse ? items.slice(8) : [];
        return `
          <section class="people-group">
            <h2>${escapeHtml(title)}</h2>
            <div class="people-grid">${visible.map(personCard).join("")}</div>
            ${hidden.length ? `<div class="people-grid hidden-undergrads" hidden>${hidden.map(personCard).join("")}</div><button class="button button-secondary show-more" type="button" data-show-undergrads>Show all undergraduate researchers</button>` : ""}
          </section>
        `;
      }).join("");
      document.querySelector("#people-groups").innerHTML = html || `<p class="empty-state">No current members found.</p>`;
      setupUndergradToggle();
    } catch (error) {
      setError("#people-groups", "People data could not be loaded.");
    }
  }

  function setupUndergradToggle() {
    const button = document.querySelector("[data-show-undergrads]");
    const hidden = document.querySelector(".hidden-undergrads");
    if (!button || !hidden) return;
    button.addEventListener("click", () => {
      const isHidden = hidden.hasAttribute("hidden");
      hidden.toggleAttribute("hidden", !isHidden);
      button.textContent = isHidden ? "Show fewer undergraduate researchers" : "Show all undergraduate researchers";
    });
  }

  async function renderAlumni() {
    try {
      const data = await loadJson("data/people.json");
      const alumni = data.people
        .filter((person) => person.status === "alumni")
        .sort((a, b) => (a.order || 999) - (b.order || 999));
      document.querySelector("#alumni-list").innerHTML = alumni.map(personCard).join("") || `<p class="empty-state">No alumni records found.</p>`;
    } catch (error) {
      setError("#alumni-list", "Alumni data could not be loaded.");
    }
  }

  async function renderPublicationsPage() {
    try {
      const data = await loadJson("data/publications.json");
      const publications = data.publications.slice();
      const yearSelect = document.querySelector("#publication-year");
      const tagSelect = document.querySelector("#publication-tag");
      const search = document.querySelector("#publication-search");
      fillSelect(yearSelect, unique(publications.map((item) => item.year).filter(Boolean)));
      fillSelect(tagSelect, unique(publications.flatMap((item) => item.tags || [])));

      const render = () => {
        const query = search.value.trim().toLowerCase();
        const year = yearSelect.value;
        const tag = tagSelect.value;
        const filtered = publications.filter((item) => {
          const matchesYear = !year || String(item.year) === year;
          const matchesTag = !tag || (item.tags || []).includes(tag);
          const haystack = `${item.title} ${item.authors} ${item.journal} ${item.citation}`.toLowerCase();
          const matchesQuery = !query || haystack.includes(query);
          return matchesYear && matchesTag && matchesQuery;
        });
        document.querySelector("#publication-results").innerHTML = filtered.length
          ? filtered.map(publicationCard).join("")
          : `<p class="empty-state">No publications match the current filters.</p>`;
      };

      [yearSelect, tagSelect].forEach((select) => select.addEventListener("change", render));
      search.addEventListener("input", render);
      render();
    } catch (error) {
      setError("#publication-results", "Publications could not be loaded.");
    }
  }

  async function renderSoftwarePage() {
    try {
      const data = await loadJson("data/software.json");
      document.querySelector("#software-list").innerHTML = data.software.map(softwareCard).join("");
    } catch (error) {
      setError("#software-list", "Software and data resources could not be loaded.");
    }
  }

  async function renderNewsPage() {
    try {
      const data = await loadJson("data/news.json");
      const news = sortedNews(data.news);
      const yearSelect = document.querySelector("#news-year");
      const tagSelect = document.querySelector("#news-tag");
      fillSelect(yearSelect, unique(news.map((item) => item.date.slice(0, 4))));
      fillSelect(tagSelect, unique(news.flatMap((item) => item.tags || [])));

      const render = () => {
        const year = yearSelect.value;
        const tag = tagSelect.value;
        const filtered = news.filter((item) => {
          const matchesYear = !year || item.date.startsWith(year);
          const matchesTag = !tag || (item.tags || []).includes(tag);
          return matchesYear && matchesTag;
        });
        document.querySelector("#news-list").innerHTML = filtered.length
          ? filtered.map(newsCard).join("")
          : `<p class="empty-state">No news items match the current filters.</p>`;
      };

      [yearSelect, tagSelect].forEach((select) => select.addEventListener("change", render));
      render();
    } catch (error) {
      setError("#news-list", "News data could not be loaded.");
    }
  }

  async function renderLifePage() {
    try {
      const data = await loadJson("data/gallery.json");
      const html = data.albums.map((album) => `
        <section class="gallery-album">
          <h2>${escapeHtml(album.title)}</h2>
          ${album.description ? `<p>${escapeHtml(album.description)}</p>` : ""}
          <div class="gallery-grid">
            ${(album.items || []).map(galleryItem).join("")}
          </div>
        </section>
      `).join("");
      document.querySelector("#gallery-albums").innerHTML = html;
    } catch (error) {
      setError("#gallery-albums", "Gallery data could not be loaded.");
    }
  }

  function galleryItem(item) {
    const src = validUrl(item.src);
    const thumb = validUrl(item.thumb) || src;
    const href = src ? `href="${escapeHtml(src)}" target="_blank" rel="noopener"` : "";
    return `
      <a class="gallery-item" ${href}>
        <img src="${escapeHtml(thumb)}" alt="${escapeHtml(item.alt || item.caption || "Lab W gallery image")}" loading="lazy" decoding="async" width="420" height="320">
        ${item.caption ? `<div class="gallery-caption">${escapeHtml(item.caption)}</div>` : ""}
      </a>
    `;
  }

  function fillSelect(select, values) {
    if (!select) return;
    values.sort((a, b) => String(b).localeCompare(String(a)));
    select.insertAdjacentHTML("beforeend", values.map((value) => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`).join(""));
  }

  function unique(values) {
    return Array.from(new Set(values.filter(Boolean)));
  }

  function sortedNews(news) {
    return news.slice().sort((a, b) => String(b.date).localeCompare(String(a.date)));
  }

  function setError(selector, message) {
    const node = document.querySelector(selector);
    if (node) node.innerHTML = `<p class="empty-state">${escapeHtml(message)}</p>`;
  }

  function showRejected(results) {
    results.forEach((result) => {
      if (result.status === "rejected") console.warn(result.reason);
    });
  }
})();
