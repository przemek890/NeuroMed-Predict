describe('Learn more about us', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  Cypress.on('uncaught:exception', (err) => {
    if (err.message.includes('ResizeObserver loop')) {
      return false;
    }
  });

  it('Info check', () => {
    cy.title().should('eq', 'MedPred');
    cy.get('a[href="/info"]').contains('Learn More About Us').click({ force: true });
    cy.wait(1000);

    const checkTableKeys = (section) => {
      cy.wrap(section).within(() => {
        cy.contains('Precision').should('be.visible');
        cy.contains('Recall').should('be.visible');
        cy.contains('Accuracy').should('be.visible');
        cy.contains('Loss').should('be.visible');
        cy.contains('Train samples').should('be.visible');
        cy.contains('Validation samples').should('be.visible');
        cy.contains('Test samples').should('be.visible');
      });
    };

    cy.get('div.MuiPaper-root').contains('h6', 'Heart Disease').parent().then((heartSection) => {
      checkTableKeys(heartSection);
    });

    cy.get('div.MuiPaper-root').contains('h6', 'Diabetes').parent().then((diabetesSection) => {
      checkTableKeys(diabetesSection);
    });
  });
});