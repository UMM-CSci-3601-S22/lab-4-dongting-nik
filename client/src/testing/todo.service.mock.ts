import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Todo } from '../app/todos';
import { TodoService } from '../app/todos/todo.service';

/**
 * A "mock" version of the `UserService` that can be used to test components
 * without having to create an actual service.
 */
// It needs to be `Injectable` since that's how services are typically
// provided to components.
@Injectable()
export class MockTodoService extends TodoService {
  static testUsers: Todo[] = [
    {
      _id: 'chris_id',
      owner: 'Chris',
      category: 'homework',
      body: 'Ipsum esse est ullamco magna',
      status: 'complete',
    },
    {
      _id: 'pat_id',
      name: 'Pat',
      age: 37,
      company: 'IBM',
      email: 'pat@something.com',
      role: 'editor',
      avatar: 'https://gravatar.com/avatar/b42a11826c3bde672bce7e06ad729d44?d=identicon'
    },
    {
      _id: 'jamie_id',
      name: 'Jamie',
      age: 37,
      company: 'Frogs, Inc.',
      email: 'jamie@frogs.com',
      role: 'viewer',
      avatar: 'https://gravatar.com/avatar/d4a6c71dd9470ad4cf58f78c100258bf?d=identicon'
    }
  ];

  constructor() {
    super(null);
  }

  getUsers(filters: { owner?: string; category?: string; body?: string }): Observable<Todo[]> {
    // Our goal here isn't to test (and thus rewrite) the service, so we'll
    // keep it simple and just return the test users regardless of what
    // filters are passed in.
    //
    // The `of()` function converts a regular object or value into an
    // `Observable` of that object or value.
    return of(MockTodoService.testTodos);
  }

  getUserById(id: string): Observable<User> {
    // If the specified ID is for the first test user,
    // return that user, otherwise return `null` so
    // we can test illegal user requests.
    if (id === MockUserService.testUsers[0]._id) {
      return of(MockUserService.testUsers[0]);
    } else {
      return of(null);
    }
  }

}
