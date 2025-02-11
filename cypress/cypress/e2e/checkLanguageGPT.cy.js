describe('Language change with GPT', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.wait(1500);
  });

  Cypress.on('uncaught:exception', (err) => {
    if (err.message.includes('ResizeObserver loop')) {
      return false;
    }
  });

  it('Polish language', () => {
    cy.title().should('eq', 'MedPred');
    cy.get('#root > div:nth-child(4) > div').click({ force: true });
    cy.get('[placeholder="Type your message here..."]').type('@');
    cy.contains('Change language').click({ force: true });
    cy.wait(100);
    cy.contains('polish').click({ force: true });
    cy.get('body').type('{enter}');
    cy.wait(10000);
    cy.contains('Wykonano polecenie: language_change').should('be.visible');
    cy.get('h2').contains('Witamy w Prognozach Medycznych').should('be.visible');
    cy.get('h6').contains('Twoja platforma do predykcji zdrowotnych. Odkryj informacje na temat chorób serca, cukrzycy i innych.').should('be.visible');
    cy.get('h6').contains('Prognoza Choroby Serca').should('be.visible');
    cy.get('h6').contains('Prognoza Cukrzycy').should('be.visible');
    cy.get('h6').contains('Zacznij odkrywać moc medycznych prognoz').should('be.visible');
  });

  it('English language', () => {
    cy.title().should('eq', 'MedPred');
    cy.get('[data-testid="LanguageIcon"]').click();
    cy.get('#language-menu li').contains('Polish').click();
    cy.get('h2').contains('Witamy w Prognozach Medycznych').should('be.visible');
    cy.get('#root > div:nth-child(4) > div').click({ force: true });
    cy.get('[placeholder="Wpisz swoją wiadomość tutaj..."]').type('@');
    cy.contains('Zmień język na').click({ force: true });
    cy.wait(100);
    cy.contains('angielski').click({ force: true });
    cy.get('body').type('{enter}');
    cy.wait(10000);
    cy.contains('Executed command: language_change').should('be.visible');
    cy.get('h2').contains('Welcome to Medical Prediction').should('be.visible');
    cy.get('h6').contains('Your go-to platform for predictive health analysis. Explore insights on heart disease, diabetes, and more.').should('be.visible');
    cy.get('h6').contains('Heart Disease Prediction').should('be.visible');
    cy.get('h6').contains('Diabetes Prediction').should('be.visible');
    cy.get('h6').contains('Start Exploring the Power of Medical Prediction').should('be.visible');
  });
});
