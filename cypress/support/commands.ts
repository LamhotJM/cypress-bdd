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
