import { DibTravelAccounts, ProfileDetails, TravelSettings } from '@cy/models';
import {
  addHotelTravelPolicy,
  cancelDeleteDialogAndConfirm,
  closeEditDialogAndConfirm,
  deleteTravelPolicyAndConfirm,
  editTravelPolicy,
} from './shared';

describe('Company Settings - Travel Settings - Travel Policy - Hotel', () => {
  let accounts: DibTravelAccounts;
  let travelPolicyDetails: TravelSettings;
  let profileDetails: ProfileDetails;

  before(() => {
    cy.fixture('dib-travel-accounts').then((accountsFixture) => {
      accounts = accountsFixture;
    });

    cy.fixture('company-settings/travel-settings-details').then((travelPolicyDetailsFixture) => {
      travelPolicyDetails = travelPolicyDetailsFixture;
    });

    cy.fixture('personal-settings/profile-details').then((profileDetailsFixture) => {
      profileDetails = profileDetailsFixture;
    });
  });

  // TODO: Rethink a better way to execute prepare data actions instead of duplicated `before()`
  // Maybe load multiple fixtures and then execute prepare actions
  // eslint-disable-next-line mocha/no-sibling-hooks
  before(() => {
    cy.changeAccountCurrency(profileDetails.localize.currency);
  });

  beforeEach(() => {
    cy.login();
    cy.visitAngularUrl('/company-management/travel-settings');
  });

  it('should add hotel travel policy', () => {
    addHotelTravelPolicy(travelPolicyDetails, accounts.defaultAccount);

    cy.get('.cdk-overlay-container dib-travel-policy-dialog input[name=numberOfDaysInAdvance]').type(
      travelPolicyDetails.sharedDetails.numberOfDaysInAdvance
    );
    cy.get('.cdk-overlay-container simple-snack-bar > span').should(
      'have.text',
      'Travel policy for hotel successfully created.'
    );
    cy.get('dib-company-management dib-travel-policy dib-expandable-item .section__header__title').should(
      'contain',
      travelPolicyDetails.sharedDetails.name
    );
  });

  it('should close edit form for hotel travel policy', () => {
    closeEditDialogAndConfirm(travelPolicyDetails);
  });

  it('should update hotel travel policy', () => {
    editTravelPolicy(travelPolicyDetails);

    cy.get('.cdk-overlay-container dib-travel-policy-dialog input[name=numberOfDaysInAdvance]')
      .clear()
      .type(travelPolicyDetails.sharedDetails.modifiedNumberOfDaysInAdvance);
    cy.get('.cdk-overlay-container dib-travel-policy-dialog star-rating').next().click();
    cy.get('.cdk-overlay-container dib-travel-policy-dialog .google-places-autocomplete-input')
      .clear()
      .type(travelPolicyDetails.hotel.modifiedCity);
    cy.get('.pac-container .pac-item').contains(travelPolicyDetails.hotel.modifiedCity).click();
    cy.get('.cdk-overlay-container dib-travel-policy-dialog .item dib-list-item input[placeholder="Budget per night"]')
      .clear()
      .type(travelPolicyDetails.hotel.modifiedBudgetPerNight);

    cy.get('.cdk-overlay-container dib-travel-policy-dialog ui-button[type=success]').click();

    cy.get('.cdk-overlay-container simple-snack-bar > span').should(
      'have.text',
      'Travel policy for hotel successfully updated.'
    );
    cy.get('dib-company-management dib-travel-policy dib-expandable-item .section__header__title').should(
      'contain',
      travelPolicyDetails.sharedDetails.modifiedName
    );
  });

  it('should expand hotel travel policy and display all details', () => {
    cy.waitForAngular();

    cy.get('dib-company-management dib-travel-policy dib-expandable-item')
      .contains(travelPolicyDetails.sharedDetails.modifiedName)
      .parents('dib-expandable-item')
      .find('.collapsed i')
      .last()
      .click();

    cy.get('dib-company-management dib-travel-policy dib-expandable-item .section__item')
      .should(
        'contain',
        'Hotels should be booked more than ' +
          `${travelPolicyDetails.sharedDetails.modifiedNumberOfDaysInAdvance}` +
          ' days in advance of check-in date'
      )
      .should('contain', travelPolicyDetails.sharedDetails.modifiedBudget)
      .should('contain', travelPolicyDetails.hotel.modifiedBudgetPerNight)
      .should('contain', `${accounts.defaultAccount.firstName} ${accounts.defaultAccount.lastName}`);
    cy.get('dib-company-management dib-expandable-item dib-star-rating i').should('have.length', 5);
  });

  it('should check cancellation of confirmation dialog', () => {
    cancelDeleteDialogAndConfirm(travelPolicyDetails);
  });

  it('should delete hotel travel policy', () => {
    deleteTravelPolicyAndConfirm(travelPolicyDetails.sharedDetails.modifiedName);
  });
});
