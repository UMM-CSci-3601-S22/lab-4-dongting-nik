import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Todo } from '../app/todos/todo-list/todo';
import { TodoService } from '../app/todos/todo.service';

/**
 * A "mock" version of the `TodoService` that can be used to test components
 * without having to create an actual service.
 */
// It needs to be `Injectable` since that's how services are typically
// provided to components.
@Injectable()
export class MockTodoService extends TodoService {
  static testTodos: Todo[] = [
    {
      _id: 'testOne_id',
      owner: 'TestOne',
      status: true,
      body: 'This is the test one',
      category: 'test one'
    },
    {
      _id: 'testTwo_id',
      owner: 'TestTwo',
      status: true,
      body: 'This is the test two',
      category: 'test two'
    },
    {
      _id: 'testThree_id',
      owner: 'TestThree',
      status: false,
      body: 'This is the test three',
      category: 'test three'
    }
  ];

  constructor() {
    super(null);
  }

  getTodos(filters: { owner?: string; category?: string; body?: string }): Observable<Todo[]> {
    // Our goal here isn't to test (and thus rewrite) the service, so we'll
    // keep it simple and just return the test users regardless of what
    // filters are passed in.
    //
    // The `of()` function converts a regular object or value into an
    // `Observable` of that object or value.
    return of(MockTodoService.testTodos);
  }

  getTodoById(id: string): Observable<Todo> {
    // If the specified ID is for the first test user,
    // return that user, otherwise return `null` so
    // we can test illegal user requests.
    if (id === MockTodoService.testTodos[0]._id) {
      return of(MockTodoService.testTodos[0]);
    } else {
      return of(null);
    }
  }

}
