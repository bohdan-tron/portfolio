# Web Components Guide

This guide covers Web Components development in this portfolio project, including styling best practices and common patterns.

## Project Structure

```
public/components/
├── site-header.ts          # TypeScript source
├── site-header.js          # Compiled JavaScript (auto-generated)
├── tsconfig.components.json # TypeScript configuration
└── README.md               # This file
```

## Available Scripts

```bash
# Build components once
npm run build:components

# Watch for changes and auto-compile
npm run build:components:watch

# Full development (server + components)
npm run dev:full
```

## Creating Web Components

### Basic Structure

```typescript
class YourComponent extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.innerHTML = `<div>Your content here</div>`;
  }

  disconnectedCallback() {
    // Cleanup when element is removed
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    // Handle attribute changes
  }

  static get observedAttributes() {
    return ['your-attribute']; // Attributes to watch
  }
}

customElements.define('your-component', YourComponent);
```

### Using Attributes

```typescript
class YourComponent extends HTMLElement {
  connectedCallback() {
    const title = this.getAttribute('title') || 'Default Title';
    const isActive = this.hasAttribute('active');
    
    this.innerHTML = `
      <div class="${isActive ? 'active' : ''}">
        <h2>${title}</h2>
      </div>
    `;
  }

  static get observedAttributes() {
    return ['title', 'active'];
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (oldValue !== newValue) {
      this.connectedCallback(); // Re-render when attributes change
    }
  }
}
```

## Styling Web Components

### Option 1: Shadow DOM (Encapsulated Styles)

```typescript
class YourComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.shadowRoot!.innerHTML = `
      <style>
        :host {
          display: block;
          padding: 16px;
          border: 1px solid #ccc;
          border-radius: 8px;
        }

        .title {
          color: #333;
          font-size: 1.2em;
          margin: 0;
        }

        .content {
          margin-top: 8px;
        }
      </style>
      
      <div class="container">
        <h2 class="title">${this.getAttribute('title') || 'Default'}</h2>
        <div class="content">
          <slot></slot>
        </div>
      </div>
    `;
  }
}
```

### Option 2: Global Styles (Current Approach)

```typescript
class YourComponent extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <header class="site-header">
        <nav class="navigation">
          <ul class="nav-list">
            <li><a href="/">Home</a></li>
          </ul>
        </nav>
      </header>
    `;
  }
}
```

Then add styles to `/public/styles/global.css`:

```css
/* Global styles for components */
.site-header {
  background: #333;
  color: white;
  padding: 1rem;
}

.navigation .nav-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  gap: 1rem;
}

.navigation a {
  color: white;
  text-decoration: none;
}

.navigation a.active {
  font-weight: bold;
  color: #007bff;
}
```

### Option 3: CSS-in-JS with Constructable Stylesheets

```typescript
class YourComponent extends HTMLElement {
  private stylesheet: CSSStyleSheet;

  constructor() {
    super();
    this.stylesheet = new CSSStyleSheet();
    this.stylesheet.replaceSync(`
      :host {
        display: block;
      }
      
      .container {
        padding: 1rem;
        border: 1px solid #ddd;
      }
    `);
  }

  connectedCallback() {
    this.attachShadow({ mode: 'open' });
    this.shadowRoot!.adoptedStyleSheets = [this.stylesheet];
    
    this.shadowRoot!.innerHTML = `
      <div class="container">
        <h2>${this.getAttribute('title')}</h2>
      </div>
    `;
  }
}
```

### Option 4: External CSS Files

```typescript
class YourComponent extends HTMLElement {
  async connectedCallback() {
    // Load external CSS
    const css = await fetch('/components/your-component.css').then(r => r.text());
    
    this.attachShadow({ mode: 'open' });
    this.shadowRoot!.innerHTML = `
      <style>${css}</style>
      <div class="container">
        <h2>${this.getAttribute('title')}</h2>
      </div>
    `;
  }
}
```

## Styling Best Practices

### 1. Choose the Right Approach

- **Shadow DOM**: Use for truly reusable, self-contained components
- **Global Styles**: Use for site-wide components (like headers, footers)
- **CSS-in-JS**: Use for dynamic styling needs
- **External CSS**: Use for large, complex components

### 2. CSS Custom Properties (Variables)

```typescript
class YourComponent extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <div class="card">
        <h2>Card Title</h2>
        <p>Card content</p>
      </div>
    `;
  }
}
```

