import { Injectable } from '@angular/core';
import { Task } from './class/task';

import { TASKS } from './fakedata/task-list';

@Injectable()
export class TaskService {

  taskList: Task[] = [...TASKS];

  selectedTask: Task;

  private temporaryTask: Task;
  private storageName: string = 'naive-task-manager';

  constructor() {
    this.getData();
  }

  createTask(task: Task): void {
    this.selectedTask = task;
  }

  editTask(task: Task): void {
    this.temporaryTask = {...task}
    this.selectedTask = task;
    this.sendData();
  }

  applyChanges() {
    if (!this.selectedTask.id) { // new task

      let nextId = this.taskList.reduce((cur, task) => {
        return Math.max(cur, task.id)
      }, 0) + 1;
      this.selectedTask.id = nextId
      this.selectedTask.create = 
        this.selectedTask.edit =
          new Date().toISOString()
            .replace(/T.+/,'');
      this.taskList.push(this.selectedTask);

    } else { // existed task

      this.selectedTask.edit = new Date().
        toISOString().
        replace(/T.+/,'');

    }
    this.selectedTask = undefined;
    this.sendData();
  }

  cancelChanges() {
    Object.keys(this.temporaryTask || {}).forEach((key) => {
      this.selectedTask[key] = this.temporaryTask[key];
    });
    this.selectedTask = undefined;
  }

  removeTask(task: Task) {
    const id = this.taskList.indexOf(task);
    this.taskList.splice(id,1);
    this.sendData();
  }

  setState(task: Task) {
    this.sendData();
  }


  getData() {
    const externalData = localStorage.getItem( this.storageName );
    if (externalData) {
      this.taskList = JSON.parse(externalData);
    }
  }

  sendData() {
    localStorage.setItem( this.storageName, 
      JSON.stringify( this.taskList )
    );
  }

  removeData() {
    this.taskList.splice(0, this.taskList.length, ...TASKS);
    localStorage.removeItem( this.storageName );
  }

}
