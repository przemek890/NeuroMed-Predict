describe('Testing GPT Context Behavior', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.wait(1500);
  });

  Cypress.on('uncaught:exception', (err) => {
    if (err.message.includes('ResizeObserver loop')) {
      return false;
    }
  });

  it('GPT Context', () => {
    cy.title().should('eq', 'MedPred');
    cy.get('#root > div:nth-child(4) > div').click({ force: true });
    cy.get('[placeholder="Type your message here..."]').type(
      'My name is Przemek, and I am testing a medical application.',
      { force: true }
    );
    cy.get('body').type('{enter}');
    cy.wait(10000);
    cy.get('[placeholder="Type your message here..."]').type('What is the name of the user you are talking with? Please surround it with ""', { force: true });
    cy.get('body').type('{enter}');
    cy.contains('"Przemek"', { timeout: 10000 }).should('be.visible');
  });
});