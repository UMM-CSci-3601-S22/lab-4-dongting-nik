import {Todo} from 'src/app/todos/todo-list/todo';

export class AddTodoPage {
  navigateTo() {
    return cy.visit('/todos/new');
  }

  getTodoTitle() {
    return cy.get('.add-todo-title');
  }

  addTodoButton() {
    return cy.get('[data-test=confirmAddTodoButton]');
  }

  selectMatSelectValue(select: Cypress.Chainable, value: string) {
    // Find and click the drop down
    return select.click()
      // Select and click the desired value from the resulting menu
      .get(`mat-option[value="${value}"]`).click();
  }

  getFormField(fieldName: string) {
    return cy.get(`mat-form-field [formcontrolname=${fieldName}]`);
  }

  addTodo(newTodo: Todo) {
    this.getFormField('owner').type(newTodo.owner);
    this.selectMatSelectValue(this.getFormField('status'), newTodo.status.toString());
    this.getFormField('body').type(newTodo.body);
    this.getFormField('category').type(newTodo.category);
    return this.addTodoButton().click();
  }
}
