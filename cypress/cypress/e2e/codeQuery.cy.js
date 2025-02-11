describe('Generating medical code', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  Cypress.on('uncaught:exception', (err) => {
    if (err.message.includes('ResizeObserver loop')) {
      return false;
    }
  });

  it('Generates Medical Code containing Hello and World', () => {
    cy.get('#root > div:nth-child(4) > div').click({ force: true });
    cy.get('[placeholder="Type your message here..."]').type('Generate medical code "Hello world"', { force: true });
    cy.get('body').type('{enter}');
    cy.wait(10000);
    cy.get('div:has(code.language-python)').each(($div) => {
      const codeContent = $div.text().toLowerCase();
      if (codeContent.includes('hello') && codeContent.includes('world')) {
      cy.get('[data-testid="ContentCopyIcon"]').click();
      cy.window().then((win) => {
        win.navigator.clipboard.readText().then((text) => {
        expect(text.toLowerCase()).to.include('hello');
        expect(text.toLowerCase()).to.include('world');
        });
      });
      return false;
      }
    });
  });
});

