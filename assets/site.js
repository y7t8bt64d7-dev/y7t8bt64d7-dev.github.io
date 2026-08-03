(() => {
  const navButton = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".site-nav");

  if (navButton && nav) {
    navButton.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      navButton.setAttribute("aria-expanded", String(open));
    });

    nav.addEventListener("click", () => {
      nav.classList.remove("is-open");
      navButton.setAttribute("aria-expanded", "false");
    });
  }

  const dialog = document.querySelector("[data-search-dialog]");
  if (!dialog) return;

  const input = dialog.querySelector("[data-search-input]");
  const results = dialog.querySelector("[data-search-results]");
  const status = dialog.querySelector("[data-search-status]");
  let articles = [];

  const escapeHtml = (value) => String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

  const render = () => {
    const query = input.value.trim().toLocaleLowerCase("zh-CN");
    const matches = articles.filter((article) => {
      if (!query) return true;
      const haystack = [article.title, article.summary, article.text, ...article.categories]
        .join(" ")
        .toLocaleLowerCase("zh-CN");
      return haystack.includes(query);
    });

    status.textContent = query
      ? `找到 ${matches.length} 篇相关文章`
      : `共 ${matches.length} 篇文章`;

    results.innerHTML = matches.length
      ? matches.slice(0, 48).map((article) => `
          <a class="search-result" href="${escapeHtml(article.url)}">
            <strong>${escapeHtml(article.title)}</strong>
            <span>${escapeHtml(article.date)} · ${escapeHtml(article.categories.join("、") || "未分类")}</span>
          </a>`).join("")
      : '<p class="search-empty">没有找到匹配的文章，试试更短的关键词。</p>';
  };

  const loadIndex = async () => {
    if (articles.length) return;
    status.textContent = "正在读取文章目录…";
    try {
      const response = await fetch("/search-index.json");
      if (!response.ok) throw new Error("search index unavailable");
      articles = await response.json();
      render();
    } catch {
      status.textContent = "文章目录暂时无法读取，请刷新页面后重试。";
    }
  };

  document.querySelectorAll("[data-search-open]").forEach((button) => {
    button.addEventListener("click", async () => {
      dialog.showModal();
      await loadIndex();
      input.focus();
    });
  });

  dialog.querySelector("[data-search-close]").addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
  input.addEventListener("input", render);
})();
