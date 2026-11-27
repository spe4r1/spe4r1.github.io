(() => {
  "use strict";

  const portfolio = window.portfolio;
  const byId = (id) => document.getElementById(id);
  function create(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text) element.textContent = text;
    return element;
  }

  for (const brand of document.querySelectorAll("[data-brand]")) brand.textContent = portfolio.name;

  // Projects and their supporting notes share the existing reading layout.
  function renderDetail() {
    const query = new URLSearchParams(location.search);
    const isProject = query.has("project");
    const records = isProject ? portfolio.projects : portfolio.posts;
    const slug = query.get(isProject ? "project" : "post");
    const record = records.find((item) => item.slug === slug);
    if (!record) {
      document.title = "기록을 찾을 수 없습니다 · " + portfolio.name;
      byId("reader-title").textContent = "기록을 찾을 수 없습니다";
      byId("reader-summary").textContent = "프로젝트 목록에서 다시 선택해 주세요.";
      return;
    }

    document.title = record.title + " · " + portfolio.name;
    document.querySelector('meta[name="description"]').content = record.summary;
    const sample = isProject ? "예시 프로젝트" : "예시 기록";
    byId("reader-meta").textContent = [record.category, record.sample && sample, record.date].filter(Boolean).join("  /  ");
    byId("reader-title").textContent = record.title;
    byId("reader-summary").textContent = record.summary;
    const image = byId("reader-image");
    image.src = record.image;
    image.alt = record.alt;
    image.hidden = false;

    const body = byId("reader-body");
    for (const section of record.sections) {
      const block = create("section");
      block.append(create("h2", "", section.heading), create("p", "", section.body));
      body.append(block);
    }
    const note = isProject && portfolio.posts.find((item) => item.slug === record.note);
    const resource = note ? {title: note.title, url: "article.html?post=" + encodeURIComponent(note.slug)} : record.source;
    if (resource) {
      const section = create("aside", "article-source");
      const link = create("a", "", resource.title);
      link.href = resource.url;
      section.append(create("h2", "", note ? "관련 기술 기록" : "참고 자료"), link);
      body.append(section);
    }
    if (!isProject) {
      const parent = portfolio.projects.find((item) => item.note === record.slug);
      if (parent) {
        const back = byId("reader-back");
        back.textContent = "프로젝트로 돌아가기";
        back.href = "article.html?project=" + encodeURIComponent(parent.slug);
      }
    }
  }

  if (byId("reader")) {
    renderDetail();
    return;
  }

  document.title = portfolio.name + " — Portfolio";
  byId("headline").textContent = portfolio.name;
  byId("headline-accent").textContent = portfolio.headlineAccent;
  byId("about-text").textContent = portfolio.about;

  const fields = byId("profile-fields");
  for (const [label, items] of [["관심 분야", portfolio.interests], ["기술·도구", portfolio.skills]]) {
    if (items.length) fields.append(create("dt", "", label), create("dd", "", items.join(" · ")));
  }

  const resume = byId("resume");
  for (const { label, entries } of portfolio.resume) {
    const group = create("div", "resume-group");
    const list = create("ul", "resume-list");
    for (const entry of entries) {
      const item = create("li");
      if (entry.period) item.append(create("span", "meta", entry.period));
      item.append(create("strong", "", entry.title));
      if (entry.detail) item.append(create("span", "meta", entry.detail));
      list.append(item);
    }
    group.append(create("h3", "", label), list);
    resume.append(group);
  }

  const contact = byId("contact-info");
  const { email, github, blog } = portfolio.contact;
  for (const [label, href] of [[email, email && "mailto:" + email], ["GitHub", github], ["블로그", blog]]) {
    if (!href) continue;
    const link = create("a", "author-email", label);
    link.href = href;
    contact.append(link);
  }
  if (!contact.children.length) contact.append(create("p", "meta", "연락처는 준비 중입니다."));

  function makeCard(project) {
    const article = create("article", "card");
    const link = create("a", "card-link");
    link.href = "article.html?project=" + encodeURIComponent(project.slug);
    const cover = create("span", "cover");
    const image = create("img");
    image.src = project.image;
    image.alt = project.alt;
    image.width = 1080;
    image.height = 650;
    image.loading = "lazy";
    cover.append(image);
    const title = create("h3", "card-title", project.title);
    title.id = "project-" + project.slug;
    link.setAttribute("aria-labelledby", title.id);
    const category = project.category + (project.sample ? " · 예시" : "");
    link.append(cover, create("span", "card-category", category), title, create("p", "card-summary", project.summary));
    article.append(link);
    return article;
  }

  const filters = byId("filters");
  const cards = byId("cards");
  const categories = [...new Set(portfolio.projects.map((project) => project.category))];
  function renderCategory(selected) {
    const visible = selected === null ? portfolio.projects : portfolio.projects.filter((project) => project.category === selected);
    cards.replaceChildren(...visible.map(makeCard));
    byId("count").textContent = "(" + String(visible.length).padStart(2, "0") + ")";
    byId("filter-status").textContent = (selected ?? "전체 프로젝트") + " " + visible.length + "개";
    if (!visible.length) cards.append(create("p", "meta", "프로젝트를 준비 중입니다."));
    for (const button of filters.children) {
      button.setAttribute("aria-pressed", String((button.dataset.category ?? null) === selected));
    }
  }
  if (categories.length > 1) {
    for (const category of [null, ...categories]) {
      const button = create("button", "", category ?? "전체");
      button.type = "button";
      if (category !== null) button.dataset.category = category;
      button.addEventListener("click", () => renderCategory(category));
      filters.append(button);
    }
  }
  renderCategory(null);
})();
