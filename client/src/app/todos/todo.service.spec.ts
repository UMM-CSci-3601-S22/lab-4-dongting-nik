import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Todo } from './todo-list/todo';
import { TodoService } from './todo.service';

describe('Todo service', () => {
  const testTodos: Todo[] = [
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
  let todoService: TodoService;
  // These are used to mock the HTTP requests so that we (a) don't have to
  // have the server running and (b) we can check exactly which HTTP
  // requests were made to ensure that we're making the correct requests.
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    httpClient = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
    // Construct an instance of the service with the mock
    // HTTP client.
    todoService = new TodoService(httpClient);
  });

  afterEach(() => {
    // After every test, assert that there are no more pending requests.
    httpTestingController.verify();
  });
  // it('should be created', () => {
  //   expect(service).toBeTruthy();
  // });
  describe('getTodos()', () => {
    it('calls `api/todos` when `getTodos()` is called with no parameters', () => {
      // Assert that the todos we get from this call to getTodos()
      // should be our set of test todos. Because we're subscribing
      // to the result of getTodos(), this won't actually get
      // checked until the mocked HTTP request 'returns' a response.
      // This happens when we call req.flush(testTodos) a few lines
      // down.
      todoService.getTodos().subscribe(
        todos => expect(todos).toBe(testTodos)
      );

      // Specify that (exactly) one request will be made to the specified URL.
      const req = httpTestingController.expectOne(todoService.todoUrl);
      // Check that the request made to that URL was a GET request.
      expect(req.request.method).toEqual('GET');
      // Check that the request had no query parameters.
      expect(req.request.params.keys().length).toBe(0);
      // Specify the content of the response to that request. This
      // triggers the subscribe above, which leads to that check
      // actually being performed.
      req.flush(testTodos);
  });

  describe('Calling getTodos() with parameters correctly forms the HTTP request', () => {
    /*
     * We really don't care what `getTodos()` returns in the cases
     * where the filtering is happening on the server. Since all the
     * filtering is happening on the server, `getTodos()` is really
     * just a "pass through" that returns whatever it receives, without
     * any "post processing" or manipulation. So the tests in this
     * `describe` block all confirm that the HTTP request is properly formed
     * and sent out in the world, but don't _really_ care about
     * what `getTodos()` returns as long as it's what the HTTP
     * request returns.
     *
     * So in each of these tests, we'll keep it simple and have
     * the (mocked) HTTP request return the entire list `testTodos`
     * even though in "real life" we would expect the server to
     * return return a filtered subset of the todos.
     */

    it('correctly calls api/todos with filter parameter \'status\'', () => {
      todoService.getTodos({ status: true }).subscribe(
        todos => expect(todos).toBe(testTodos)
      );

      // Specify that (exactly) one request will be made to the specified URL with the owner parameter.
      const req = httpTestingController.expectOne(
        (request) => request.url.startsWith(todoService.todoUrl) && request.params.has('status')
      );

      // Check that the request made to that URL was a GET request.
      expect(req.request.method).toEqual('GET');

      // Check that the owner parameter was 'admin'
      expect(req.request.params.get('status')).toEqual('true');

      req.flush(testTodos);
    });

    it('correctly calls api/todos with filter parameter \'\'', () => {

      todoService.getTodos({ owner: 'TestOne' }).subscribe(
        todos => expect(todos).toBe(testTodos)
      );

      // Specify that (exactly) one request will be made to the specified URL with the owner parameter.
      const req = httpTestingController.expectOne(
        (request) => request.url.startsWith(todoService.todoUrl) && request.params.has('owner')
      );

      // Check that the request made to that URL was a GET request.
      expect(req.request.method).toEqual('GET');

      // Check that the owner parameter was 'admin'
      expect(req.request.params.get('owner')).toEqual('TestOne');

      req.flush(testTodos);
    });

    it('correctly calls api/todos with multiple filter parameters', () => {

      todoService.getTodos({ owner: 'TestOne', status: true }).subscribe(
        todos => expect(todos).toBe(testTodos)
      );

      // Specify that (exactly) one request will be made to the specified URL with the owner parameter.
      const req = httpTestingController.expectOne(
        (request) => request.url.startsWith(todoService.todoUrl)
          && request.params.has('owner') && request.params.has('status')
      );

      // Check that the request made to that URL was a GET request.
      expect(req.request.method).toEqual('GET');

      // Check that the owner parameters are correct
      expect(req.request.params.get('owner')).toEqual('TestOne');
      expect(req.request.params.get('status')).toEqual('true');

      req.flush(testTodos);
    });
  });
});

describe('getTodoByID()', () => {
  it('calls api/todos/id with the correct ID', () => {
    // We're just picking a Todo "at random" from our little
    // set of Todos up at the top.
    const targetTodo: Todo = testTodos[1];
    const targetId: string = targetTodo._id;

    todoService.getTodoById(targetId).subscribe(
      // This `expect` doesn't do a _whole_ lot.
      // Since the `targetTodo`
      // is what the mock `HttpClient` returns in the
      // `req.flush(targetTodo)` line below, this
      // really just confirms that `getTodoById()`
      // doesn't in some way modify the todo it
      // gets back from the server.
      todo => expect(todo).toBe(targetTodo)
    );

    const expectedUrl: string = todoService.todoUrl + '/' + targetId;
    const req = httpTestingController.expectOne(expectedUrl);
    expect(req.request.method).toEqual('GET');

    req.flush(targetTodo);
  });
});

describe('filterTodos()', () => {
  /*
   * Since `filterTodos` actually filters "locally" (in
   * Angular instead of on the server), we do want to
   * confirm that everything it returns has the desired
   * properties. Since this doesn't make a call to the server,
   * though, we don't have to use the mock HttpClient and
   * all those complications.
   */
  it('filters by body', () => {
    const todoBody = 'test';
    const filteredTodos = todoService.filterTodos(testTodos, { body: todoBody });
    // There should be two todos with an 'test' in their body
    expect(filteredTodos.length).toBe(3);
    // Every returned todo's body should contain an 'test'.
    filteredTodos.forEach(todo => {
      expect(todo.body.indexOf(todoBody)).toBeGreaterThanOrEqual(0);
    });
  });

  it('filters by category', () => {
    const todoCategory = 'test one';
    const filteredTodos = todoService.filterTodos(testTodos, { category: todoCategory });
    // There should be just one todos that has "test one" as the category.
    expect(filteredTodos.length).toBe(1);
    // Every returned todo's category should contain 'test one'.
    filteredTodos.forEach(todo => {
      expect(todo.category.indexOf(todoCategory)).toBeGreaterThanOrEqual(0);
    });
  });

  it('filters by body and category', () => {
    const todoBody = 'three';
    const todoCategory = 'three';
    const filters = { body:todoBody, category:todoCategory };
    const filteredTodos = todoService.filterTodos(testTodos, filters);
    // There should be just one todo with these properties.
    expect(filteredTodos.length).toBe(1);
    // Every returned todo should have _both_ these properties.
    filteredTodos.forEach(todo => {
      expect(todo.body.indexOf(todoBody)).toBeGreaterThanOrEqual(0);
      expect(todo.category.indexOf(todoCategory)).toBeGreaterThanOrEqual(0);
    });
  });
});

it('addTodo() posts to api/todos', () => {

  todoService.addTodo(testTodos[1]).subscribe(
    id => expect(id).toBe('testid')
  );

  const req = httpTestingController.expectOne(todoService.todoUrl);

  expect(req.request.method).toEqual('POST');
  expect(req.request.body).toEqual(testTodos[1]);

  req.flush({id: 'testid'});
});
});
