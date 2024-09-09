import {Component, input} from '@angular/core';
import {ProgressBarModule} from "primeng/progressbar";
import {DialogModule} from "primeng/dialog";
import {InputTextModule} from "primeng/inputtext";
import {Button} from "primeng/button";

@Component({
  selector: 'app-test-page',
  standalone: true,
  imports: [
    ProgressBarModule,
    DialogModule,
    InputTextModule,
    Button
  ],
  templateUrl: './test-page.component.html',
  styleUrl: './test-page.component.css'
})
export class TestPageComponent {
  testId = input.required<string>()

  public progress: number = 50;
  visible: boolean = false;

  showDialog() {
    this.visible = true;
  }

  public sabaktar: any = [
    {id: 1, status: 'finished', tema: 'Мезолит', sabakName: 'Орта тас дәуірі'},
    {id: 2, status: 'finished', tema: 'Мезолит', sabakName: 'Орта тас дәуірі'},
    {id: 3, status: 'finished', tema: 'Мезолит', sabakName: 'Орта тас дәуірі'},
    {id: 4, status: 'opened', tema: 'Мезолит', sabakName: 'Орта тас дәуірі'},
    {id: 5, status: 'closed', tema: 'Мезолит', sabakName: 'Орта тас дәуірі'},
    {id: 6, status: 'closed', tema: 'Мезолит', sabakName: 'Орта тас дәуірі'},
    {id: 7, status: 'closed', tema: 'Мезолит', sabakName: 'Орта тас дәуірі'},
    {id: 8, status: 'closed', tema: 'Мезолит', sabakName: 'Орта тас дәуірі'}
  ]

  getTemaStatusIcon(status: string): string {
    if (status === 'finished') {
      return 'assets/images/finished.svg';
    } else if (status === 'opened') {
      return 'assets/images/opened.svg';
    } else {
      return 'assets/images/closed.svg';
    }
  }
}
