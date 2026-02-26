# Web Components

This directory contains TypeScript Web Components that are compiled to JavaScript for use in the browser.

## Available Scripts

### Build Components
```bash
npm run build:components
```
Compiles all TypeScript files in this directory to JavaScript.

### Watch Components
```bash
npm run build:components:watch
```
Watches for changes in TypeScript files and automatically recompiles them.

### Full Development
```bash
npm run dev:full
```
Runs both the server and component watch in parallel.

## File Structure

- `*.ts` - TypeScript source files for Web Components
- `*.js` - Compiled JavaScript files (auto-generated, don't edit)
- `tsconfig.components.json` - TypeScript configuration for components

## Usage

1. Create a new TypeScript file for your component
2. The component will be automatically compiled to JavaScript
3. Include the compiled JS file in your HTML:
   ```html
   <script src="/components/your-component.js" type="module"></script>
   ```
4. Use your custom element in HTML:
   ```html
   <your-component></your-component>
   ```

## Example

See `site-header.ts` for an example Web Component implementation.
