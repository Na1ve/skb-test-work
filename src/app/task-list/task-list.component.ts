import { Component, OnInit } from '@angular/core';

import { TaskService } from '../task.service';

import { Task } from '../class/task';

const DAY = 24*60*60*1000;

@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.component.html',
  styleUrls: [
    '../form/button.css',
    '../form/checkbox.css',
    './task-list.component.css'
  ]
})
export class TaskListComponent implements OnInit {

  private switchedTask:Task;

  private draggableTask:Task;

  currentDate:Date;

  constructor(
    private taskService: TaskService
  ) { }

  ngOnInit() {
    const _currentDate = new Date(
      new Date()
        .toISOString()
        .replace(/T.+/,'')
    )
    this.currentDate = _currentDate;
  }

  createTask() {
    const tmpTask = {
      deadline: new Date(
        this.currentDate.getTime() + 
        DAY
      ).toISOString()
        .replace(/T.+/,'')
    };
    this.taskService.createTask(tmpTask as Task)
  }

  calcTiming(task: Task) {
    const result = Math.max( 0, 
      (new Date(task.deadline).getTime() - this.currentDate.getTime()) /
      DAY + 1
    )
    return result;
  }

  editTask(task: Task) {
    this.taskService.editTask(task)
  }

  removeTask(task: Task) {
    this.taskService.removeTask(task)
  }

  toggleTask(task: Task) {
    if (!this.draggableTask) {
      this.switchedTask = this.switchedTask == task ?
        null :
        task;
    }
  }

  setState(task: Task) {
    this.taskService.setState(task);
  }

  startSort($event: MouseEvent, task: Task) {
    
    if (this.switchedTask) {
      return false;
    }

    $event.stopPropagation();
    $event.preventDefault();
    
    const target = (function parent(element){
      if (element.classList.contains('b-list-item')) {
        return element
      } else {
        return parent(element.parentNode as HTMLElement)
      }
    })($event.target as HTMLElement);

    // const siblings = [...target.parentNode.children]
    const siblings = Array.prototype.slice.call(
      target.parentNode.children
    );

    const checkPosition = (callback) => {
      let direction = 1;
      const position = target.getBoundingClientRect();
      const targetY = position.top + position.height * .5;

      siblings.forEach((element, i) => {

        if (element == target) {
          direction = -direction;
          callback(0, element, i);
        } else {

          const _position = element.getBoundingClientRect();
          const elementY = _position.top + _position.height * .5;

          if ( direction*targetY < direction*elementY) {
            callback(direction, element, i);
          } else {
            callback(0, element, i);
          }

        }

      });

    }

    const startPosition = {
      y: $event.pageY
    }

    const move = (e) => {
      
      const currentPosition = {
        y: e.pageY
      }
      const diff = currentPosition.y - startPosition.y
      
      this.draggableTask = task;
      target.style.transform = `translateY(${diff}px)`;

      checkPosition(( direction, element ) => {
        if (direction) {
          element.classList.add(
            `b-list-item__${direction>0?'down':'up'}`
          );
          
        } else {
          element.classList.remove('b-list-item__up');
          element.classList.remove('b-list-item__down');
        }
      });
      
    }

    const end = (e) => {
      
      const currentPosition = {
        y: e.pageY
      }
      
      const setPosition = (id) => {
        
        if (id >= 0) {
          const currentId = this.taskService.taskList.indexOf( this.draggableTask );
          this.taskService.taskList.splice(currentId, 1);
          this.taskService.taskList.splice(id, 0, this.draggableTask);
          this.taskService.sendData();
        }
      }

      const diff = currentPosition.y - startPosition.y
      
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mouseup', end)  
      
      if (Math.abs(diff)>=10) {

        let lastPosition = -1;

        checkPosition((direction, element, i) => {
          if (direction == 1 && lastPosition == -1) {
            lastPosition = i;
          } else if (direction == -1) {
            lastPosition = i;
          }
          element.classList.remove('b-list-item__up');
          element.classList.remove('b-list-item__down');
        })

        setPosition(lastPosition);

        setTimeout(()=>{
          this.draggableTask = null;
        },10);
      
      } else {

        this.draggableTask = null;

      }
      
      target.style.transform = '';
    }

    window.addEventListener('mousemove', move)
    window.addEventListener('mouseup', end)

  }

  stopBubbling($event: Event) {
    $event.stopPropagation();
  }

}
