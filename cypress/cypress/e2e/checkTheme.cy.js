describe('Theme change', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  Cypress.on('uncaught:exception', (err) => {
    if (err.message.includes('ResizeObserver loop')) {
      return false;
    }
  });

  it('Checkbox theme change', () => {
        cy.title().should('eq', 'MedPred');
        cy.get('body').invoke('css', 'background-color').then((originalBackgroundColor) => {
        cy.get('h6').invoke('css', 'color').then((originalTextColor) => {
            cy.get('input[type="checkbox"]').click({ force: true });
            cy.get('input[type="checkbox"]').should('be.checked');
            cy.get('body').invoke('css', 'background-color').should('not.eq', originalBackgroundColor);
            cy.get('h6').invoke('css', 'color').should('not.eq', originalTextColor);
            cy.get('input[type="checkbox"]').click({ force: true });
            cy.get('input[type="checkbox"]').should('not.be.checked');
            cy.get('body').invoke('css', 'background-color').should('eq', originalBackgroundColor);
            cy.get('h6').invoke('css', 'color').should('eq', originalTextColor);
      });
    });
  });
});
