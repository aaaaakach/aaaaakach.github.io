(() => {
  const config = window.MAPS_SUPABASE || {};
  const client = config.url && config.anonKey && window.supabase?.createClient
    ? window.supabase.createClient(config.url, config.anonKey)
    : null;
  let session = null;
  let authorized = false;
  let editMode = false;

  const modal = document.createElement("dialog");
  modal.className = "identity-dialog";
  modal.innerHTML = `<form method="dialog"><button class="identity-close" value="cancel" aria-label="Close">×</button><p class="identity-intro">I'm</p><div class="identity-signed-out"><button type="button" data-login>Continue with Google</button></div><div class="identity-signed-in" hidden><p data-email></p><button type="button" data-edit></button><button type="button" data-logout>Log out</button></div><output aria-live="polite"></output></form>`;
  document.body.append(modal);
  const output = modal.querySelector("output");
  const greeting = modal.querySelector(".identity-intro");
  const signedOut = modal.querySelector(".identity-signed-out");
  const signedIn = modal.querySelector(".identity-signed-in");
  const editButton = modal.querySelector("[data-edit]");

  const publish = () => {
    const email = session?.user?.email?.toLowerCase() || "";
    const adminGreeting = email === "yucai2027@gmail.com" || email === "akach66666@gmail.com";
    greeting.textContent = session ? `Hi, ${adminGreeting ? "yu" : email.split("@")[0]}!` : "I'm";
    document.querySelectorAll(".wordmark").forEach(mark => {
      mark.textContent = authorized ? "me" : "akach";
      mark.setAttribute("aria-label", `${authorized ? "me" : "akach"} personal page`);
    });
    document.body.classList.toggle("is-admin", authorized);
    document.body.classList.toggle("is-edit-mode", authorized && editMode);
    signedOut.hidden = !!session;
    signedIn.hidden = !session;
    modal.querySelector("[data-email]").textContent = session?.user?.email || "";
    editButton.hidden = !authorized;
    editButton.textContent = editMode ? "Exit Edit Mode" : "Enter Edit Mode";
    window.dispatchEvent(new CustomEvent("adminchange", { detail: { client, session, authorized, editMode: authorized && editMode } }));
  };

  const verify = async nextSession => {
    session = nextSession;
    authorized = false;
    if (session && client) {
      const { data, error } = await client.rpc("is_map_admin");
      authorized = !error && data === true;
      if (!authorized) output.textContent = "This account has visitor access only.";
    }
    editMode = authorized && sessionStorage.getItem("akach-edit-mode") === "1";
    publish();
  };

  const open = event => {
    event?.preventDefault();
    output.textContent = client ? "" : "Add your Supabase URL and anon key to enable sign-in.";
    if (!modal.open) modal.showModal();
  };
  document.querySelectorAll(".wordmark").forEach(mark => {
    mark.href = document.body.classList.contains("maps-page") ? "../personal.html" : "personal.html";
    mark.addEventListener("contextmenu", open);
    let timer;
    let suppressClick = false;
    mark.addEventListener("pointerdown", event => {
      if (event.pointerType === "mouse") return;
      timer = setTimeout(() => { suppressClick = true; open(event); }, 650);
    });
    ["pointerup", "pointercancel", "pointermove"].forEach(type => mark.addEventListener(type, () => clearTimeout(timer)));
    mark.addEventListener("click", event => {
      if (!suppressClick) return;
      event.preventDefault();
      suppressClick = false;
    });
  });
  modal.querySelector("[data-login]").addEventListener("click", async () => {
    if (!client) return open();
    const { error } = await client.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/` }
    });
    if (error) output.textContent = error.message;
  });
  editButton.addEventListener("click", () => {
    editMode = !editMode;
    sessionStorage.setItem("akach-edit-mode", editMode ? "1" : "0");
    publish();
  });
  modal.querySelector("[data-logout]").addEventListener("click", async () => {
    sessionStorage.removeItem("akach-edit-mode");
    await client?.auth.signOut();
    modal.close();
  });

  window.AKACH_ADMIN = { client, open, state: () => ({ session, authorized, editMode: authorized && editMode }) };
  if (client) {
    client.auth.getSession().then(({ data }) => verify(data.session));
    client.auth.onAuthStateChange((_event, nextSession) => setTimeout(() => verify(nextSession), 0));
  } else publish();
})();
