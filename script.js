const menuButton = document.querySelector(".menu-button");
const siteNav = document.querySelector(".site-nav");
const form = document.querySelector("#contact-form");
const status = document.querySelector("#form-status");
const year = document.querySelector("#year");

if (year) {
  year.textContent = new Date().getFullYear();
}

if (menuButton && siteNav) {
  menuButton.addEventListener("click", () => {
    const isOpen = siteNav.classList.toggle("open");
    menuButton.setAttribute("aria-expanded", String(isOpen));
  });

  siteNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      siteNav.classList.remove("open");
      menuButton.setAttribute("aria-expanded", "false");
    });
  });
}

if (form && status) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const businessName = document.querySelector("#business-name").value.trim();
    const city = document.querySelector("#city").value.trim();
    const service = document.querySelector("#service").value.trim();
    const contactMethod = document.querySelector("#contact-method").value.trim();
    const message = document.querySelector("#message").value.trim();
    const consent = document.querySelector("#consent").checked;

    if (!businessName || !city || !service || !contactMethod || !consent) {
      status.textContent = "请先填写必填信息。";
      return;
    }

    const subject = encodeURIComponent(`网站需求：${businessName}`);
    const body = encodeURIComponent(
`商家或店铺名称：${businessName}
所在城市：${city}
主要产品或服务：${service}
联系方式：${contactMethod}

网站需求：
${message || "暂未补充"}

以上信息请联系我进一步确认。`
    );

    status.textContent = "正在打开邮件应用。";
    window.location.href =
      `mailto:shangjiawangzhan@gmail.com?subject=${subject}&body=${body}`;
  });
}
