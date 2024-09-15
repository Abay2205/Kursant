import {Component, inject, input, OnInit} from '@angular/core';
import {NgClass, NgForOf, NgIf} from "@angular/common";
import {Router} from "@angular/router";

export interface sabak {
  id: number,
  sabakName: string,
  status: string,
}

export interface test {
  id: number,
  testName: string,
  status: string,
}

export interface homework {
  homeworkName: string,
  status: string,
}

export interface tema {
  id: number,
  temaName: string,
  temaStatus: string,
  sabak: sabak[],
  test: test[],
  homework: homework[]
}

export interface bolim {
  id: number,
  temaCount: number,
  bolimName: string,
  status: string,
  tema: tema[]
}

@Component({
  selector: 'app-about-course',
  standalone: true,
  imports: [
    NgIf,
    NgForOf,
    NgClass
  ],
  templateUrl: './about-course.component.html',
  styleUrl: './about-course.component.css'
})
export class AboutCourseComponent implements OnInit {

  private router = inject(Router)

  courseId = input.required<string>()

  ngOnInit(){
  }

  public bolimder: bolim[] = [
    {
      id: 1,
      temaCount: 3,
      bolimName: 'Қазақстандағы ежелгі адамдардың өмірі',
      status: 'opened',
      tema: [
        {
          id: 1,
          temaName: 'Адамзаттың пайда болуы',
          temaStatus: 'finished',
          sabak: [
            {id: 1, sabakName: 'Қазақстан тарихын зерттеуші отандық тарихшылар', status: 'finished'},
            {id: 2, sabakName: 'Қазақстан тарихын зерттеуші отандық тарихшылар', status: 'opened'},
          ],
          test: [
            {id: 1, testName: 'Тақырыптық тест', status: 'closed'},
          ],
          homework: [
            {homeworkName: 'Үй жұмысы', status: 'closed'},
          ]
        },
        {
          id: 2,
          temaName: 'Адамзаттың пайда болуы',
          temaStatus: 'opened',
          sabak: [],
          test: [],
          homework: []
        },
        {
          id: 3,
          temaName: 'Адамзаттың пайда болуы',
          temaStatus: 'closed',
          sabak: [],
          test: [],
          homework: []
        },
      ]
    },
    {
      id: 2,
      temaCount: 3,
      bolimName: 'Қазақстандағы ежелгі адамдардың өмірі',
      status: 'closed',
      tema: [
        {
          id: 1,
          temaName: 'Адамзаттың пайда болуы',
          temaStatus: 'closed',
          sabak: [],
          test: [],
          homework: []
        },
        {
          id: 2,
          temaName: 'Адамзаттың пайда болуы',
          temaStatus: 'closed',
          sabak: [],
          test: [],
          homework: []
        },
        {
          id: 3,
          temaName: 'Адамзаттың пайда болуы',
          temaStatus: 'closed',
          sabak: [],
          test: [],
          homework: []
        },
      ]
    },
    {
      id: 3,
      temaCount: 3,
      bolimName: 'Қазақстандағы ежелгі адамдардың өмірі',
      status: 'closed',
      tema: [
        {
          id: 1,
          temaName: 'Адамзаттың пайда болуы',
          temaStatus: 'closed',
          sabak: [],
          test: [],
          homework: []
        },
        {
          id: 2,
          temaName: 'Адамзаттың пайда болуы',
          temaStatus: 'closed',
          sabak: [],
          test: [],
          homework: []
        },
        {
          id: 3,
          temaName: 'Адамзаттың пайда болуы',
          temaStatus: 'closed',
          sabak: [],
          test: [],
          homework: []
        },
      ]
    },
  ]
  isOpen: boolean[] = [];
  isOpenTema: boolean[][] = [];

  constructor() {
    // Инициализация всех bolim как закрытых
    this.isOpen = new Array(this.bolimder.length).fill(false);
    this.isOpenTema = this.bolimder.map(bolim => new Array(bolim.tema.length).fill(false));
  }

  // Метод для переключения состояния раскрытия bolim
  toggleBolim(index: number) {
    this.isOpen[index] = !this.isOpen[index];
  }

  toggleTema(bolimIndex: number, temaIndex: number) {
    this.isOpenTema[bolimIndex][temaIndex] = !this.isOpenTema[bolimIndex][temaIndex];
  }

  // Метод для получения иконки статуса темы
  getTemaStatusIcon(status: string): string {
    if (status === 'finished') {
      return 'assets/images/finished.svg';
    } else if (status === 'opened') {
      return 'assets/images/opened.svg';
    } else {
      return 'assets/images/closed.svg';
    }
  }

  goToTest(testId: number): void {
    this.router.navigate(['/student/test', testId]);
  }

  goToSabak(sabakId: number): void {
    this.router.navigate(['/student/sabak', sabakId]);
  }

}