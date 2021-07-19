import { Groups } from '../../../models/company-employees/groups';

describe('Company Employees - Groups Page', () => {
  let groupsDetails: Groups;

  before(() => {
    cy.fixture('company-employees/groups').then((group) => {
      groupsDetails = group;
    });
  });

  beforeEach(() => {
    cy.loginAgent();
    cy.visit('/people-management/groups');
  });

  it('should "Groups" be displayed in side bar', () => {
    cy.get('dib-navbar dib-hamburger-icon').click();
    cy.get('.cdk-overlay-container dib-navbar-panel').contains('Groups');
  });

  it('should allow agent to add new group', () => {
    cy.get('dib-people-management dib-groups ui-button button').contains('Add Group').click();
    cy.get('.cdk-overlay-container dib-group-dialog input[placeholder="group name*"]').type(groupsDetails.name);
    cy.get('.cdk-overlay-container dib-group-dialog dib-assign-members .members label').click();
    cy.get('.cdk-overlay-container dib-group-dialog ui-button button').contains('save').click();
    cy.get('dib-people-management dib-groups .body').should('contain', groupsDetails.name);
  });

  it('should allow agent to edit created group', () => {
    cy.get('dib-people-management dib-groups dib-expandable-item h2')
      .contains(groupsDetails.name)
      .parents('.item__main')
      .next()
      .contains('edit')
      .click();
    cy.get('.cdk-overlay-container dib-group-dialog input[placeholder="group name*"]')
      .clear()
      .type(groupsDetails.editName);
    cy.get('.cdk-overlay-container dib-group-dialog ui-button button').contains('save').click();
    cy.get('dib-people-management dib-groups .body').should('contain', groupsDetails.editName);
  });

  it('should allow agent to delete created group', () => {
    cy.get('dib-people-management dib-groups dib-expandable-item h2')
      .contains(groupsDetails.editName)
      .parents('.item__main')
      .next()
      .contains('delete')
      .click();
    cy.get('.cdk-overlay-container confirmation-dialog ui-button button').contains('Delete').click();
  });
});
