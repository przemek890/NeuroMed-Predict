describe('Forms', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  Cypress.on('uncaught:exception', (err) => {
    if (err.message.includes('ResizeObserver loop')) {
      return false;
    }
  });

  it('Diabetes Prediction', () => {
    cy.title().should('eq', 'MedPred');
    cy.get('img[alt="Diabetes Prediction"]').click({force: true});

    cy.get('[name="age"]').type('23');
    cy.wait(100);

    cy.get('#mui-component-select-sex').click({force: true});
    cy.get('[role="listbox"]').contains('Male').click({force: true});
    cy.get('body').type('{esc}');
    cy.wait(100);

    cy.get('#mui-component-select-highChol').click({force: true});
    cy.get('[role="listbox"]').contains('No').click({force: true});
    cy.get('body').type('{esc}');
    cy.wait(100);

    cy.get('#mui-component-select-cholCheck').click({force: true});
    cy.get('[role="listbox"]').contains('Yes').click({force: true});
    cy.get('body').type('{esc}');
    cy.wait(100);

    cy.get('[name="bmi"]').type('25');
    cy.wait(100);

    cy.get('#mui-component-select-smoker').click({force: true});
    cy.get('[role="listbox"]').contains('No').click({force: true});
    cy.get('body').type('{esc}');
    cy.wait(100);

    cy.get('#mui-component-select-heartDiseaseorAttack').click({force: true});
    cy.get('[role="listbox"]').contains('No').click({force: true});
    cy.get('body').type('{esc}');
    cy.wait(100);

    cy.get('#mui-component-select-physActivity').click({force: true});
    cy.get('[role="listbox"]').contains('No').click({force: true});
    cy.get('body').type('{esc}');
    cy.wait(100);

    cy.get('#mui-component-select-fruits').click({force: true});
    cy.get('[role="listbox"]').contains('Yes').click({force: true});
    cy.get('body').type('{esc}');
    cy.wait(100);

    cy.get('#mui-component-select-veggies').click({force: true});
    cy.get('[role="listbox"]').contains('Yes').click({force: true});
    cy.get('body').type('{esc}');
    cy.wait(100);

    cy.get('#mui-component-select-hvyAlcoholConsump').click({force: true});
    cy.get('[role="listbox"]').contains('No').click({force: true});
    cy.get('body').type('{esc}');
    cy.wait(100);

    cy.get('#mui-component-select-genHlth').click({force: true});
    cy.get('[role="listbox"]').contains('Good').click({force: true});
    cy.get('body').type('{esc}');
    cy.wait(100);

    cy.get('[name="mentHlth"]').type('23');
    cy.wait(100);

    cy.get('[name="physHlth"]').type('23');
    cy.wait(100);

    cy.get('#mui-component-select-diffWalk').click({force: true});
    cy.get('[role="listbox"]').contains('No').click({force: true});
    cy.get('body').type('{esc}');
    cy.wait(100);

    cy.get('#mui-component-select-stroke').click({force: true});
    cy.get('[role="listbox"]').contains('No').click({force: true});
    cy.get('body').type('{esc}');
    cy.wait(100);

    cy.get('#mui-component-select-highBP').click({force: true});
    cy.get('[role="listbox"]').contains('No').click({force: true});
    cy.get('body').type('{esc}');
    cy.wait(100);

    cy.contains('Submit').click({force: true});

    cy.get('table', { timeout: 10000 }).should('be.visible');
    cy.get('table').find('tbody').find('tr').should('have.length', 2);

    cy.get('table').find('tbody').find('tr').eq(0).within(() => {
      cy.get('td').eq(0).should('contain', '1');
      cy.get('td').eq(1).should('contain', 'Yes');
      cy.get('td').eq(2).invoke('text').should('match', /\d+(\.\d+)?%/);
    });

    cy.get('table').find('tbody').find('tr').eq(1).within(() => {
      cy.get('td').eq(0).should('contain', '2');
      cy.get('td').eq(1).should('contain', 'No');
      cy.get('td').eq(2).invoke('text').should('match', /\d+(\.\d+)?%/);
    });
    cy.wait(2000);
  });

  it('HeartDisease Prediction', () => {
    cy.title().should('eq', 'MedPred');
    cy.get('img[alt="Heart Disease Prediction"]').click({force: true});

    cy.get('#mui-component-select-highBP').click({force: true});
    cy.get('[role="listbox"]').contains('No').click({force: true});
    cy.get('body').type('{esc}');
    cy.wait(100);

    cy.get('#mui-component-select-highChol').click({force: true});
    cy.get('[role="listbox"]').contains('No').click({force: true});
    cy.get('body').type('{esc}');
    cy.wait(100);

    cy.get('#mui-component-select-cholCheck').click({force: true});
    cy.get('[role="listbox"]').contains('Yes').click({force: true});
    cy.get('body').type('{esc}');
    cy.wait(100);

    cy.get('[name="bmi"]').type('23');
    cy.wait(100);

    cy.get('#mui-component-select-smoker').click({force: true});
    cy.get('[role="listbox"]').contains('No').click({force: true});
    cy.get('body').type('{esc}');
    cy.wait(100);

    cy.get('#mui-component-select-stroke').click({force: true});
    cy.get('[role="listbox"]').contains('No').click({force: true});
    cy.get('body').type('{esc}');
    cy.wait(100);

    cy.get('#mui-component-select-diabetes').click({force: true});
    cy.get('[role="listbox"]').contains('No').click({force: true});
    cy.get('body').type('{esc}');
    cy.wait(100);

    cy.get('#mui-component-select-physActivity').click({force: true});
    cy.get('[role="listbox"]').contains('Yes').click({force: true});
    cy.get('body').type('{esc}');
    cy.wait(100);

    cy.get('#mui-component-select-fruits').click({force: true});
    cy.get('[role="listbox"]').contains('Yes').click({force: true});
    cy.get('body').type('{esc}');
    cy.wait(100);

    cy.get('#mui-component-select-veggies').click({force: true});
    cy.get('[role="listbox"]').contains('Yes').click({force: true});
    cy.get('body').type('{esc}');
    cy.wait(100);

    cy.get('#mui-component-select-hvyAlcoholConsump').click({force: true});
    cy.get('[role="listbox"]').contains('No').click({force: true});
    cy.get('body').type('{esc}');
    cy.wait(100);

    cy.get('#mui-component-select-anyHealthcare').click({force: true});
    cy.get('[role="listbox"]').contains('Yes').click({force: true});
    cy.get('body').type('{esc}');
    cy.wait(100);

    cy.get('#mui-component-select-noDocbcCost').click({force: true});
    cy.get('[role="listbox"]').contains('No').click({force: true});
    cy.get('body').type('{esc}');
    cy.wait(100);

    cy.get('#mui-component-select-genHlth').click({force: true});
    cy.get('[role="listbox"]').contains('Good').click({force: true});
    cy.get('body').type('{esc}');
    cy.wait(100);

    cy.get('[name="mentHlth"]').type('25');
    cy.wait(100);

    cy.get('[name="physHlth"]').type('23');
    cy.wait(100);

    cy.get('#mui-component-select-diffWalk').click({force: true});
    cy.get('[role="listbox"]').contains('No').click({force: true});
    cy.get('body').type('{esc}');
    cy.wait(100);

    cy.get('#mui-component-select-sex').click({force: true});
    cy.get('[role="listbox"]').contains('Male').click({force: true});
    cy.get('body').type('{esc}');
    cy.wait(100);

    cy.get('[name="age"]').type('23');
    cy.wait(100);

    cy.get('#mui-component-select-education').click({force: true});
    cy.get('[role="listbox"]').contains('Some College').click({force: true});
    cy.get('body').type('{esc}');
    cy.wait(100);

    cy.get('#mui-component-select-income').click({force: true});
    cy.get('[role="listbox"]').contains('$10,000 to $15,000').click({force: true});
    cy.get('body').type('{esc}');
    cy.wait(100);

    cy.contains('Submit').click({force: true});

    cy.get('table', { timeout: 10000 }).should('be.visible');
    cy.get('table').find('tbody').find('tr').should('have.length', 2);

    cy.get('table').find('tbody').find('tr').eq(0).within(() => {
      cy.get('td').eq(0).should('contain', '1');
      cy.get('td').eq(1).should('contain', 'Yes');
      cy.get('td').eq(2).invoke('text').should('match', /\d+(\.\d+)?%/);
    });

    cy.get('table').find('tbody').find('tr').eq(1).within(() => {
      cy.get('td').eq(0).should('contain', '2');
      cy.get('td').eq(1).should('contain', 'No');
      cy.get('td').eq(2).invoke('text').should('match', /\d+(\.\d+)?%/);
    });
    cy.wait(2000);
  });
});