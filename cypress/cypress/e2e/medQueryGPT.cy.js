describe('Medical query', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.wait(1500);
  });

  Cypress.on('uncaught:exception', (err) => {
    if (err.message.includes('ResizeObserver loop')) {
      return false;
    }
  });

  it('Skin Cancer', () => {
    cy.title().should('eq', 'MedPred');
    cy.get('#root > div:nth-child(4) > div').click({ force: true });
    cy.get('[placeholder="Type your message here..."]').type(
      'My mole has changed shape and color. A new bump has appeared. I have a wound that does not heal and bleeds. What could it be?',
      { force: true }
    );
    cy.get('body').type('{enter}');
    cy.contains(/skin cancer/i, { timeout: 10000 }).should('be.visible');
  });
});