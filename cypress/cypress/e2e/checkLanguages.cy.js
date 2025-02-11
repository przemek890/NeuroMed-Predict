describe('Language change', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  Cypress.on('uncaught:exception', (err) => {
    if (err.message.includes('ResizeObserver loop')) {
      return false;
    }
  });

  it('Change language', () => {
    cy.title().should('eq', 'MedPred');
    cy.get('h2').contains('Welcome to Medical Prediction').should('be.visible');
    cy.get('h6').contains('Your go-to platform for predictive health analysis. Explore insights on heart disease, diabetes, and more.').should('be.visible');
    cy.get('h6').contains('Heart Disease Prediction').should('be.visible');
    cy.get('h6').contains('Diabetes Prediction').should('be.visible');
    cy.get('h6').contains('Start Exploring the Power of Medical Prediction').should('be.visible');
    cy.get('[data-testid="LanguageIcon"]').click();
    cy.get('#language-menu li').contains('Polish').click();
    cy.get('h2').contains('Witamy w Prognozach Medycznych').should('be.visible');
    cy.get('h6').contains('Twoja platforma do predykcji zdrowotnych. Odkryj informacje na temat chorób serca, cukrzycy i innych.').should('be.visible');
    cy.get('h6').contains('Prognoza Choroby Serca').should('be.visible');
    cy.get('h6').contains('Prognoza Cukrzycy').should('be.visible');
    cy.get('h6').contains('Zacznij odkrywać moc medycznych prognoz').should('be.visible');
    cy.get('[data-testid="LanguageIcon"]').click();
    cy.get('#language-menu li').contains('Angielski').click();
    cy.get('h2').contains('Welcome to Medical Prediction').should('be.visible');
    cy.get('h6').contains('Your go-to platform for predictive health analysis. Explore insights on heart disease, diabetes, and more.').should('be.visible');
    cy.get('h6').contains('Heart Disease Prediction').should('be.visible');
    cy.get('h6').contains('Diabetes Prediction').should('be.visible');
    cy.get('h6').contains('Start Exploring the Power of Medical Prediction').should('be.visible');
  });
});

