import { User } from '../../../../../models';

export const selectTraveler = (traveler: Pick<User, 'firstName' | 'lastName'>): void => {
  cy.get('.cdk-overlay-container dib-approval-process-dialog dib-input').first().type(traveler.firstName);

  cy.get('.cdk-overlay-container dib-approval-process-dialog .members .user')
    .first()
    .contains(`${traveler.firstName} ${traveler.lastName}`, {
      matchCase: false,
    })
    .click();
};