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
  const loadStatus = document.querySelector("#blog-load-status");
  const timeline = document.querySelector("#blog-timeline");
  const archive = document.querySelector("#blog-archive");
  const archiveNav = document.querySelector("#blog-archive-nav");
  let session = null;
  let isAdmin = false;
  let editingId = null;
  let loadedUserId = null;
  let posts = [];
  let commentsByPost = new Map();

  archive.open = !window.matchMedia("(max-width: 760px)").matches;

  const setLocalDate = input => {
    const now = new Date();
    input.value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  };

  const entryDate = value => {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day, 12);
  };

  const dateLabel = (value, options = { year: "numeric", month: "long", day: "numeric" }) =>
    new Intl.DateTimeFormat("en", options).format(entryDate(value));

  const commentTime = value => new Intl.DateTimeFormat("en", {
    timeZone: "Asia/Shanghai", month: "short", day: "numeric", hour: "numeric", minute: "2-digit"
  }).format(new Date(value));

  const element = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };

  const setAccess = signedIn => {
    access.hidden = signedIn;
    workspace.hidden = !signedIn;
    if (!signedIn) {
      editor.hidden = true;
      timeline.replaceChildren();
      archiveNav.replaceChildren();
      posts = [];
      commentsByPost = new Map();
      loadedUserId = null;
    }
  };

  const renderArchive = () => {
    archiveNav.replaceChildren();
    if (!posts.length) {
      archiveNav.append(element("p", "blog-empty", "No dates yet."));
      return;
    }

    const years = new Map();
    for (const post of posts) {
      const [year, month, day] = post.entry_date.split("-");
      if (!years.has(year)) years.set(year, new Map());
      const months = years.get(year);
      if (!months.has(month)) months.set(month, new Set());
      months.get(month).add(day);
    }

    [...years.entries()].forEach(([year, months], yearIndex) => {
      const yearNode = element("details", "blog-archive-year");
      yearNode.open = yearIndex === 0;
      yearNode.append(element("summary", "", year));
      const monthList = element("div", "blog-archive-months");
      [...months.entries()].forEach(([month, days], monthIndex) => {
        const monthNode = element("details", "blog-archive-month");
        monthNode.open = yearIndex === 0 && monthIndex === 0;
        const monthDate = `${year}-${month}-01`;
        monthNode.append(element("summary", "", dateLabel(monthDate, { month: "long" })));
        const dayList = element("div", "blog-archive-dates");
        [...days].sort().reverse().forEach(day => {
          const value = `${year}-${month}-${day}`;
          const link = element("a", "", dateLabel(value, { day: "numeric" }));
          link.href = `#date-${value}`;
          link.dataset.date = value;
          dayList.append(link);
        });
        monthNode.append(dayList);
        monthList.append(monthNode);
      });
      yearNode.append(monthList);
      archiveNav.append(yearNode);
    });
  };

  const renderComments = (post, list) => {
    const section = element("section", "blog-comments");
    section.setAttribute("aria-label", "Comments");
    const comments = commentsByPost.get(post.id) || [];
    section.append(element("h3", "", `Comments (${comments.length})`));
    const commentList = element("ul", "blog-comment-list");

    if (!comments.length) commentList.append(element("li", "blog-empty", "No comments yet."));
    for (const comment of comments) {
      const row = element("li", "blog-comment");
      const content = element("div");
      const body = element("p", "blog-comment-body", comment.body);
      const time = element("time", "", commentTime(comment.created_at));
      time.dateTime = comment.created_at;
      content.append(body, time);
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
    form.append(input, submit, element("output"));
    section.append(form);
    list.append(section);
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
        const time = element("time", "blog-entry-date", dateLabel(post.entry_date));
        time.dateTime = post.entry_date;
        titleBlock.append(time);
        cardHeader.append(titleBlock);
        if (isAdmin) {
          const actions = element("div", "blog-card-actions");
          const edit = element("button", "", "Edit");
          edit.type = "button";
          edit.dataset.editPost = post.id;
          const remove = element("button", "", "Delete");
          remove.type = "button";
          remove.dataset.deletePost = post.id;
          actions.append(edit, remove);
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

  const loadBlog = async () => {
    loadStatus.textContent = "Loading posts…";
    const { data: postRows, error: postError } = await client
      .from("blog_posts")
      .select("id,title,body,entry_date,created_at,updated_at,created_by")
      .order("entry_date", { ascending: false })
      .order("created_at", { ascending: false });
    if (postError) throw postError;
    posts = postRows || [];
    commentsByPost = new Map();
    if (posts.length) {
      const { data: commentRows, error: commentError } = await client
        .from("blog_comments")
        .select("id,post_id,body,created_at,created_by")
        .in("post_id", posts.map(post => post.id))
        .order("created_at", { ascending: true });
      if (commentError) throw commentError;
      for (const comment of commentRows || []) {
        if (!commentsByPost.has(comment.post_id)) commentsByPost.set(comment.post_id, []);
        commentsByPost.get(comment.post_id).push(comment);
      }
    }
    renderArchive();
    renderTimeline();
    loadStatus.textContent = "";
  };

  const refreshBlog = async () => {
    try {
      await loadBlog();
    } catch (error) {
      loadStatus.textContent = "Could not load the Blog. Check the database setup and try again.";
      console.error("Blog load failed", error);
    }
  };

  const updateAdminView = () => {
    editor.hidden = !isAdmin;
    renderTimeline();
  };

  document.querySelector("#blog-login").addEventListener("click", async () => {
    if (!client) {
      accessStatus.textContent = "Google sign-in is not available right now.";
      return;
    }
    accessStatus.textContent = "";
    const redirectTo = new URL(window.location.pathname, window.location.origin).href;
    const { error } = await client.auth.signInWithOAuth({ provider: "google", options: { redirectTo } });
    if (error) accessStatus.textContent = error.message;
  });

  postForm.addEventListener("submit", async event => {
    event.preventDefault();
    if (!isAdmin || !session) return;
    const values = new FormData(postForm);
    const payload = {
      title: String(values.get("title")).trim(),
      body: String(values.get("body")).trim(),
      entry_date: values.get("entry_date"),
      updated_at: new Date().toISOString()
    };
    if (!payload.title || !payload.body || !payload.entry_date) {
      postStatus.textContent = "Title, text, and date are required.";
      return;
    }
    postSubmit.disabled = true;
    postStatus.textContent = editingId ? "Saving changes…" : "Publishing…";
    const query = editingId
      ? client.from("blog_posts").update(payload).eq("id", editingId)
      : client.from("blog_posts").insert(payload);
    const { error } = await query;
    postSubmit.disabled = false;
    if (error) {
      postStatus.textContent = error.message;
      return;
    }
    editingId = null;
    postForm.reset();
    setLocalDate(postForm.elements.entry_date);
    postSubmit.textContent = "Publish";
    document.querySelector("#blog-editor-title").textContent = "Write a post";
    postStatus.textContent = "Published.";
    await refreshBlog();
  });

  postForm.addEventListener("reset", () => {
    editingId = null;
    postSubmit.textContent = "Publish";
    document.querySelector("#blog-editor-title").textContent = "Write a post";
    postStatus.textContent = "";
    setTimeout(() => setLocalDate(postForm.elements.entry_date), 0);
  });

  document.addEventListener("click", async event => {
    const link = event.target.closest("a[data-date]");
    if (link && window.matchMedia("(max-width: 760px)").matches) archive.open = false;

    const editButton = event.target.closest("[data-edit-post]");
    if (editButton && isAdmin) {
      const post = posts.find(item => item.id === editButton.dataset.editPost);
      if (!post) return;
      editingId = post.id;
      postForm.elements.title.value = post.title;
      postForm.elements.entry_date.value = post.entry_date;
      postForm.elements.body.value = post.body;
      postSubmit.textContent = "Save changes";
      document.querySelector("#blog-editor-title").textContent = "Edit post";
      postStatus.textContent = "";
      editor.scrollIntoView({ behavior: "smooth", block: "start" });
      postForm.elements.title.focus();
    }

    const deletePost = event.target.closest("[data-delete-post]");
    if (deletePost && isAdmin && window.confirm("Delete this post and its comments?")) {
      const { error } = await client.from("blog_posts").delete().eq("id", deletePost.dataset.deletePost);
      if (error) loadStatus.textContent = error.message;
      else await refreshBlog();
    }

    const deleteComment = event.target.closest("[data-delete-comment]");
    if (deleteComment && isAdmin && window.confirm("Delete this comment?")) {
      const { error } = await client.from("blog_comments").delete().eq("id", deleteComment.dataset.deleteComment);
      if (error) loadStatus.textContent = error.message;
      else await refreshBlog();
    }
  });

  document.addEventListener("submit", async event => {
    const form = event.target.closest("[data-comment-post]");
    if (!form) return;
    event.preventDefault();
    if (!session) return;
    const body = String(new FormData(form).get("body")).trim();
    const output = form.querySelector("output");
    const button = form.querySelector("button[type=submit]");
    if (!body) {
      output.textContent = "Write a comment before submitting.";
      return;
    }
    button.disabled = true;
    const { error } = await client.from("blog_comments").insert({ post_id: form.dataset.commentPost, body });
    button.disabled = false;
    if (error) {
      output.textContent = error.message;
      return;
    }
    await refreshBlog();
  });

  if (!client) {
    accessStatus.textContent = "Google sign-in is not available right now.";
  } else {
    window.addEventListener("adminchange", event => {
      session = event.detail.session;
      isAdmin = event.detail.authorized;
      const userId = session?.user?.id || null;
      setAccess(!!userId);
      if (!userId) return;
      editor.hidden = !isAdmin;
      if (userId !== loadedUserId) {
        loadedUserId = userId;
        refreshBlog();
      } else updateAdminView();
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

  setLocalDate(postForm.elements.entry_date);
})();
