import { DibTravelAccounts } from '../../../models';

describe('Sign In (Agent)', () => {
  let accounts: DibTravelAccounts;

  before(() => {
    cy.fixture('dib-travel-accounts').then((accountsFixture) => {
      accounts = accountsFixture;
    });
  });

  beforeEach(() => {
    cy.visit('/login');
    cy.get('new-login .auth-container-footer a[href="/login/agent"]').click();
  });

  it('should display error message when empty form is submitted', () => {
    cy.get('new-agent-login ui-button button').contains('Login').click();

    cy.get('new-agent-login ui-control-wrapper .error')
      .should('contain', 'Email is required')
      .should('contain', 'Password is required');
  });

  it('should display error message when wrong password is submitted', () => {
    cy.get('new-agent-login ui-input input[name=userEmail]').type(accounts.defaultAccount.email);
    cy.get('new-agent-login ui-input input[name=email]').type(accounts.agentAccount.email);
    cy.get('new-agent-login ui-input input[name=password]').type(accounts.invalidAccount.password);
    cy.get('new-agent-login ui-button button').click();

    cy.get('.cdk-overlay-container simple-snack-bar > span').should('contain', 'Invalid Credentials');
  });

  it('should display error message when invalid user email address is inserted', () => {
    const email = accounts.defaultAccount.email;
    const invalidEmail = email.replace('@', '');

    cy.get('new-agent-login ui-input input[name=userEmail]').type(invalidEmail);
    cy.get('new-agent-login ui-input input[name=email]').type(accounts.agentAccount.email);
    cy.get('new-agent-login ui-input input[name=password]').type(accounts.agentAccount.password);
    cy.get('new-agent-login ui-button button').click();

    cy.get('new-agent-login ui-input[type="email"] .error').should(
      'contain',
      'The email should be in email@example.com format'
    );
  });

  it('should display error message when invalid agent email address is inserted', () => {
    const email = accounts.defaultAccount.email;
    const invalidEmail = email.replace('@', '');

    cy.get('new-agent-login ui-input input[name=userEmail]').type(accounts.defaultAccount.email);
    cy.get('new-agent-login ui-input input[name=email]').type(invalidEmail);
    cy.get('new-agent-login ui-input input[name=password]').type(accounts.agentAccount.password);
    cy.get('new-agent-login ui-button button').click();

    cy.get('new-agent-login ui-input[type="email"] .error').should(
      'contain',
      'The email should be in email@example.com format'
    );
  });

  it('should display pop up error message when agent enters user email address that does not exist', () => {
    cy.get('new-agent-login ui-input input[name=userEmail]').type(accounts.agentAccount.email);
    cy.get('new-agent-login ui-input input[name=email]').type(accounts.invalidAccount.email);
    cy.get('new-agent-login ui-input input[name=password]').type(accounts.agentAccount.password);
    cy.get('new-agent-login ui-button button').click();

    cy.get('.cdk-overlay-container simple-snack-bar > span').should('contain', 'Invalid Credentials');
  });

  it('should allow agent to sign in with valid user credentials', () => {
    cy.get('new-agent-login ui-input input[name=userEmail]').clear().type(accounts.defaultAccount.email);
    cy.get('new-agent-login ui-input input[name=email]').clear().type(accounts.agentAccount.email);
    cy.get('new-agent-login ui-input input[name=password]').clear().type(accounts.agentAccount.password);
    cy.get('new-agent-login ui-button button').click();

    cy.get('[data-cy="navbar-my-travels-link"]').should('contain', 'My Travels');

    cy.get('dib-navbar dib-hamburger-icon').click();

    cy.get('.cdk-overlay-container dib-navbar-panel').should('contain', 'Log Out');
  });
});
