export const deleteCreditCard = (creditCardNumber: string): void => {
  cy.get('dib-profile dib-payment dib-credit-card .card__number-box')
    .contains(creditCardNumber.slice(-4))
    .parents('dib-credit-card')
    .find('ui-button')
    .contains(' remove ')
    .click();

  cy.get('.cdk-overlay-container simple-snack-bar > span').should('contain', 'Card Deleted');
};
