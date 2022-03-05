

export class TodoListPage {
  navigateTo() {
    return cy.visit('/todos');
  }

  getUrl() {
    return cy.url();
  }

  getTodoTitle() {
    return cy.get('.todo-list-title');
  }

  getTodoCards() {
    return cy.get('.todo-cards-container app-todo-card');
  }

  getTodoListItems() {
    return cy.get('.todo-nav-list .todo-list-item');
  }

  /**
   * Clicks the "view profile" button for the given todo card.
   * Requires being in the "card" view.
   *
   * @param card The todo card
   */
  clickViewProfile(card: Cypress.Chainable<JQuery<HTMLElement>>) {
    return card.find<HTMLButtonElement>('[data-test=viewProfileButton]').click();
  }

  /**
   * Change the view of todos.
   *
   * @param viewType Which view type to change to: "card" or "list".
   */
  changeView(viewType: 'card' | 'list') {
    return cy.get(`[data-test=viewTypeRadio] .mat-radio-button[value="${viewType}"]`).click();
  }

  /**
   * Selects a role to filter in the "Status" selector.
   *
   * @param value The role *value* to select, this is what's found in the mat-option "value" attribute.
   */
  selectStatus(value: 'complete' | 'incomplete') {
    if (value === 'complete') {
      return cy.get('[data-test=todoStatusSelect]').click()
      // Select and click the desired value from the resulting menu
      .get(`mat-option[value="true"]`).click();
    };

    if (value === 'incomplete') {
      return cy.get('[data-test=todoStatusSelect]').click()
      // Select and click the desired value from the resulting menu
      .get(`mat-option[value="false"]`).click();
    };

  //   // Find and click the drop down
  //   return cy.get('[data-test=todoStatusSelect]').click()
  //     // Select and click the desired value from the resulting menu
  //     .get(`mat-option[value="${value}"]`).click();
  }

  addTodoButton() {
    return cy.get('[data-test=addTodoButton]');
  }
}
