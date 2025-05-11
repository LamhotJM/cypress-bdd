import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';
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
  page.results.first().should('contain.text', (Cypress.env('searchTerm') as string).split(' ')[0]);
});
