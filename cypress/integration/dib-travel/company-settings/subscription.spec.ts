import { getEmailWithHash } from '@cy/helpers';
import { Group, PaymentMethod } from '@cy/models';
import { addGroup, deleteGroup } from '../company-employees';
import {
  addBillingProfile,
  archiveBillingProfile,
  cancelAddBillingProfile,
  clickBillingProfileCtaAction,
  submitEmptyForm,
} from './payment-method/helpers';

describe('Company Settings - Subscription', () => {
  let paymentMethod: PaymentMethod;
  let group: Group;

  const subscriptionLink = '/company-management/subscription/';

  before(() => {
    cy.fixture('company-employees/group').then((groupFixture) => {
      group = groupFixture;
    });

    cy.fixture('company-settings/payment-method').then((paymentMethodFixture) => {
      paymentMethod = {
        ...paymentMethodFixture,
        primaryContact: {
          ...paymentMethodFixture.primaryContact,
          email: getEmailWithHash(paymentMethodFixture.primaryContact.email),
          modifiedEmail: getEmailWithHash(paymentMethodFixture.primaryContact.modifiedEmail),
        },
        invoiceRecipient: {
          ...paymentMethodFixture.invoiceRecipient,
          email: getEmailWithHash(paymentMethodFixture.invoiceRecipient.email),
          modifiedEmail: getEmailWithHash(paymentMethodFixture.invoiceRecipient.modifiedEmail),
        },
      };
    });
  });

  // eslint-disable-next-line mocha/no-sibling-hooks
  before(() => {
    cy.login();
    cy.visit('/people-management/groups');

    addGroup(group.name, group.description, false);

    cy.resetState();
  });

  after(() => {
    cy.resetState();

    cy.login();
    cy.visit('/people-management/groups');

    cy.waitForAngular();

    deleteGroup(group.name);
  });

  beforeEach(() => {
    cy.login();
    cy.visit(subscriptionLink);
  });

  it('should display "Subscription" in the sidebar navigation', () => {
    cy.get('dib-navbar dib-hamburger-icon').click();

    cy.get('.cdk-overlay-container dib-navbar-panel').contains('Subscription').should('exist');
  });

  it('should check overview tab for subscription', () => {
    cy.get('dib-company-management dib-subscription dib-subscription-overview h3')
      .should('contain', 'Pricing plans')
      .should('contain', 'Licenses')
      .should('contain', 'Renewal date')
      .should('contain', 'Renewal subscription');
    cy.get('dib-company-management dib-subscription dib-subscription-overview .table-row p').should(
      'contain',
      ' Business Pro '
    );
    cy.get('dib-company-management dib-subscription dib-subscription-overview .table-row a').should(
      'contain',
      'Apr 2, 2022'
    );
    cy.get('dib-company-management dib-subscription dib-subscription-overview .table-footer span').should(
      'have.text',
      'For any questions regarding your subscription '
    );
    cy.get('dib-company-management dib-subscription dib-subscription-overview .table-footer a').should(
      'have.text',
      ' contact us '
    );
  });

  it('should check pricing plans tab for subscription', () => {
    cy.visit(subscriptionLink + 'pricing-plans');

    cy.get('dib-company-management dib-subscription dib-subscription-pricing-plans h3')
      .should('contain', ' Business Pro')
      .should('contain', 'Enterprise');
    cy.get('dib-company-management dib-subscription dib-subscription-pricing-plans .subscription-table small').should(
      'contain',
      'Subscription renewal date: Apr 2, 2022 (148  days from now) '
    );
    cy.get('dib-company-management dib-subscription dib-subscription-pricing-plans button').should(
      'contain',
      ' Contact us '
    );
    cy.get('dib-company-management dib-subscription dib-subscription-pricing-plans .subscription-table span')
      .should('contain', 'See our ')
      .should('contain', ' for more information or');
    cy.get('dib-company-management dib-subscription dib-subscription-pricing-plans .subscription-table a')
      .should('contain', 'detailed pricing page ')
      .should('contain', ' contact us ');
  });

  it('should cancel form for Request Enterprise plan', () => {
    cy.visit(subscriptionLink + 'pricing-plans');

    cy.get('dib-company-management dib-subscription dib-subscription-pricing-plans button')
      .contains(' Contact us ')
      .click();

    cy.get('.cdk-overlay-container dib-request-enterprise-dialog h2').should('contain', 'Request Enterprise plan');
    cy.get('.cdk-overlay-container dib-request-enterprise-dialog p').should(
      'contain',
      'Please fill in this form and we will contact you shortly. Thank you.'
    );

    cy.get('.cdk-overlay-container dib-request-enterprise-dialog button').contains(' Cancel ').click();

    cy.get('.cdk-overlay-container dib-request-enterprise-dialog').should('not.exist');
  });

  it('should send request for Enterprise plan', () => {
    cy.visit(subscriptionLink + 'pricing-plans');

    cy.get('dib-company-management dib-subscription dib-subscription-pricing-plans button')
      .contains(' Contact us ')
      .click();
    cy.get('.cdk-overlay-container dib-request-enterprise-dialog button').contains(' Submit ').click();

    cy.get('.cdk-overlay-container simple-snack-bar > span').should(
      'contain',
      'Thank you for contacting us, we will respond as soon as possible.'
    );
    cy.get('.cdk-overlay-container dib-request-enterprise-dialog').should('not.exist');
  });

  it('should check licenses tab for subscription', () => {
    cy.visit(subscriptionLink + 'licenses');

    cy.get('dib-company-management dib-subscription dib-subscription-licenses h3')
      .should('contain', ' Number of Licenses ')
      .should('contain', ' Additional Licenses ');
    cy.get('dib-company-management dib-subscription dib-subscription-licenses p')
      .should('contain', ' Subscription renewal date: Apr 2, 2022 (148  days from now) ')
      .should('contain', ' 72 EUR per user ')
      .should('contain', ' 8 ');
    cy.get('dib-company-management dib-subscription dib-subscription-licenses .subscription-table__row__pricing')
      .should('contain', ' 1 x 72 EUR = 72 EUR ')
      .should('contain', ' Total cost: 72 EUR ');
  });

  it('should increment/decrement number of licenses', () => {
    cy.visit(subscriptionLink + 'licenses');

    cy.get('dib-company-management dib-subscription dib-subscription-licenses button i').contains('add').click();

    cy.get('dib-company-management dib-subscription dib-subscription-licenses input').should('have.value', '2');

    cy.get('dib-company-management dib-subscription dib-subscription-licenses button i').contains('remove').click();

    cy.get('dib-company-management dib-subscription dib-subscription-licenses input').should('have.value', '1');
  });

  it('should cancel confirmation dialog for buying license', () => {
    cy.visit(subscriptionLink + 'licenses');

    cy.get('dib-company-management dib-subscription dib-subscription-licenses ui-button').contains('Buy now').click();

    cy.get('.cdk-overlay-container confirmation-dialog button').contains(' No ').click();

    cy.get('.cdk-overlay-container confirmation-dialog').should('not.exist');
  });

  it('should buy license for subscription', () => {
    cy.visit(subscriptionLink + 'licenses');

    cy.get('dib-company-management dib-subscription dib-subscription-licenses ui-button').contains('Buy now').click();

    cy.get('.cdk-overlay-container confirmation-dialog button').contains(' Buy ').click();

    cy.get('.cdk-overlay-container simple-snack-bar > span').should('contain', 'Purchase completed successfully');
  });

  it('should cancel form for adding billing profile', () => {
    cy.visit(subscriptionLink + 'payment-method');

    cy.get('dib-company-management dib-subscription dib-subscription-payment-method span')
      .contains(' Add New Billing Profile ')
      .click();

    cancelAddBillingProfile();
  });

  it('should not be able to submit an empty billing profile form', () => {
    cy.visit(subscriptionLink + 'payment-method');

    cy.get('dib-company-management dib-subscription dib-subscription-payment-method span')
      .contains(' Add New Billing Profile ')
      .click();

    submitEmptyForm();
  });

  it('should add a billing profile', () => {
    cy.visit(subscriptionLink + 'payment-method');

    cy.get('dib-company-management dib-subscription dib-subscription-payment-method span')
      .contains(' Add New Billing Profile ')
      .click();

    addBillingProfile(paymentMethod);

    cy.visit('/company-management/payment-method/billing-profiles');

    cy.get('dib-company-management dib-payment-method dib-billing-profiles dib-item .content')
      .should('contain', paymentMethod.companyInformation.taxId)
      .should('contain', paymentMethod.primaryContact.firstName)
      .should('contain', paymentMethod.primaryContact.lastName)
      .should('contain', paymentMethod.primaryContact.email)
      .should('contain', paymentMethod.companyInformation.address)
      .should('contain', 1)
      .should('contain', paymentMethod.currency.originalCurrency)
      .should('contain', paymentMethod.invoiceRecipient.email)
      .should('contain', paymentMethod.invoiceRecipient.vatNumber);

    clickBillingProfileCtaAction(paymentMethod.primaryContact.email, 'Archive ');
    archiveBillingProfile();
  });
});
