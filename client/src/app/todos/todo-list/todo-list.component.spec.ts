import { TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatOptionModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { Observable } from 'rxjs';
import { MockTodoService } from '../../../testing/todo.service.mock';
import { TodoCardComponent } from '../todo-card/todo-card.component';
import { TodoListComponent } from './todo-list.component';
import { TodoService } from '../todo.service';
import { Todo } from './todo';
import { MatIconModule } from '@angular/material/icon';


const COMMON_IMPORTS: any[] = [
  FormsModule,
  MatCardModule,
  MatFormFieldModule,
  MatSelectModule,
  MatOptionModule,
  MatButtonModule,
  MatInputModule,
  MatExpansionModule,
  MatTooltipModule,
  MatListModule,
  MatDividerModule,
  MatRadioModule,
  MatSnackBarModule,
  BrowserAnimationsModule,
  RouterTestingModule,
  MatIconModule
];

let todoList: TodoListComponent;

async function constructTodoList() {
  await TestBed.compileComponents();
  const fixture = TestBed.createComponent(TodoListComponent);
  todoList = fixture.componentInstance;
  fixture.detectChanges();
}

describe('TodoListComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [COMMON_IMPORTS],
      declarations: [TodoListComponent, TodoCardComponent],
      providers: [{ provide: TodoService, useValue: new MockTodoService() }]
    });
  });

  beforeEach(waitForAsync(constructTodoList));

  it('contains all the todos', () => {
    expect(todoList.serverFilteredTodos.length).toBe(3);
  });

  it('contains a todo with category "test one"', () => {
    expect(todoList.serverFilteredTodos.some((todo: Todo) => todo.category === 'test one')).toBe(true);
  });

  it('contains a todo with category "test two"', () => {
    expect(todoList.serverFilteredTodos.some((todo: Todo) => todo.category === 'test two')).toBe(true);
  });

  it('doesn\'t contain a todo with category "test none"', () => {
    expect(todoList.serverFilteredTodos.some((todo: Todo) => todo.category === 'test none')).toBe(false);
  });

  it('has two todos that are complete',() => {
    expect(todoList.serverFilteredTodos.filter((todo: Todo) => todo.status === true).length).toBe(2);
  });
});

describe('Misbehaving Todo List', () => {

  let todoServiceStub: {
    getTodos: () => Observable<Todo[]>;
    getTodosFiltered: () => Observable<Todo[]>;
  };

  beforeEach(() => {
    todoServiceStub = {
      getTodos: () => new Observable(observer => {
        observer.error('getTodos() Observer generates an error');
      }),
      getTodosFiltered: () => new Observable(observer => {
        observer.error('getTodosFiltered() Observer generates an error');
      })
    };

    TestBed.configureTestingModule({
      imports: [COMMON_IMPORTS],
      declarations: [TodoListComponent],
      providers: [{ provide: TodoService, useValue: todoServiceStub }]
    });
  });

  beforeEach(waitForAsync(constructTodoList));

  it('fails to load todos if we do not set up a TodoListService', () => {
    expect(todoList.serverFilteredTodos).toBeUndefined();
  });
});
