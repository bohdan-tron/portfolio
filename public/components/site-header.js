// Web Component for reusable header
class SiteHeader extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    const activePage = this.getAttribute("active-page") || "";
    this.innerHTML = `
      <header>
        <nav>
          <ul>
            <li><a href="/" ${activePage === "home" ? 'class="active"' : ""}>Main Page</a></li>
            <li><a href="/croco" ${activePage === "croco" ? 'class="active"' : ""}>Draw & Guess</a></li>
            <li><a href="/whoami" ${activePage === "whoami" ? 'class="active"' : ""}>Хто я?</a></li>
          </ul>
        </nav>
      </header>
    `;
  }
}
// Register the custom element
customElements.define("site-header", SiteHeader);
