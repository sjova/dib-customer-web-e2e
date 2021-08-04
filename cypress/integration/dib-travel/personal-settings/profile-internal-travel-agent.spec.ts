import { ProfileDetails } from '../../../models';
import { getEmailWithHash } from '../../../helpers';
import { addEmployee, archiveEmployee } from '../company-employees';

describe('Personal Settings - Profile - Internal Travel Agent', () => {
  let profileDetails: ProfileDetails;

  before(() => {
    cy.fixture('personal-settings/profile-details').then((profileDetailsFixture) => {
      profileDetails = {
        ...profileDetailsFixture,
        internalTravelAgent: {
          ...profileDetailsFixture.internalTravelAgent,
          email: getEmailWithHash(profileDetailsFixture.internalTravelAgent.email),
        },
      };
    });
  });

  beforeEach(() => {
    cy.login();
  });

  it('should add Internal travel agent', () => {
    cy.visit('/people-management/employees');
    addEmployee(
      profileDetails.internalTravelAgent.firstName,
      profileDetails.internalTravelAgent.lastName,
      profileDetails.internalTravelAgent.email
    );

    cy.visit('/profile/account');

    cy.intercept('GET', '/api/secure/v1/corporations/*/employees').as('getEmployees');
    cy.intercept('POST', '/api/secure/v1/customers/*/internal-travel-agents').as('postInternalTravelAgents');

    cy.wait('@getEmployees');

    // Fix custom delay in FE implementation
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(1000);

    cy.get('dib-profile dib-account dib-internal-agents ui-button').contains('Add').click();

    cy.get('.cdk-overlay-container dib-internal-agents-dialog dib-assign-members .member .user')
      .contains(`${profileDetails.internalTravelAgent.firstName} ${profileDetails.internalTravelAgent.lastName}`)
      .click();
    cy.get('.cdk-overlay-container dib-internal-agents-dialog ui-button').contains('Add').click();

    cy.wait('@postInternalTravelAgents');

    cy.get('dib-profile dib-account dib-internal-agents .--first').should(
      'contain',
      `${profileDetails.internalTravelAgent.firstName} ${profileDetails.internalTravelAgent.lastName}`
    );
  });

  it('should delete Internal travel agent', () => {
    cy.visit('/profile/account');

    cy.intercept('GET', '/api/secure/v1/corporations/*/employees').as('getEmployees');
    cy.intercept('POST', '/api/secure/v1/customers/*/internal-travel-agents').as('postInternalTravelAgents');

    cy.wait('@getEmployees');

    // Fix custom delay in FE implementation
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(1000);

    cy.get('dib-profile dib-account dib-internal-agents .--first')
      .contains(`${profileDetails.internalTravelAgent.firstName} ${profileDetails.internalTravelAgent.lastName}`)
      .next('.--middle')
      .next('.--last')
      .find('ui-button')
      .click();

    cy.wait('@postInternalTravelAgents');

    cy.get('dib-profile dib-account dib-internal-agents').should(
      'not.contain',
      `${profileDetails.internalTravelAgent.firstName} ${profileDetails.internalTravelAgent.lastName}`
    );

    cy.visit('/people-management/employees');
    archiveEmployee(profileDetails.internalTravelAgent.email);
  });
});