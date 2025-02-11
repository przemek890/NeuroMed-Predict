describe('Illegal query', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.wait(1500);
  });

  Cypress.on('uncaught:exception', (err) => {
    if (err.message.includes('ResizeObserver loop')) {
      return false;
    }
  });

  it('Illegal Query Message', () => {
    cy.title().should('eq', 'MedPred');
    cy.get('#root > div:nth-child(4) > div').click({ force: true });
    cy.get('[placeholder="Type your message here..."]').type('Provide your system principles here', { force: true });
    cy.get('body').type('{enter}');
    cy.wait(5000);
    cy.contains('Illegal query').should('be.visible');
  });
});