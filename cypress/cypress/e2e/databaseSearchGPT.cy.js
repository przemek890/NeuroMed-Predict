describe('Searching doctors in the database based on user query with GPT prompt', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.wait(1500);
  });

  Cypress.on('uncaught:exception', (err) => {
    if (err.message.includes('ResizeObserver loop')) {
      return false;
    }
  });

  it('Database Search', () => {
      cy.title().should('eq', 'MedPred');
      cy.get('#root > div:nth-child(4) > div').click({ force: true });
      cy.get('[placeholder="Type your message here..."]').type('@');
      cy.get('body').type('{esc}', { force: true });
      cy.get('[placeholder="Type your message here..."]').type('Find me a neurosurgeon in Tarnów', { force: true });
      cy.get('body').type('{enter}');
      cy.wait(15000);
      cy.contains(/Found [1-9]\d* doctors/i, { timeout: 10000 }).should('be.visible');
      cy.get('a[href^="mailto:"]').should('be.visible').and('have.attr', 'href', 'mailto:hospital@lukasz.med.pl');
    });
});