describe('Theme change with GPT', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.wait(1500);
  });

  Cypress.on('uncaught:exception', (err) => {
    if (err.message.includes('ResizeObserver loop')) {
      return false;
    }
  });

  it('Dark Theme', () => {
    cy.title().should('eq', 'MedPred');
    cy.get('body').invoke('attr', 'class').then((originalBodyClass) => {
      cy.get('#root > div:nth-child(4) > div').click({ force: true });
      cy.get('[placeholder="Type your message here..."]').type('@');
      cy.contains('Change theme to').click({ force: true });
      cy.contains('dark').click({ force: true });
      cy.get('body').invoke('css', 'background-color').then((originalBackgroundColor) => {
        cy.get('h6').invoke('css', 'color').then((originalTextColor) => {
          cy.get('body').type('{enter}');
          cy.wait(10000);
          cy.contains('Executed command: theme_change').should('be.visible');
          cy.get('body').invoke('css', 'background-color').should('not.eq', originalBackgroundColor);
          cy.get('h6').invoke('css', 'color').should('not.eq', originalTextColor);
        });
      });
    });
  });

  it('Light Theme', () => {
    cy.title().should('eq', 'MedPred');
    cy.get('input[type="checkbox"]').click({ force: true });
    cy.get('input[type="checkbox"]').should('be.checked');

    cy.get('body').invoke('attr', 'class').then((originalBodyClass) => {
      cy.get('#root > div:nth-child(4) > div').click({ force: true });
      cy.get('[placeholder="Type your message here..."]').type('@');
      cy.contains('Change theme to').click({ force: true });
      cy.contains('light').click({ force: true });
      cy.get('body').invoke('css', 'background-color').then((originalBackgroundColor2) => {
        cy.get('h6').invoke('css', 'color').then((originalTextColor2) => {
          cy.get('body').type('{enter}');
          cy.wait(10000);
          cy.contains('Executed command: theme_change').should('be.visible');
          cy.get('body').invoke('css', 'background-color').should('not.eq', originalBackgroundColor2);
          cy.get('h6').invoke('css', 'color').should('not.eq', originalTextColor2);
        });
      });
    });
  });
});