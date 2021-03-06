import { getEmailWithHash, getTestingEnvironment } from '@cy/helpers';
import { DibTravelAccounts, Group, PaymentMethod } from '@cy/models';
import { addGroup, deleteGroup } from '../company-employees';
import {
  addBillingProfile,
  archiveBillingProfile,
  cancelAddingBillingProfile,
  clickBillingProfileCtaAction,
  submitEmptyBillingProfileFormAndConfirm,
} from './payment-method/helpers';

describe('Company Settings - Subscription', () => {
  let accounts: DibTravelAccounts;

  let paymentMethod: PaymentMethod;
  let group: Group;

  let testingEnvironment: string;

  let subscriptionRenewalDate: string;
  let subscriptionValidDate: string;
  let subscriptionStartDate: string;
  let subscriptionEndDate: string;

  const subscriptionBaseLink = '/company-management/subscription';

  before(() => {
    testingEnvironment = getTestingEnvironment();
    if (testingEnvironment === 'staging') {
      subscriptionRenewalDate = 'Jun 24, 2022';
      subscriptionValidDate = 'Jun 23, 2022';
      subscriptionStartDate = 'Jun 24, 2021';
      subscriptionEndDate = 'Jan 21, 2022';
    } else if (testingEnvironment === 'ci') {
      subscriptionRenewalDate = 'Apr 2, 2022';
      subscriptionValidDate = 'Apr 01, 2022';
      subscriptionStartDate = 'Apr 2, 2021';
      subscriptionEndDate = 'Nov 18, 2021';
    } else {
      // TODO: Revisit this on production
    }

    cy.fixture('dib-travel-accounts').then((accountsFixture) => {
      accounts = accountsFixture;
    });

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

  // TODO: Rethink a better way to execute prepare data actions instead of duplicated `before()`
  // Maybe load multiple fixtures and then execute prepare actions
  // eslint-disable-next-line mocha/no-sibling-hooks
  before(() => {
    cy.login();
    cy.visitAngularUrl('/people-management/groups');

    addGroup(
      group.name,
      group.description,
      `${accounts.defaultAccount.firstName} ${accounts.defaultAccount.lastName}`,
      false
    );
  });

  after(() => {
    cy.login();

    cy.visitAngularUrl('/people-management/groups');

    cy.waitForAngular();

    deleteGroup(group.name);
  });

  beforeEach(() => {
    cy.login();
    cy.visitAngularUrl(subscriptionBaseLink);
  });

  it('should display "Subscription" in the sidebar navigation', () => {
    cy.get('dib-navbar dib-hamburger-icon').click();

    cy.get('.cdk-overlay-container dib-navbar-panel').contains('Subscription').should('exist');
  });

  // TODO: Revisit under the hood logic behind current values
  it('should check Overview tab', () => {
    cy.get('dib-company-management dib-subscription dib-subscription-overview h3')
      .should('contain', 'Pricing plans')
      .should('contain', 'Licenses')
      .should('contain', 'Renewal date')
      .should('contain', 'Renewal subscription');

    if (
      accounts.defaultAccount.firstName === 'CYQA' &&
      accounts.defaultAccount.lastName === 'Bot' &&
      accounts.defaultAccount.email === 'qa.tools@dibtravel.com'
    ) {
      cy.get('dib-company-management dib-subscription dib-subscription-overview .table-row p')
        .should('contain', ' Business Pro ')
        .should('contain', subscriptionRenewalDate);
    }

    cy.get('dib-company-management dib-subscription dib-subscription-overview .row-value')
      .eq(1)
      .invoke('text')
      .then((numberOfLicenses) => {
        cy.visitAngularUrl(`${subscriptionBaseLink}/licenses`);

        cy.get(
          'dib-company-management dib-subscription dib-subscription-licenses .subscription-table__row__value'
        ).should('contain', numberOfLicenses);
      });

    cy.visitAngularUrl(`${subscriptionBaseLink}/overview`);

    cy.get('dib-company-management dib-subscription dib-subscription-overview .table-footer span').should(
      'have.text',
      'For any questions regarding your subscription '
    );
    cy.get('dib-company-management dib-subscription dib-subscription-overview .table-footer a').should(
      'have.text',
      ' contact us '
    );
  });

  // TODO: Revisit under the hood logic behind current values
  it('should check Pricing Plans tab', () => {
    cy.visitAngularUrl(`${subscriptionBaseLink}/pricing-plans`);

    cy.get('dib-company-management dib-subscription dib-subscription-pricing-plans h3')
      .should('contain', ' Business Pro')
      .should('contain', 'Enterprise');

    if (
      accounts.defaultAccount.firstName === 'CYQA' &&
      accounts.defaultAccount.lastName === 'Bot' &&
      accounts.defaultAccount.email === 'qa.tools@dibtravel.com'
    ) {
      cy.get('dib-company-management dib-subscription dib-subscription-pricing-plans .subscription-table small').should(
        'contain',
        `Subscription renewal date: ${subscriptionRenewalDate}`,
        ' (days from now) '
      );
    }
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
    cy.visitAngularUrl(`${subscriptionBaseLink}/pricing-plans`);

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
    cy.visitAngularUrl(`${subscriptionBaseLink}/pricing-plans`);

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

  // TODO: Revisit under the hood logic behind current values
  // TODO: We need to do the internal calculation and to compare values (calculated vs. displayed)
  it('should check Licenses tab', () => {
    cy.visitAngularUrl(`${subscriptionBaseLink}/licenses`);

    cy.get('dib-company-management dib-subscription dib-subscription-licenses h3')
      .should('contain', ' Number of Licenses ')
      .should('contain', ' Additional Licenses ');

    if (
      accounts.defaultAccount.firstName === 'CYQA' &&
      accounts.defaultAccount.lastName === 'Bot' &&
      accounts.defaultAccount.email === 'qa.tools@dibtravel.com'
    ) {
      cy.get('dib-company-management dib-subscription dib-subscription-licenses p')
        .should('contain', ` Subscription renewal date: ${subscriptionRenewalDate}`, ' (days from now) ')
        .should('contain', ' 72 EUR per user ');

      cy.get('dib-company-management dib-subscription dib-subscription-licenses .subscription-table__row__pricing')
        .should('contain', ' 1 x 72 EUR = 72 EUR ')
        .should('contain', ' Total cost: 72 EUR ');
    }

    cy.get('dib-company-management dib-subscription dib-subscription-licenses dib-tooltip:first')
      .invoke('show')
      .contains('info_outline')
      .trigger('mouseover', 'bottom')
      .click();

    if (
      accounts.defaultAccount.firstName === 'CYQA' &&
      accounts.defaultAccount.lastName === 'Bot' &&
      accounts.defaultAccount.email === 'qa.tools@dibtravel.com'
    ) {
      cy.get('.tooltip-content').should(
        'contain',
        `Additional licenses will be valid until the ${subscriptionValidDate}, after which they will be automatically renewed.`
      );
    }
    cy.get('dib-company-management dib-subscription dib-subscription-licenses dib-tooltip')
      .eq(1)
      .invoke('show')
      .contains('info_outline')
      .trigger('mouseover', 'bottom')
      .click();
    cy.get('.tooltip-content').should('contain', 'Price of the next licence');
    cy.get('dib-company-management dib-subscription dib-subscription-licenses dib-tooltip:last')
      .invoke('show')
      .contains('info_outline')
      .trigger('mouseover', 'bottom')
      .click();
    cy.get('.tooltip-content').should(
      'contain',
      'If you purchase a license during a month, we will prorate the price on your first invoice'
    );
  });

  it('should increment/decrement number of licenses', () => {
    cy.visitAngularUrl(`${subscriptionBaseLink}/licenses`);

    cy.get('dib-company-management dib-subscription dib-subscription-licenses button i').contains('add').click();

    cy.get('dib-company-management dib-subscription dib-subscription-licenses input').should('have.value', '2');

    cy.get('dib-company-management dib-subscription dib-subscription-licenses button i').contains('remove').click();

    cy.get('dib-company-management dib-subscription dib-subscription-licenses input').should('have.value', '1');
  });

  it('should cancel confirmation dialog for buying new license', () => {
    cy.visitAngularUrl(`${subscriptionBaseLink}/licenses`);

    cy.get('dib-company-management dib-subscription dib-subscription-licenses ui-button').contains('Buy now').click();

    cy.get('.cdk-overlay-container confirmation-dialog button').contains(' No ').click();

    cy.get('.cdk-overlay-container confirmation-dialog').should('not.exist');
  });

  it('should buy a new license for subscription', () => {
    cy.visitAngularUrl(`${subscriptionBaseLink}/licenses`);

    cy.intercept('GET', '/api/secure/v2/corporations/*/subscriptions/current').as('currentSubscriptionState');

    cy.get('dib-company-management dib-subscription dib-subscription-licenses .subscription-table__row__value').then(
      (numberOfLicenses) => {
        const numberBeforePurchase = parseInt(numberOfLicenses.text());
        const numberAfterPurchase = parseInt(numberOfLicenses.text());

        cy.get('dib-company-management dib-subscription dib-subscription-licenses ui-button').contains('Buy').click();
        cy.get('.cdk-overlay-container confirmation-dialog button').contains(' Buy ').click();

        cy.get('.cdk-overlay-container simple-snack-bar > span')
          .invoke('text')
          .then((message) => {
            expect(message).to.be.oneOf(['Purchase completed successfully', 'Purchase could not be completed']);
          });

        cy.reload();

        cy.wait('@currentSubscriptionState').then(() => {
          if (numberBeforePurchase == numberBeforePurchase + 1) {
            expect(numberAfterPurchase).to.eq(numberBeforePurchase + 1);
          } else {
            expect(numberAfterPurchase).to.eq(numberBeforePurchase);
          }
        });
      }
    );
  });

  it('should cancel form for adding billing profile', () => {
    cy.visitAngularUrl(`${subscriptionBaseLink}/payment-method`);

    cy.get('dib-company-management dib-subscription dib-subscription-payment-method span')
      .contains(' Add New Billing Profile ')
      .click();

    cancelAddingBillingProfile();
  });

  it('should not be able to submit an empty billing profile form', () => {
    cy.visitAngularUrl(`${subscriptionBaseLink}/payment-method`);

    cy.get('dib-company-management dib-subscription dib-subscription-payment-method span')
      .contains(' Add New Billing Profile ')
      .click();

    submitEmptyBillingProfileFormAndConfirm();
  });

  // TODO: This should be revisited (more specific: `addBillingProfile` method)
  it('should add a billing profile', () => {
    cy.visitAngularUrl(`${subscriptionBaseLink}/payment-method`);

    cy.get('dib-company-management dib-subscription dib-subscription-payment-method span')
      .contains(' Add New Billing Profile ')
      .click();

    cy.waitForAngular();

    addBillingProfile(paymentMethod);

    cy.visitAngularUrl('/company-management/payment-method/billing-profiles');

    cy.get('dib-company-management dib-payment-method dib-billing-profiles dib-item .content')
      .should('contain', paymentMethod.companyInformation.taxId)
      .should('contain', paymentMethod.primaryContact.firstName)
      .should('contain', paymentMethod.primaryContact.lastName)
      .should('contain', paymentMethod.primaryContact.email)
      .should('contain', paymentMethod.companyInformation.address)
      .should('contain', 1)
      .should('contain', paymentMethod.currency.originalCurrency);
    // TODO: This should be discussed, because on the staging environment, we don't have section "INVOICE RECIPIENT E-MAIL AND VAT NUMBER"
    /*.should('contain', paymentMethod.invoiceRecipient.email)
      .should('contain', paymentMethod.invoiceRecipient.vatNumber);*/

    clickBillingProfileCtaAction(paymentMethod.primaryContact.email, 'Archive ');
    archiveBillingProfile(paymentMethod.primaryContact.email);
  });

  it('should check Purchase History tab', () => {
    cy.visitAngularUrl(`${subscriptionBaseLink}/purchase-history`);

    cy.get('dib-company-management dib-subscription dib-subscription-purchase-history p')
      .should('contain', ' Date ')
      .should('contain', ' Description ')
      .should('contain', ' Amount ')
      .should('contain', ' Status ')
      .should('contain', 'EUR', 'RSD')
      .should('contain', ' Completed ');

    if (
      accounts.defaultAccount.firstName === 'CYQA' &&
      accounts.defaultAccount.lastName === 'Bot' &&
      accounts.defaultAccount.email === 'qa.tools@dibtravel.com'
    ) {
      cy.get('dib-company-management dib-subscription dib-subscription-purchase-history p').should(
        'contain',
        subscriptionRenewalDate.substring(0, 3)
      );
      cy.get('dib-company-management dib-subscription dib-subscription-purchase-history p')
        .should(
          'contain',
          ' Upgrade to subscription plan BUSINESS PRO ANNUAL .',
          ' 1 license(s) have been added in [BUSINESS PRO] ANNUAL plan. '
        )
        .should(
          'contain',
          'License(s) added to subscription.',
          '1 license(s) have been added in [BUSINESS PRO] ANNUAL plan.'
        );
    }
  });

  it('should check pagination on Purchase History tab', () => {
    if (
      accounts.defaultAccount.firstName === 'CYQA' &&
      accounts.defaultAccount.lastName === 'Bot' &&
      accounts.defaultAccount.email === 'qa.tools@dibtravel.com'
    ) {
      cy.visitAngularUrl(`${subscriptionBaseLink}/purchase-history`);

      cy.get('dib-company-management dib-subscription dib-subscription-purchase-history page-pagination ul li')
        .contains('2')
        .click();

      cy.get('dib-company-management dib-subscription dib-subscription-purchase-history p').should(
        'contain',
        subscriptionEndDate
      );

      cy.get('dib-company-management dib-subscription dib-subscription-purchase-history page-pagination ul li')
        .contains('1')
        .click();

      cy.get('dib-company-management dib-subscription dib-subscription-purchase-history p').should(
        'contain',
        subscriptionStartDate
      );

      cy.get('dib-company-management dib-subscription dib-subscription-purchase-history page-pagination i')
        .contains('keyboard_arrow_right')
        .click();

      cy.get('dib-company-management dib-subscription dib-subscription-purchase-history p').should(
        'contain',
        subscriptionEndDate
      );

      cy.get('dib-company-management dib-subscription dib-subscription-purchase-history page-pagination i')
        .contains('keyboard_arrow_left')
        .click();

      cy.get('dib-company-management dib-subscription dib-subscription-purchase-history p').should(
        'contain',
        subscriptionStartDate
      );

      cy.get('dib-company-management dib-subscription dib-subscription-purchase-history page-pagination i')
        .contains('last_page')
        .click();

      cy.get('dib-company-management dib-subscription dib-subscription-purchase-history p').should(
        'not.contain',
        subscriptionStartDate
      );

      cy.get('dib-company-management dib-subscription dib-subscription-purchase-history page-pagination i')
        .contains('first_page')
        .click();

      cy.get('dib-company-management dib-subscription dib-subscription-purchase-history p').should(
        'contain',
        subscriptionStartDate
      );

      cy.get('dib-company-management dib-subscription dib-subscription-purchase-history page-pagination span')
        .contains('20')
        .click();

      cy.get('dib-company-management dib-subscription dib-subscription-purchase-history p').should(
        'contain',
        subscriptionStartDate,
        subscriptionEndDate
      );

      cy.reload();

      cy.get('dib-company-management dib-subscription dib-subscription-purchase-history p').should(
        'not.contain',
        subscriptionEndDate
      );
    }
  });
});
