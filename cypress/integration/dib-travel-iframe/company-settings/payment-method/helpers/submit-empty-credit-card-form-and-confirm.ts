export const submitEmptyCreditCardFormAndConfirm = (): void => {
  cy.get('.cdk-overlay-container dib-add-credit-card-dialog ui-button[type=success]').click();

  cy.get('.cdk-overlay-container dib-add-credit-card-dialog .error')
    .should('contain', 'Postal code is required.')
    .should('contain', 'City is required.')
    .should('contain', 'Country is required.')
    .should('contain', 'Street name is required.')
    .should('contain', 'Email is required.')
    .should('contain', 'VAT is required.')
    .should('contain', 'First name is required.')
    .should('contain', 'Last name is required.');
};
