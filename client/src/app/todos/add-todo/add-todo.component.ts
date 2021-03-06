import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Todo } from '../todo-list/todo';
import { TodoService } from '../todo.service';

@Component({
  selector: 'app-add-todo',
  templateUrl: './add-todo.component.html',
  styleUrls: ['./add-todo.component.scss']
})
export class AddTodoComponent implements OnInit {

  addTodoForm: FormGroup;

  todo: Todo;

  // not sure if this name is magical and making it be found or if I'm missing something,
  // but this is where the red text that shows up (when there is invalid input) comes from
  addTodoValidationMessages = {
    owner: [
      { type: 'required', message: 'Owner\'s name is required' },
      { type: 'minlength', message: 'Owner\'s name must be at least 2 characters long' },
      { type: 'maxlength', message: 'Owner\'s name cannot be more than 100 characters long' },
    ],

    status: [
      { type: 'required', message: 'Status is required' },
      { type: 'pattern', message: 'status must be Complete, or Incomplete' },
    ],

    body: [
      { type: 'required', message: 'Body is required' },
      { type: 'minlength', message: 'Body must be at least 2 characters long' },
    ],

    category: [
      { type: 'required', message: 'Category is required' },
      { type: 'minlength', message: 'Category must be at least 2 characters long' },
      { type: 'maxlength', message: 'Category cannot be more than 50 characters long' },
    ]
  };

  constructor(private fb: FormBuilder, private todoService: TodoService, private snackBar: MatSnackBar, private router: Router) {
  }

  createForms() {

    // add todo form validations
    this.addTodoForm = this.fb.group({
      // We allow alphanumeric input and limit the length for name.

      owner: new FormControl('', Validators.compose([
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100),
      ])),

      // We don't need a special validator just for our app here, but there is a default one for email.
      // We will require the email, though.
      status: new FormControl('', Validators.compose([
        Validators.required,
        Validators.pattern('^(true|false)+$'),
      ])),

      body: new FormControl('', Validators.compose([
        Validators.required,
        Validators.minLength(2),
      ])),

      category: new FormControl('', Validators.compose([
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50)
      ])),
    });

  }

  ngOnInit() {
    this.createForms();
  }


  submitForm() {
    this.todoService.addTodo(this.addTodoForm.value).subscribe(newID => {
      this.snackBar.open('Added Todo ' + this.addTodoForm.value.owner, null, {
        duration: 2000,
      });
      this.router.navigate(['/todos/', newID]);
    }, err => {
      this.snackBar.open('Failed to add the todo', 'OK', {
        duration: 5000,
      });
    });
  }

}
