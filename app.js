const tg = window.Telegram?.WebApp;

if (tg) {
  tg.ready();
  tg.expand();
}


/* =========================
   BACKEND
========================= */

const API_BASE = "https://tia-backend-gx6p.onrender.com";


/* =========================
   BACKEND HEALTH CHECK
========================= */

async function checkBackend() {
  try {
    const response = await fetch(
      `${API_BASE}/health?ts=${Date.now()}`,
      {
        cache: "no-store"
      }
    );

    const data = await response.json();

    console.log("TIa Backend:", data);

  } catch (error) {

    console.error(
      "TIa Backend error:",
      error
    );

  }
}

checkBackend();


/* =========================
   PAGES
========================= */

const pageIds = [
  "home",
  "servers",
  "services",
  "payments",
  "esim",
  "profile"
];


function openSection(id) {

  pageIds.forEach(
    function (page) {

      const element =
        document.getElementById(page);

      if (element) {

        element.classList.toggle(
          "active",
          page === id
        );

      }

    }
  );


  document
    .querySelectorAll(".nav")
    .forEach(
      function (nav) {

        nav.classList.toggle(
          "active",
          nav.dataset.page === id
        );

      }
    );


  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

}


/* =========================
   TOAST
========================= */

function toast(msg) {

  const el =
    document.getElementById("toast");

  if (!el) {
    return;
  }

  el.textContent = msg;

  el.classList.add("show");

  clearTimeout(
    window.__toast
  );

  window.__toast =
    setTimeout(
      function () {

        el.classList.remove("show");

      },
      2800
    );

}


/* =========================
   VPN SERVERS
========================= */

const serverMap = {

  nl: {
    name: "Нидерланды",
    scheme: "HAPP_OR_INCY_LINK_NL"
  },

  fi: {
    name: "Финляндия",
    scheme: "HAPP_OR_INCY_LINK_FI"
  },

  de: {
    name: "Германия",
    scheme: "HAPP_OR_INCY_LINK_DE"
  },

  sg: {
    name: "Сингапур",
    scheme: "HAPP_OR_INCY_LINK_SG"
  },

  us: {
    name: "США",
    scheme: "HAPP_OR_INCY_LINK_US"
  }

};


function connectServer(id) {

  const server =
    serverMap[id];

  if (!server) {
    return;
  }


  /*
    PRODUCTION:

    Здесь позже подключим реальный
    user-specific deep-link Happ/INCY.

    Секретные ссылки и ключи
    не должны храниться во frontend.
  */


  toast(
    `Открываем подключение: ${server.name}. Сначала добавим реальные ссылки Happ/INCY.`
  );

}


/* =========================
   TELEGRAM CHANNEL
========================= */

function openTelegram() {

  const channel =
    "https://t.me/YOUR_TIA_CHANNEL";


  if (tg?.openTelegramLink) {

    tg.openTelegramLink(
      channel
    );

  } else {

    window.open(
      channel,
      "_blank"
    );

  }

}


/* =========================
   TELEGRAM USER
========================= */

function initUser() {

  const user =
    tg?.initDataUnsafe?.user;


  if (!user) {
    return;
  }


  const name =
    [
      user.first_name,
      user.last_name
    ]
      .filter(Boolean)
      .join(" ")
      ||
      "Telegram user";


  const nameElement =
    document.getElementById(
      "tg-name"
    );


  const usernameElement =
    document.getElementById(
      "tg-username"
    );


  if (nameElement) {

    nameElement.textContent =
      name;

  }


  if (usernameElement) {

    usernameElement.textContent =
      user.username
        ? "@" + user.username
        : "Telegram account";

  }

}


initUser();


/* =========================
   LOAD VPN SERVERS
========================= */

async function loadVpnServers() {

  try {

    console.log(
      "TIa Connect: запрашиваем серверы..."
    );


    const response =
      await fetch(
        `${API_BASE}/api/vpn/servers?ts=${Date.now()}`,
        {
          method: "GET",
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache"
          }
        }
      );


    if (!response.ok) {

      throw new Error(
        `HTTP ${response.status}`
      );

    }


    const data =
      await response.json();


    console.log(
      "TIa Connect: ответ сервера:",
      data
    );


    if (
      !data ||
      data.ok !== true ||
      !Array.isArray(data.servers)
    ) {

      throw new Error(
        "Неверный формат ответа сервера"
      );

    }


    const cards =
      document.querySelectorAll(
        ".server-card"
      );


    console.log(
      "TIa Connect: найдено карточек:",
      cards.length
    );


    data.servers.forEach(
      function (server, index) {

        const card =
          cards[index];


        if (!card) {

          console.warn(
            `Карточка ${index + 1} не найдена`
          );

          return;

        }


        /*
          Название
        */

        const name =
          card.querySelector(
            ".server-main b"
          );


        if (name) {

          name.textContent =
            server.country_name;

        }


        /*
          Описание
        */

        const description =
          card.querySelector(
            ".server-main small"
          );


        if (description) {

          description.textContent =
            server.description ||
            "VPN-сервер";

        }


        /*
          Тег
        */

        const tag =
          card.querySelector(
            ".tag"
          );


        if (tag) {

          tag.textContent =
            server.purpose_tag ||
            "VPN";

        }


        /*
          Обновляем onclick
        */

        const serverId =
          String(
            server.country_code || ""
          ).toLowerCase();


        card.onclick =
          function () {

            connectServer(
              serverId
            );

          };


        console.log(
          "Обновлён сервер:",
          server.country_name
        );

      }
    );


    /*
      Обновляем рекомендуемый сервер
      на главной странице.
    */

    const recommended =
      data.servers[0];


    if (recommended) {

      const countryFlags = {

        NL: "🇳🇱",
        FI: "🇫🇮",
        DE: "🇩🇪",
        SG: "🇸🇬",
        US: "🇺🇸"

      };


      const flag =
        countryFlags[
          recommended.country_code
        ] || "🌍";


      const recommendedName =
        document.getElementById(
          "recommended-server"
        );


      const recommendedNote =
        document.getElementById(
          "recommended-server-note"
        );


      const recommendedButton =
        document.getElementById(
          "recommended-connect"
        );


      if (recommendedName) {

        recommendedName.textContent =
          `${flag} ${recommended.country_name}`;

      }


      if (recommendedNote) {

        recommendedNote.textContent =
          recommended.description ||
          "Готов к подключению";

      }


      if (recommendedButton) {

        const recommendedId =
          String(
            recommended.country_code || ""
          ).toLowerCase();


        recommendedButton.onclick =
          function () {

            connectServer(
              recommendedId
            );

          };

      }

    }


    console.log(
      "TIa Connect: серверы успешно загружены из Neon"
    );


  } catch (error) {

    console.error(
      "TIa Connect: ошибка загрузки серверов:",
      error
    );

  }

}


/* =========================
   START
========================= */

if (
  document.readyState === "loading"
) {

  document.addEventListener(
    "DOMContentLoaded",
    function () {

      loadVpnServers();

    }
  );

} else {

  loadVpnServers();

}
