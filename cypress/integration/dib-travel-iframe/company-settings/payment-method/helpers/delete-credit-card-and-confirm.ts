import { PaymentMethod } from '@cy/models';

export const deleteCreditCardAndConfirm = (paymentMethod: PaymentMethod): void => {
  cy.get('dib-company-management dib-payment-method dib-credit-card .card__email')
    .contains(paymentMethod.primaryContact.email)
    .parents('dib-credit-card')
    .find('ui-button')
    .contains('Delete')
    .click();

  cy.get('.cdk-overlay-container simple-snack-bar > span').should('have.text', 'Card Deleted');
};
