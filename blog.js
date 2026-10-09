(() => {
  const api = window.AKACH_ADMIN;
  const client = api?.client;
  const access = document.querySelector("#blog-access");
  const accessStatus = document.querySelector("#blog-access-status");
  const workspace = document.querySelector("#blog-workspace");
  const editor = document.querySelector("#blog-editor");
  const postForm = document.querySelector("#blog-post-form");
  const postStatus = document.querySelector("#blog-post-status");
  const postSubmit = document.querySelector("#blog-post-submit");
  const entryPreview = document.querySelector("#blog-entry-preview");
  const loadStatus = document.querySelector("#blog-load-status");
  const timeline = document.querySelector("#blog-timeline");
  const archive = document.querySelector("#blog-archive");
  const archiveNav = document.querySelector("#blog-archive-nav");
  const exportToggle = document.querySelector("#blog-export-toggle");
  const exportPanel = document.querySelector("#blog-export-panel");
  const exportTree = document.querySelector("#blog-export-tree");
  const exportCount = document.querySelector("#blog-export-count");
  const exportDownload = document.querySelector("#blog-export-download");
  const layout = document.querySelector("#blog-layout");
  const resizer = document.querySelector("#blog-resizer");
  let session = null;
  let isAdmin = false;
  let loadedUserId = null;
  let posts = [];
  let commentsByPost = new Map();
  let expandedComments = new Set();
  let openCommentForms = new Set();
  let selectedExportDates = new Set();

  const chinaTimeZones = new Set(["Asia/Shanghai", "Asia/Chongqing", "Asia/Harbin", "Asia/Kashgar", "Asia/Urumqi"]);
  archive.open = !window.matchMedia("(max-width: 760px)").matches;

  const captureLocalTime = () => {
    const now = new Date();
    const pad = value => String(value).padStart(2, "0");
    return {
      entry_date: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`,
      entry_time: `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`,
      timezone_name: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
      timezone_offset_minutes: -now.getTimezoneOffset()
    };
  };

  const offsetLabel = minutes => {
    const value = Number(minutes) || 0;
    const sign = value < 0 ? "-" : "+";
    const absolute = Math.abs(value);
    const hours = Math.floor(absolute / 60);
    const remaining = absolute % 60;
    return `GMT${sign}${hours}${remaining ? `:${String(remaining).padStart(2, "0")}` : ""}`;
  };

  const localTimeLabel = post => {
    if (!post.entry_time) return "";
    const time = String(post.entry_time).slice(0, 5);
    return post.timezone_name && !chinaTimeZones.has(post.timezone_name)
      ? `${time} ${offsetLabel(post.timezone_offset_minutes)}`
      : time;
  };

  const entryDate = value => {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day, 12);
  };
  const dateLabel = (value, options = { year: "numeric", month: "long", day: "numeric" }) =>
    new Intl.DateTimeFormat("en", options).format(entryDate(value));
  const commentTime = value => new Intl.DateTimeFormat("en", {
    timeZone: "Asia/Shanghai", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", hourCycle: "h23"
  }).format(new Date(value));
  const element = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };
  const updateEntryPreview = () => {
    const now = captureLocalTime();
    const zone = chinaTimeZones.has(now.timezone_name) ? "" : ` ${offsetLabel(now.timezone_offset_minutes)}`;
    entryPreview.textContent = `${dateLabel(now.entry_date)} · ${now.entry_time.slice(0, 5)}${zone}`;
  };

  const setAccess = signedIn => {
    access.hidden = signedIn;
    workspace.hidden = !signedIn;
    exportToggle.hidden = !signedIn;
    if (!signedIn) {
      editor.hidden = true;
      exportPanel.hidden = true;
      exportToggle.setAttribute("aria-expanded", "false");
      timeline.replaceChildren();
      archiveNav.replaceChildren();
      exportTree.replaceChildren();
      posts = [];
      commentsByPost = new Map();
      expandedComments.clear();
      openCommentForms.clear();
      selectedExportDates.clear();
      loadedUserId = null;
    }
  };

  const dateGroups = () => {
    const groups = new Map();
    for (const post of posts) {
      const [year, month] = post.entry_date.split("-");
      if (!groups.has(year)) groups.set(year, new Map());
      const months = groups.get(year);
      if (!months.has(month)) months.set(month, new Set());
      months.get(month).add(post.entry_date);
    }
    return groups;
  };

  const renderArchive = () => {
    archiveNav.replaceChildren();
    if (!posts.length) {
      archiveNav.append(element("p", "blog-empty", "No dates yet."));
      return;
    }
    for (const [year, months] of dateGroups()) {
      const yearNode = element("details", "blog-archive-year");
      yearNode.open = year === posts[0].entry_date.slice(0, 4);
      yearNode.append(element("summary", "", year));
      const monthList = element("div", "blog-archive-months");
      for (const [month, dates] of months) {
        const monthNode = element("details", "blog-archive-month");
        monthNode.open = yearNode.open && month === posts[0].entry_date.slice(5, 7);
        monthNode.append(element("summary", "", dateLabel(`${year}-${month}-01`, { month: "long" })));
        const dayList = element("div", "blog-archive-dates");
        [...dates].sort().reverse().forEach(value => {
          const link = element("a", "", dateLabel(value, { day: "numeric" }));
          link.href = `#date-${value}`;
          link.dataset.date = value;
          dayList.append(link);
        });
        monthNode.append(dayList);
        monthList.append(monthNode);
      }
      yearNode.append(monthList);
      archiveNav.append(yearNode);
    }
  };

  const renderComments = (post, card) => {
    const section = element("section", "blog-comments");
    section.setAttribute("aria-label", "Comments");
    const comments = commentsByPost.get(post.id) || [];
    const controls = element("div", "blog-comments-controls");
    const toggle = element("button", "blog-comments-toggle", `COMMENTS (${comments.length})`);
    toggle.type = "button";
    toggle.dataset.toggleComments = post.id;
    toggle.setAttribute("aria-expanded", String(expandedComments.has(post.id)));
    toggle.setAttribute("aria-controls", `blog-comments-${post.id}`);
    const openForm = element("button", "blog-comment-open", openCommentForms.has(post.id) ? "CANCEL" : "COMMENT");
    openForm.type = "button";
    openForm.dataset.toggleCommentForm = post.id;
    openForm.setAttribute("aria-expanded", String(openCommentForms.has(post.id)));
    openForm.setAttribute("aria-controls", `blog-comment-form-${post.id}`);
    controls.append(toggle, openForm);
    section.append(controls);

    const commentList = element("ul", "blog-comment-list");
    commentList.id = `blog-comments-${post.id}`;
    commentList.hidden = !expandedComments.has(post.id);
    if (!comments.length) commentList.append(element("li", "blog-empty", "No comments yet."));
    for (const comment of comments) {
      const row = element("li", "blog-comment");
      const content = element("div");
      content.append(element("p", "blog-comment-body", comment.body));
      const time = element("time", "", commentTime(comment.created_at));
      time.dateTime = comment.created_at;
      content.append(time);
      row.append(content);
      if (isAdmin) {
        const remove = element("button", "blog-comment-delete", "Delete");
        remove.type = "button";
        remove.dataset.deleteComment = comment.id;
        row.append(remove);
      }
      commentList.append(row);
    }
    section.append(commentList);

    const form = element("form", "blog-comment-form");
    form.id = `blog-comment-form-${post.id}`;
    form.hidden = !openCommentForms.has(post.id);
    form.dataset.commentPost = post.id;
    const input = element("textarea");
    input.name = "body";
    input.rows = 2;
    input.maxLength = 4000;
    input.required = true;
    input.setAttribute("aria-label", "Write a comment");
    input.placeholder = "Write a comment…";
    const submit = element("button", "blog-button", "Comment");
    submit.type = "submit";
    const output = element("output");
    output.setAttribute("aria-live", "polite");
    form.append(input, submit, output);
    section.append(form);
    card.append(section);
  };

  const renderTimeline = () => {
    timeline.replaceChildren();
    if (!posts.length) {
      timeline.append(element("p", "blog-empty", isAdmin ? "Your first post will appear here." : "There are no posts yet."));
      return;
    }
    const groups = new Map();
    for (const post of posts) {
      if (!groups.has(post.entry_date)) groups.set(post.entry_date, []);
      groups.get(post.entry_date).push(post);
    }
    for (const [date, dayPosts] of groups) {
      const day = element("section", "blog-day");
      day.id = `date-${date}`;
      day.setAttribute("aria-labelledby", `heading-${date}`);
      const heading = element("header", "blog-day-heading");
      const headingText = element("h2", "", dateLabel(date));
      headingText.id = `heading-${date}`;
      heading.append(headingText, element("span", "blog-day-count", String(dayPosts.length)));
      day.append(heading);
      for (const post of dayPosts) {
        const card = element("article", "blog-entry");
        const cardHeader = element("header", "blog-entry-header");
        const titleBlock = element("div");
        titleBlock.append(element("h3", "blog-entry-title", post.title));
        const timeText = [dateLabel(post.entry_date), localTimeLabel(post)].filter(Boolean).join(" · ");
        const time = element("time", "blog-entry-date", timeText);
        time.dateTime = post.entry_time ? `${post.entry_date}T${String(post.entry_time).slice(0, 8)}` : post.entry_date;
        titleBlock.append(time);
        cardHeader.append(titleBlock);
        if (isAdmin) {
          const actions = element("div", "blog-card-actions");
          const remove = element("button", "", "Delete");
          remove.type = "button";
          remove.dataset.deletePost = post.id;
          actions.append(remove);
          cardHeader.append(actions);
        }
        card.append(cardHeader, element("p", "blog-entry-body", post.body));
        renderComments(post, card);
        day.append(card);
      }
      timeline.append(day);
    }
    watchDates();
    const target = window.location.hash && document.getElementById(window.location.hash.slice(1));
    if (target) requestAnimationFrame(() => target.scrollIntoView());
  };

  let observer;
  const watchDates = () => {
    observer?.disconnect();
    if (!("IntersectionObserver" in window)) return;
    observer = new IntersectionObserver(entries => {
      const visible = entries.filter(item => item.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
      if (!visible) return;
      const date = visible.target.id.slice(5);
      archiveNav.querySelectorAll("a[data-date]").forEach(link => {
        const current = link.dataset.date === date;
        link.classList.toggle("is-current", current);
        if (current) {
          link.setAttribute("aria-current", "location");
          link.closest(".blog-archive-month").open = true;
          link.closest(".blog-archive-year").open = true;
        } else link.removeAttribute("aria-current");
      });
    }, { rootMargin: "-15% 0px -70% 0px" });
    timeline.querySelectorAll(".blog-day").forEach(day => observer.observe(day));
  };

  const renderExportTree = () => {
    exportTree.replaceChildren();
    for (const [year, months] of dateGroups()) {
      const yearBox = element("fieldset", "blog-export-year");
      const yearLabel = element("label", "blog-export-choice");
      const yearInput = document.createElement("input");
      yearInput.type = "checkbox";
      yearInput.dataset.exportYear = year;
      const yearText = element("span", "", year);
      yearLabel.append(yearInput, yearText);
      yearBox.append(yearLabel);
      for (const [month, dates] of months) {
        const monthBox = element("fieldset", "blog-export-month");
        const monthLabel = element("label", "blog-export-choice");
        const monthInput = document.createElement("input");
        monthInput.type = "checkbox";
        monthInput.dataset.exportMonth = `${year}-${month}`;
        monthLabel.append(monthInput, element("span", "", dateLabel(`${year}-${month}-01`, { month: "long" })));
        monthBox.append(monthLabel);
        const days = element("div", "blog-export-days");
        [...dates].sort().reverse().forEach(date => {
          const label = element("label", "blog-export-choice blog-export-day");
          const input = document.createElement("input");
          input.type = "checkbox";
          input.value = date;
          input.dataset.exportDate = date;
          input.checked = selectedExportDates.has(date);
          label.append(input, element("span", "", dateLabel(date, { day: "numeric" })));
          days.append(label);
        });
        monthBox.append(days);
        yearBox.append(monthBox);
      }
      exportTree.append(yearBox);
    }
    syncExportTree();
  };

  const syncExportTree = () => {
    exportTree.querySelectorAll("input[data-export-date]").forEach(input => { input.checked = selectedExportDates.has(input.value); });
    exportTree.querySelectorAll("input[data-export-month]").forEach(input => {
      const dates = [...exportTree.querySelectorAll(`input[data-export-date^="${input.dataset.exportMonth}-"]`)];
      const count = dates.filter(item => item.checked).length;
      input.checked = dates.length > 0 && count === dates.length;
      input.indeterminate = count > 0 && count < dates.length;
    });
    exportTree.querySelectorAll("input[data-export-year]").forEach(input => {
      const dates = [...input.closest("fieldset").querySelectorAll("input[data-export-date]")];
      const count = dates.filter(item => item.checked).length;
      input.checked = dates.length > 0 && count === dates.length;
      input.indeterminate = count > 0 && count < dates.length;
    });
    const count = posts.filter(post => selectedExportDates.has(post.entry_date)).length;
    exportCount.textContent = count ? `${count} post${count === 1 ? "" : "s"} selected.` : "Select one or more dates.";
    exportDownload.disabled = count === 0;
  };

  const exportMarkdown = () => {
    const selected = posts.filter(post => selectedExportDates.has(post.entry_date));
    const markdown = selected.map(post => {
      const dateTime = [post.entry_date, localTimeLabel(post)].filter(Boolean).join(" ");
      const comments = commentsByPost.get(post.id) || [];
      const commentText = comments.length
        ? `\n\n### Comments (${comments.length})\n\n${comments.map(comment => `- ${comment.body.replace(/\n/g, "\n  ")} _(${new Date(comment.created_at).toISOString()})_`).join("\n")}`
        : "\n\n### Comments (0)";
      return `## ${post.title}\n\n**${dateTime}**\n\n${post.body}${commentText}`;
    }).join("\n\n---\n\n");
    const blob = new Blob([`# Blog export\n\n${markdown}\n`], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = element("a");
    link.href = url;
    link.download = "blog-export.md";
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  };

  const loadBlog = async () => {
    loadStatus.textContent = "Loading posts…";
    const { data: postRows, error: postError } = await client.from("blog_posts")
      .select("id,title,body,entry_date,entry_time,timezone_name,timezone_offset_minutes,created_at,created_by")
      .order("entry_date", { ascending: false }).order("created_at", { ascending: false });
    if (postError) throw postError;
    posts = postRows || [];
    commentsByPost = new Map();
    if (posts.length) {
      const { data: commentRows, error: commentError } = await client.from("blog_comments")
        .select("id,post_id,body,created_at,created_by").in("post_id", posts.map(post => post.id)).order("created_at", { ascending: true });
      if (commentError) throw commentError;
      for (const comment of commentRows || []) {
        if (!commentsByPost.has(comment.post_id)) commentsByPost.set(comment.post_id, []);
        commentsByPost.get(comment.post_id).push(comment);
      }
    }
    renderArchive();
    renderTimeline();
    renderExportTree();
    loadStatus.textContent = "";
  };

  const refreshBlog = async () => {
    try { await loadBlog(); }
    catch (error) {
      loadStatus.textContent = "Could not load the Blog. Check the database setup and try again.";
      console.error("Blog load failed", error);
    }
  };

  const updateAdminView = () => { editor.hidden = !isAdmin; renderTimeline(); };

  const resizeSidebar = clientX => {
    const bounds = layout.getBoundingClientRect();
    const styles = getComputedStyle(layout);
    const padding = parseFloat(styles.paddingLeft) + parseFloat(styles.paddingRight);
    const max = Math.min(480, Math.max(190, (bounds.width - padding) * 0.55));
    const width = Math.max(190, Math.min(max, clientX - bounds.left - parseFloat(styles.paddingLeft)));
    layout.style.setProperty("--blog-sidebar-width", `${width}px`);
    resizer.setAttribute("aria-valuenow", String(Math.round(width)));
  };

  document.querySelector("#blog-login").addEventListener("click", async () => {
    if (!client) { accessStatus.textContent = "Google sign-in is not available right now."; return; }
    accessStatus.textContent = "";
    const redirectTo = new URL(window.location.pathname, window.location.origin).href;
    const { error } = await client.auth.signInWithOAuth({ provider: "google", options: { redirectTo } });
    if (error) accessStatus.textContent = error.message;
  });

  postForm.addEventListener("submit", async event => {
    event.preventDefault();
    if (!isAdmin || !session) return;
    const values = new FormData(postForm);
    const title = String(values.get("title") || "").trim();
    const body = String(values.get("body") || "").trim();
    if (!title || !body) { postStatus.textContent = "Title and text are required."; return; }
    postSubmit.disabled = true;
    postStatus.textContent = "Publishing…";
    const { error } = await client.from("blog_posts").insert({ title, body, ...captureLocalTime() });
    postSubmit.disabled = false;
    if (error) { postStatus.textContent = error.message; return; }
    postForm.reset();
    updateEntryPreview();
    postStatus.textContent = "Published.";
    await refreshBlog();
  });

  postForm.addEventListener("reset", () => {
    postStatus.textContent = "";
    setTimeout(updateEntryPreview, 0);
  });

  exportToggle.addEventListener("click", () => {
    exportPanel.hidden = !exportPanel.hidden;
    exportToggle.setAttribute("aria-expanded", String(!exportPanel.hidden));
  });
  exportTree.addEventListener("change", event => {
    const input = event.target;
    if (input.matches("[data-export-date]")) {
      if (input.checked) selectedExportDates.add(input.value); else selectedExportDates.delete(input.value);
    } else if (input.matches("[data-export-month]")) {
      const prefix = `${input.dataset.exportMonth}-`;
      exportTree.querySelectorAll("input[data-export-date]").forEach(dateInput => {
        if (dateInput.value.startsWith(prefix)) {
          if (input.checked) selectedExportDates.add(dateInput.value); else selectedExportDates.delete(dateInput.value);
        }
      });
    } else if (input.matches("[data-export-year]")) {
      input.closest("fieldset").querySelectorAll("input[data-export-date]").forEach(dateInput => {
        if (input.checked) selectedExportDates.add(dateInput.value); else selectedExportDates.delete(dateInput.value);
      });
    }
    syncExportTree();
  });
  exportDownload.addEventListener("click", exportMarkdown);

  resizer.addEventListener("pointerdown", event => {
    if (window.matchMedia("(max-width: 760px)").matches) return;
    resizer.setPointerCapture(event.pointerId);
    layout.classList.add("is-resizing");
    resizeSidebar(event.clientX);
  });
  resizer.addEventListener("pointermove", event => { if (resizer.hasPointerCapture(event.pointerId)) resizeSidebar(event.clientX); });
  const finishResize = event => {
    if (resizer.hasPointerCapture(event.pointerId)) resizer.releasePointerCapture(event.pointerId);
    layout.classList.remove("is-resizing");
  };
  resizer.addEventListener("pointerup", finishResize);
  resizer.addEventListener("pointercancel", finishResize);
  resizer.addEventListener("keydown", event => {
    const current = parseFloat(getComputedStyle(layout).getPropertyValue("--blog-sidebar-width")) || 250;
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      const amount = event.shiftKey ? 40 : 12;
      const width = current + (event.key === "ArrowRight" ? amount : -amount);
      layout.style.setProperty("--blog-sidebar-width", `${Math.max(190, Math.min(480, width))}px`);
      resizer.setAttribute("aria-valuenow", String(Math.round(Math.max(190, Math.min(480, width)))));
    } else if (event.key === "Home" || event.key === "End") {
      const width = event.key === "Home" ? 190 : 480;
      layout.style.setProperty("--blog-sidebar-width", `${width}px`);
      resizer.setAttribute("aria-valuenow", String(width));
    }
  });

  document.addEventListener("click", async event => {
    const link = event.target.closest("a[data-date]");
    if (link && window.matchMedia("(max-width: 760px)").matches) archive.open = false;
    const commentsButton = event.target.closest("[data-toggle-comments]");
    if (commentsButton) {
      const id = commentsButton.dataset.toggleComments;
      if (expandedComments.has(id)) expandedComments.delete(id); else expandedComments.add(id);
      renderTimeline();
      return;
    }
    const commentFormButton = event.target.closest("[data-toggle-comment-form]");
    if (commentFormButton) {
      const id = commentFormButton.dataset.toggleCommentForm;
      if (openCommentForms.has(id)) openCommentForms.delete(id); else openCommentForms.add(id);
      renderTimeline();
      if (openCommentForms.has(id)) document.querySelector(`#blog-comment-form-${CSS.escape(id)} textarea`)?.focus();
      return;
    }
    const deletePost = event.target.closest("[data-delete-post]");
    if (deletePost && isAdmin && window.confirm("Delete this post and its comments?")) {
      const { error } = await client.from("blog_posts").delete().eq("id", deletePost.dataset.deletePost);
      if (error) loadStatus.textContent = error.message; else await refreshBlog();
    }
    const deleteComment = event.target.closest("[data-delete-comment]");
    if (deleteComment && isAdmin && window.confirm("Delete this comment?")) {
      const { error } = await client.from("blog_comments").delete().eq("id", deleteComment.dataset.deleteComment);
      if (error) loadStatus.textContent = error.message; else await refreshBlog();
    }
  });

  document.addEventListener("submit", async event => {
    const form = event.target.closest("[data-comment-post]");
    if (!form) return;
    event.preventDefault();
    if (!session) return;
    const body = String(new FormData(form).get("body") || "").trim();
    const output = form.querySelector("output");
    const button = form.querySelector("button[type=submit]");
    if (!body) { output.textContent = "Write a comment before submitting."; return; }
    button.disabled = true;
    const postId = form.dataset.commentPost;
    const { error } = await client.from("blog_comments").insert({ post_id: postId, body });
    button.disabled = false;
    if (error) { output.textContent = error.message; return; }
    expandedComments.add(postId);
    openCommentForms.delete(postId);
    await refreshBlog();
  });

  if (!client) accessStatus.textContent = "Google sign-in is not available right now.";
  else {
    window.addEventListener("adminchange", event => {
      session = event.detail.session;
      isAdmin = event.detail.authorized;
      const userId = session?.user?.id || null;
      setAccess(!!userId);
      if (!userId) return;
      editor.hidden = !isAdmin;
      if (userId !== loadedUserId) { loadedUserId = userId; refreshBlog(); }
      else updateAdminView();
    });
    const current = api.state();
    if (current.session) {
      session = current.session;
      isAdmin = current.authorized;
      setAccess(true);
      editor.hidden = !isAdmin;
      loadedUserId = session.user.id;
      refreshBlog();
    }
  }
  updateEntryPreview();
})();
