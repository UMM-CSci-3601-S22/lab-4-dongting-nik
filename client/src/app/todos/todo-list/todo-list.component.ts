import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';
import { Todo } from './todo';
import { TodoService } from '../todo.service';

@Component({
  selector: 'app-todo-list',
  templateUrl: './todo-list.component.html',
  styleUrls: ['./todo-list.component.scss']
})
export class TodoListComponent implements OnInit, OnDestroy {

  public serverFilteredTodos: Todo[];
  public filteredTodos: Todo[];

  public todoStatus: boolean;
  public todoOwner: string;
  public todoBody: string;
  public todoCategory: string;
  public viewType: 'card' | 'list' = 'card';
  getTodosSub: Subscription;

  constructor(private todoService: TodoService, private snackBar: MatSnackBar) {
   }


  /**
   * Get the Todos from the server, filtered by the role and age specified
   * in the GUI.
   */
   getTodosFromServer() {
     this.unsub();
    this.getTodosSub = this.todoService.getTodos({
      status: this.todoStatus,
      owner: this.todoOwner
    })
    .subscribe(returnedTodos => {
      // This inner function passed to `subscribe` will be called
      // when the `Observable` returned by `getTodos()` has one
      // or more values to return. `returnedTodos` will be the
      // name for the array of `Todos` we got back from the
      // server.
      this.serverFilteredTodos = returnedTodos;
      this.updateFilter();
    }, err => {
      // If there was an error getting the todos, log
      // the problem and display a message.
      console.error('We couldn\'t get the list of todos; the server might be down');
      this.snackBar.open(
        'Problem contacting the server – try again',
        'OK',
        // The message will disappear after 3 seconds.
        { duration: 3000 });
    });
  }

  /**
   * Called when the filtering information is changed in the GUI so we can
   * get an updated list of `filteredTodos`.
   */
  public updateFilter() {
    this.filteredTodos = this.todoService.filterTodos(
      this.serverFilteredTodos, { body: this.todoBody, category: this.todoCategory }
    );
  }

  ngOnInit(): void {
    this.getTodosFromServer();
  }

  /**
   * When this component is destroyed, we should unsubscribe to any
   * outstanding requests.
   */
  ngOnDestroy(): void {
    this.unsub();
  }

  unsub(): void {
    if (this.getTodosSub) {
      this.getTodosSub.unsubscribe();
    }
  }
}
