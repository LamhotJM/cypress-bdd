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