```css
/* In global.css */
.card {
  background: var(--card-bg, #ffffff);
  border: 1px solid var(--card-border, #e0e0e0);
  border-radius: var(--card-radius, 8px);
  padding: var(--card-padding, 16px);
  box-shadow: var(--card-shadow, 0 2px 4px rgba(0,0,0,0.1));
}

/* Customizable per instance */
.card.special {
  --card-bg: #f0f8ff;
  --card-border: #4a90e2;
}
```

### 3. Slot API for Flexible Content

```typescript
class CardComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.shadowRoot!.innerHTML = `
      <style>
        :host {
          display: block;
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 16px;
          margin: 16px 0;
        }
        
        .card-header {
          font-weight: bold;
          margin-bottom: 8px;
        }
        
        .card-content {
          color: #666;
        }
      </style>
      
      <div class="card-header">
        <slot name="header">Default Header</slot>
      </div>
      <div class="card-content">
        <slot>Default content</slot>
      </div>
    `;
  }
}
```

Usage:
```html
<card-component>
  <span slot="header">Custom Title</span>
  <p>Custom content goes here</p>
</card-component>
```

## Component Communication

### Events

```typescript
class ButtonComponent extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <button>
        ${this.getAttribute('label') || 'Click me'}
      </button>
    `;
    
    this.querySelector('button')?.addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('button-click', {
        detail: { value: this.getAttribute('value') },
        bubbles: true
      }));
    });
  }
}
```

Usage:
```html
<button-component label="Submit" value="form-submit"></button-component>

<script>
document.querySelector('button-component').addEventListener('button-click', (e) => {
  console.log('Button clicked:', e.detail.value);
});
</script>
```

## Performance Tips

1. **Lazy Load Components**: Load component scripts only when needed
2. **Use Shadow DOM**: Prevent style conflicts and improve encapsulation
3. **Debounce Events**: For frequent events like scroll or resize
4. **Cache DOM Queries**: Store frequently accessed elements

## Testing Components

```typescript
// Simple test example
const testComponent = document.createElement('your-component');
testComponent.setAttribute('title', 'Test Title');
document.body.appendChild(testComponent);

// Test assertions
console.assert(
  testComponent.querySelector('h2')?.textContent === 'Test Title',
  'Title should be set correctly'
);
```

## Common Patterns

### 1. Form Components

```typescript
class FormInput extends HTMLElement {
  private input: HTMLInputElement;

  connectedCallback() {
    this.innerHTML = `
      <label>
        ${this.getAttribute('label') || ''}
        <input type="${this.getAttribute('type') || 'text'}" />
      </label>
    `;
    
    this.input = this.querySelector('input')!;
    
    if (this.hasAttribute('required')) {
      this.input.required = true;
    }
  }

  get value() {
    return this.input.value;
  }

  set value(val: string) {
    this.input.value = val;
  }
}
```

### 2. Loading States

```typescript
class DataLoader extends HTMLElement {
  private isLoading = false;

  connectedCallback() {
    this.render();
  }

  private render() {
    this.innerHTML = this.isLoading 
      ? '<div class="loading">Loading...</div>'
      : '<div class="content"><slot></slot></div>';
  }

  async loadData(url: string) {
    this.isLoading = true;
    this.render();
    
    try {
      const response = await fetch(url);
      const data = await response.json();
      // Handle data
    } finally {
      this.isLoading = false;
      this.render();
    }
  }
}
```

## Migration from Existing Components

To convert existing HTML to Web Components:

1. **Extract HTML structure** into `innerHTML`
2. **Move JavaScript logic** into component class
3. **Convert CSS** to appropriate styling approach
4. **Add attributes** for dynamic behavior
5. **Register component** with `customElements.define()`

## Resources

- [MDN Web Components](https://developer.mozilla.org/en-US/docs/Web/Web_Components)
- [Web Components Official Site](https://www.webcomponents.org/)
- [Lit Library](https://lit.dev/) - Lightweight library for Web Components
- [Shadow DOM CSS Selectors](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_shadow_DOM)

## Troubleshooting

### Common Issues

1. **Component not rendering**: Check if script is loaded and element is defined
2. **Styles not applying**: Verify CSS paths and Shadow DOM usage
3. **Attributes not updating**: Ensure `observedAttributes` is set
4. **Events not working**: Check event delegation and bubbling

### Debug Tips

```typescript
class YourComponent extends HTMLElement {
  connectedCallback() {
    console.log('Component connected:', this.tagName);
    console.log('Attributes:', this.getAttributeNames());
    this.render();
  }
  
  private render() {
    console.log('Rendering component');
    // Your render logic
  }
}
```
