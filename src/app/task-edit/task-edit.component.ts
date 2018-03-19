import { Component, OnInit } from '@angular/core';

import { TaskService } from '../task.service';

import { Task } from '../class/task';

@Component({
  selector: 'app-task-edit',
  templateUrl: './task-edit.component.html',
  styleUrls: [
    '../form/popup.css',
    '../form/index.css',
    './task-edit.component.css'
  ]
})
export class TaskEditComponent implements OnInit {

  private hide:boolean = false;

  constructor(
    private taskService: TaskService
  ) { }

  ngOnInit() {
  }

  cancel( $event: Event ) {
    $event.preventDefault();
    $event.stopPropagation();
    this.hide = true;
    setTimeout(() => {
      this.taskService.cancelChanges();
      this.hide = false
    }, 300)
  }

  stopBubbling( $event: Event ) {
    $event.stopPropagation();
  }

  applyChanges() {
    this.hide = true;
    setTimeout(() => {
      this.taskService.applyChanges();
      this.hide = false;
    });
  }

}
