# TypeScript + Cypress-Cucumber (BDD) + ESBuild + Page Objects + Env-based configs.

By: Lamhot Siagian 
![52569d0e-f9b8-4bb3-8f36-ca3d6e4b9fa8](https://github.com/user-attachments/assets/8c73c957-71c3-47d2-992b-4c960946cb8e)

---

## 📋 Prerequisites

* **Node.js** (v14 or newer) + **npm**
* **git** (optional)
* A code editor with TS support (e.g. VS Code)

---

## 1. Scaffold Your Project

```bash
mkdir cypress-bdd-google-ts
cd cypress-bdd-google-ts
npm init -y
```

---

## 2. Install Dev Dependencies

```bash
npm install --save-dev \
  cypress@^14 \
  typescript \
  ts-node \
  @types/node \
  @badeball/cypress-cucumber-preprocessor@^16 \
  @bahmutov/cypress-esbuild-preprocessor@^2 \
  esbuild@^0.18
```

> **Note:** *You do **not** need* `@types/cypress`—Cypress bundles its own TS types.

---

## 3. TypeScript Config (`tsconfig.json`)

```jsonc
{
  "compilerOptions": {
    "target": "ESNext",
    "lib": ["ESNext", "DOM"],
    "module": "CommonJS",
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "skipLibCheck": true,
    "strict": true,
    "outDir": "dist",
    "types": [
      "cypress",
      "@badeball/cypress-cucumber-preprocessor"
    ]
  },
  "include": ["**/*.ts", "cypress.config.ts"]
}
```

---

## 4. Git Ignore (`.gitignore`)

```gitignore
# Node & build
node_modules/
dist/

# Logs
npm-debug.log*
yarn-debug.log*

# Env
.env
.env.*.local

# OS
.DS_Store
Thumbs.db

# Editors
.vscode/
.idea/

# Cypress artifacts
cypress/videos/
cypress/screenshots/
~/.cache/Cypress/

# TS cache
*.tsbuildinfo
```

---

## 5. Cypress Config (`cypress.config.ts`)

```ts
import { defineConfig } from 'cypress';
import { addCucumberPreprocessorPlugin } from
  '@badeball/cypress-cucumber-preprocessor';
import { createEsbuildPlugin } from
  '@badeball/cypress-cucumber-preprocessor/esbuild';
import createBundler from
  '@bahmutov/cypress-esbuild-preprocessor';
import path from 'path';

export default defineConfig({
  e2e: {
    specPattern: 'cypress/e2e/**/*.feature',
    supportFile: 'cypress/support/e2e.ts',
    async setupNodeEvents(on, config) {
      // 1) Hook in Cucumber
      await addCucumberPreprocessorPlugin(on, config);

      // 2) Compile with ESBuild + Cucumber plugin
      const bundler = createBundler({
        plugins: [createEsbuildPlugin(config)]
      });
      on('file:preprocessor', bundler);

      // 3) Load your env JSON
      const envPath = path.resolve(
        __dirname, 'cypress', 'env',
        `${config.env.CYPRESS_ENV || 'dev'}.json`
      );
      const fileEnv = require(envPath);

      // 4) Merge & return
      return { ...config, ...fileEnv };
    }
  }
});
```

---

## 6. Scripts in `package.json`

```jsonc
"scripts": {
  "open": "cypress open --env CYPRESS_ENV=dev",
  "test": "cypress run --env CYPRESS_ENV=dev"
}
```

---

## 7. Environment Files

* **`cypress/env/dev.json`**

  ```json
  {
    "baseUrl": "https://www.google.com",
    "searchTerm": "cypress bdd"
  }
  ```
* **`cypress/env/prod.json`**

  ```json
  {
    "baseUrl": "https://www.google.com",
    "searchTerm": "cypress page object"
  }
  ```

---

## 8. Page Object Model

**File:** `cypress/pages/googleSearch.page.ts`

```ts
export class GoogleSearchPage {
  visit(): void {
    cy.visit('/');
  }

  get searchInput() {
    return cy.get('input[name="q"]');
  }

  get results() {
    return cy.get('#search .g');
  }

  search(term: string): void {
    this.searchInput.clear().type(`${term}{enter}`);
  }
}
```

---

## 9. Feature + Steps (Grouped Folder)

```
cypress/
└── e2e/
    └── google-search/
        ├ google-search.feature
        └ google-search.steps.ts
```

* **`google-search.feature`**

  ```gherkin
  Feature: Google Search

    Scenario: Search for a term
      Given I open Google
      When I search for the term
      Then I should see results related to the term
  ```

* **`google-search.steps.ts`**

  ```ts
  import { Given, When, Then } from
    '@badeball/cypress-cucumber-preprocessor';
  import { GoogleSearchPage } from '../../pages/googleSearch.page';

  const page = new GoogleSearchPage();

  Given('I open Google', () => {
    page.visit();
  });

  When('I search for the term', () => {
    page.search(Cypress.env('searchTerm') as string);
  });

  Then('I should see results related to the term', () => {
    page.results.should('have.length.greaterThan', 0);
    page.results.first()
      .should('contain.text', (Cypress.env('searchTerm') as string).split(' ')[0]);
  });
  ```

> **Important:** Placing your `.feature` and `.steps.ts` in a folder **named** after the feature (`google-search/`) ensures Cypress-Cucumber will auto-find them.

---

## 10. Support & Custom Commands

* **`cypress/support/commands.ts`**

  ```ts
  import { GoogleSearchPage } from '../pages/googleSearch.page';

  declare global {
    namespace Cypress {
      interface Chainable {
        googleSearch(term: string): void;
      }
    }
  }

  Cypress.Commands.add('googleSearch', (term: string) => {
    const page = new GoogleSearchPage();
    page.visit();
    page.search(term);
  });
  ```

* **`cypress/support/e2e.ts`**

  ```ts
  import './commands';
  ```

---

## 11. Final Folder Structure

```
cypress-bdd-google-ts/
├── cypress.config.ts
├── tsconfig.json
├── package.json
├── .gitignore
└── cypress/
    ├── env/
    │   ├── dev.json
    │   └── prod.json
    ├── pages/
    │   └── googleSearch.page.ts
    ├── e2e/
    │   └── google-search/
    │       ├── google-search.feature
    │       └── google-search.steps.ts
    └── support/
        ├── commands.ts
        └── e2e.ts
```

---

## 12. Run & Verify

1. **Install** deps:

   ```bash
   npm install
   ```
2. **Open** interactive runner (dev):

   ```bash
   npm run open
   ```
3. **Run** headless:

   ```bash
   npm test
   ```

You should now see your **Google Search** BDD scenario execute without errors. 🎉
