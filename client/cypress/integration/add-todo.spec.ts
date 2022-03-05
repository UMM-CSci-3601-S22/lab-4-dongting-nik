import { Todo } from 'src/app/todos/todo-list/todo';
import { AddTodoPage } from '../support/add-todo.po';

describe('Add todo', () => {
  const page = new AddTodoPage();

  beforeEach(() => {
    page.navigateTo();
  });

  it('Should have the correct title', () => {
    page.getTodoTitle().should('have.text', 'New Todo');
  });

  it('Should enable and disable the add todo button', () => {
    // ADD TODO button should be disabled until all the necessary fields
    // are filled. Once the last (`#categoryField`) is filled, then the button should
    // become enabled.
    page.addTodoButton().should('be.disabled');
    page.getFormField('owner').type('TestOne');
    page.addTodoButton().should('be.disabled');
    page.selectMatSelectValue(page.getFormField('status'), 'true');
    page.addTodoButton().should('be.disabled');
    page.getFormField('body').type('This is test one');
    page.addTodoButton().should('be.disabled');
    page.getFormField('category').type('Test One');
    page.addTodoButton().should('be.enabled');
  });

  it('Should show error messages for invalid inputs', () => {
    // Before doing anything there shouldn't be an error
    cy.get('[data-test=ownerError]').should('not.exist');
    // Just clicking the owner field without entering anything should cause an error message
    page.getFormField('owner').click().blur();
    cy.get('[data-test=ownerError]').should('exist').and('be.visible');
    // Some more tests for various invalid owner inputs
    page.getFormField('owner').type('J').blur();
    cy.get('[data-test=ownerError]').should('exist').and('be.visible');
    page.getFormField('owner').clear().type(
      'This is a very very very very very very very very very very very very very very long owner that goes beyond the 100 character limit')
      .blur();
    cy.get('[data-test=ownerError]').should('exist').and('be.visible');
    // Entering a valid owner should remove the error.
    page.getFormField('owner').clear().type('Test One').blur();
    cy.get('[data-test=ownerError]').should('not.exist');

    // Before doing anything there shouldn't be an error
    cy.get('[data-test=statusError]').should('not.exist');
    // Some more tests for various invalid body inputs
    page.selectMatSelectValue(page.getFormField('status'), 'true');
    cy.get('[data-test=statusError]').should('not.exist');

    // Before doing anything there shouldn't be an error
    cy.get('[data-test=bodyError]').should('not.exist');
    // Just clicking the body field without entering anything should cause an error message
    page.getFormField('body').click().blur();
    cy.get('[data-test=bodyError]').should('exist').and('be.visible');
    // Some more tests for various invalid body inputs
    page.getFormField('body').type('J').blur();
    cy.get('[data-test=bodyError]').should('exist').and('be.visible');
    // Entering a valid category should remove the error.
    page.getFormField('body').clear().type('This is test one').blur();
    cy.get('[data-test=bodyError]').should('not.exist');

    // Before doing anything there shouldn't be an error
    cy.get('[data-test=categoryError]').should('not.exist');
    // Just clicking the category field without entering anything should cause an error message
    page.getFormField('category').click().blur();
    cy.get('[data-test=categoryError]').should('exist').and('be.visible');
    // Some more tests for various invalid category inputs
    page.getFormField('category').type('J').blur();
    cy.get('[data-test=categoryError]').should('exist').and('be.visible');
    page.getFormField('category').clear().type(
      'This is a very long category that goes beyond the 50 character limit')
      .blur();
    cy.get('[data-test=categoryError]').should('exist').and('be.visible');
    // Entering a valid category should remove the error.
    page.getFormField('category').clear().type('Test One').blur();
    cy.get('[data-test=categoryError]').should('not.exist');
  });


  describe('Adding a new todo', () => {

    beforeEach(() => {
      cy.task('seed:database');
    });

    it('Should go to the right page, and have the right info', () => {
      const todo: Todo = {
        _id: null,
        owner: 'TestOne',
        status: true,
        body: 'This is the test one',
        category: 'test one'
      };

      page.addTodo(todo);

      // New URL should end in the 24 hex character Mongo ID of the newly added todo
      cy.url()
        .should('match', /\/todos\/[0-9a-fA-F]{24}$/)
        .should('not.match', /\/todos\/new$/);

      // The new todo should have all the same attributes as we entered
      cy.get('.todo-card-owner').should('have.text', todo.owner);
      cy.get('.todo-card-status').should('contain', 'Complete');
      cy.get('.todo-card-body').should('have.text', todo.body);
      cy.get('.todo-card-category').should('have.text', todo.category);

      // We should see the confirmation message at the bottom of the screen
      cy.get('.mat-simple-snackbar').should('contain', `Added Todo ${todo.owner}`);
    });
  });
});
