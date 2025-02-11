describe('Notebook navigation and interaction', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  Cypress.on('uncaught:exception', (err) => {
    if (err.message.includes('ResizeObserver loop')) {
      return false;
    }
  });

  it('Heart Disease Analysis Notebook', () => {
    cy.title().should('eq', 'MedPred');
    cy.contains('button', 'Notebooks').click({ force: true });
    cy.contains('#notebooks-menu li a', 'Heart disease').click({ force: true });
    cy.wait(3000);
    cy.get('div:nth-of-type(2) button:nth-of-type(1) path').click({ force: true });
    cy.get('div:nth-of-type(2) button:nth-of-type(2) > svg').click({ force: true });
    cy.get('#root > div:nth-of-type(1) button:nth-of-type(3)').click({ force: true });
    cy.get('#root > div:nth-of-type(1) button:nth-of-type(4)').click({ force: true });
    cy.get('div:nth-of-type(3) > button:nth-of-type(2) > svg').click({ force: true });
    cy.get('div:nth-of-type(3) > button:nth-of-type(1) path').click({ force: true });
  });

  it('Diabetes Analysis Notebook', () => {
    cy.title().should('eq', 'MedPred');
    cy.contains('button', 'Notebooks').click({ force: true });
    cy.contains('#notebooks-menu li a', 'Diabetes analysis').click({ force: true });
    cy.wait(3000);
    cy.get('div:nth-of-type(2) button:nth-of-type(1) path').click({ force: true });
    cy.get('div:nth-of-type(2) button:nth-of-type(2) path').click({ force: true });
    cy.get('#root > div:nth-of-type(1) button:nth-of-type(3)').click({ force: true });
    cy.get('#root > div:nth-of-type(1) button:nth-of-type(4) path').click({ force: true });
    cy.get('div:nth-of-type(3) > button:nth-of-type(2) > svg').click({ force: true });
    cy.get('div:nth-of-type(3) > button:nth-of-type(1) path').click({ force: true });
  });
});
