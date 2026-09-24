const tg = window.Telegram?.WebApp;
if (tg) { tg.ready(); tg.expand(); }
const API_BASE = "https://tia-backend-gx6p.onrender.com";

async function checkBackend() {
  try {
    const response = await fetch(`${API_BASE}/health`);
    const data = await response.json();
    console.log("TIa Backend:", data);
  } catch (error) {
    console.error("TIa Backend error:", error);
  }
}

checkBackend();
const pageIds = ["home","servers","services","payments","esim","profile"];

function openSection(id){
  pageIds.forEach(p => document.getElementById(p)?.classList.toggle("active", p === id));
  document.querySelectorAll(".nav").forEach(n => n.classList.toggle("active", n.dataset.page === id));
  window.scrollTo({top:0, behavior:"smooth"});
}

function toast(msg){
  const el=document.getElementById("toast");
  el.textContent=msg; el.classList.add("show");
  clearTimeout(window.__toast); window.__toast=setTimeout(()=>el.classList.remove("show"),2800);
}

const serverMap = {
  nl:{name:"Нидерланды", scheme:"HAPP_OR_INCY_LINK_NL"},
  fi:{name:"Финляндия", scheme:"HAPP_OR_INCY_LINK_FI"},
  de:{name:"Германия", scheme:"HAPP_OR_INCY_LINK_DE"},
  sg:{name:"Сингапур", scheme:"HAPP_OR_INCY_LINK_SG"},
  us:{name:"США", scheme:"HAPP_OR_INCY_LINK_US"}
};

function connectServer(id){
  const s=serverMap[id];
  if(!s) return;
  /*
    PRODUCTION:
    1) Backend creates/returns a user-specific subscription/deep-link.
    2) For INCY use its documented deep-link format.
    3) For Happ use the corresponding deep-link/bridge flow.
    4) Do not put provider subscription URLs directly into frontend code.
  */
  toast(`Открываем подключение: ${s.name}. Сначала добавим реальные ссылки Happ/INCY.`);
}

function openTelegram(){
  const channel = "https://t.me/YOUR_TIA_CHANNEL";
  if (tg?.openTelegramLink) tg.openTelegramLink(channel);
  else window.open(channel,"_blank");
}

function initUser(){
  const u=tg?.initDataUnsafe?.user;
  if(!u) return;
  const name=[u.first_name,u.last_name].filter(Boolean).join(" ") || "Telegram user";
  document.getElementById("tg-name").textContent=name;
  document.getElementById("tg-username").textContent=u.username ? "@"+u.username : "Telegram account";
}
initUser();
async function loadVpnServers() {
  try {
    const response = await fetch(`${API_BASE}/api/vpn/servers`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    if (!data.ok || !Array.isArray(data.servers)) {
      throw new Error("Неверный ответ сервера");
    }

    console.log("VPN servers from Neon:", data.servers);

    const cards = document.querySelectorAll(".server-card");

    data.servers.forEach((server, index) => {
      const card = cards[index];

      if (!card) return;

      const name = card.querySelector(".server-main b");
      const description = card.querySelector(".server-main small");
      const tag = card.querySelector(".tag");

      if (name) {
        name.textContent = server.country_name;
      }

      if (description) {
        description.textContent = server.description || "VPN-сервер";
      }

      if (tag) {
        tag.textContent = server.purpose_tag || "VPN";
      }
    });

  } catch (error) {
    console.error("VPN servers connection error:", error);
  }
}

loadVpnServers();
