import {Component, ElementRef, inject, input, OnInit, ViewChild} from '@angular/core';
import {ProgressBarModule} from "primeng/progressbar";
import {BreadcrumbModule} from "primeng/breadcrumb";
import {NgClass, NgForOf, NgIf} from "@angular/common";
import {MenuItem, MessageService} from "primeng/api";
import {LearnerCourseService} from "../../service/learner-course.service";
import {ActivatedRoute, Router} from "@angular/router";
import {LearnerLessons} from "../../../assets/models/learner_course.interface";
import {LearnerLesson} from "../../../assets/models/learner_lesson.interface";

import Plyr from 'plyr';
import {VideoService} from "../../service/video.service";
@Component({
  selector: 'app-sabak-page',
  standalone: true,
  imports: [
    ProgressBarModule,
    BreadcrumbModule,
    NgClass,
    NgIf,
    NgForOf
  ],
  templateUrl: './sabak-page.component.html',
  styleUrl: './sabak-page.component.css'
})
export class SabakPageComponent implements OnInit {

  @ViewChild('plyrID', { static: true }) videoElement!: ElementRef;


  private learnerCourseService = inject(LearnerCourseService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private videoService = inject(VideoService)
  private messageService = inject(MessageService);

  videoUrl!: string;
  public lessonId!: number;
  public lessons: LearnerLessons[] = [];
  public lesson!: LearnerLesson;
  public courseName!: string;
  public topicName!: string;
  public lessonName!: string;
  public teacherName!: string;
  public lessonIndex!: number;
  public video!: string;
  public player!: Plyr;
  public progress: number = 0;
  public checkProgressInterval: any;
  firstVideoStartTimeSaved: boolean = false;
  nextLessonIsAvailable: boolean = false;

  prevVideoTime: number = 0;
  videoStartTime: number = 0;

  getTemaStatusIcon(status: string): string {
    switch (status) {
      case 'passed':
        return 'assets/images/finished.svg';
      case 'passed-retake':
        return 'assets/images/passed-retake.svg';
      case 'opened':
        return 'assets/images/opened.svg';
      case 'expired':
        return 'assets/images/expired.svg';
      case 'opened_retake':
        return 'assets/images/opened-retake.svg';
      case 'completed':
        return 'assets/images/completed.svg'; // Иконка для завершенного урока
      default:
        return 'assets/images/closed.svg';
    }
  }





  ngOnInit() {

    this.player = new Plyr(this.videoElement.nativeElement, { captions: { active: true } });

    const video = this.videoElement.nativeElement;

    this.player.on('timeupdate', this.saveVideoTimeUpdate.bind(this));
    this.player.on('ended', this.saveVideoFinish.bind(this));



    this.route.paramMap.subscribe(params => {
      const lessonIdParam = params.get('lessonId');
      console.log('Lesson ID from route params:', lessonIdParam);

      if (lessonIdParam) {
        this.lessonId = +lessonIdParam;
        console.log('Assigned lessonId:', this.lessonId);

        this.getLesson(this.lessonId);
        this.loadLessonVideo(this.lessonId);
        this.checkLessonProgress(this.lessonId);

        this.checkProgressInterval = setInterval(() => this.checkLessonProgress(this.lessonId), 5000);
      } else {
        console.error('Lesson ID is missing or invalid');
      }
    })

  }

  public getLesson(lessonId: number) {
    this.learnerCourseService.getLesson(lessonId).subscribe((data) => {
      console.log('Data received:', data);

      this.lessons = data.lessons;
      this.courseName = data.course_name;
      this.topicName = data.topic_name;
      this.lessonName = data.lesson_name;
      this.teacherName = data.teacher_fullname
      this.lessonIndex = data.lesson_number
      // this.video = `http://127.0.0.1:8000${this.lesson.video}`
      this.calculateProgress();
    })
  }

  public calculateProgress() {
    const totalLessons = this.lessons.length;
    const passedLessons = this.lessons.filter(lesson => lesson.status === 'passed').length; // Количество пройденных уроков

    if (totalLessons > 0) {
      this.progress = (passedLessons / totalLessons) * 100;
    }
  }

  public back() {
    this.router.navigate([`/student/courses/${this.lesson.course_id}`]);
  }

  public nextLesson() {
    this.router.navigate([`/student/lesson/${this.lesson.next_lesson_id}`]);
  }


  goToLesson(lessonId: number) {
    console.log(`Переход к уроку с ID: ${lessonId}`);
  }

  saveVideoTimeUpdate(): void {
    if (!this.nextLessonIsAvailable) {
      const currentTime = this.player.currentTime;

      if (!this.firstVideoStartTimeSaved) {
        this.firstVideoStartTimeSaved = true;
        this.videoStartTime = currentTime;
        this.prevVideoTime = currentTime;
      }

      if (Math.abs(currentTime - this.prevVideoTime) > 2) {
        this.videoService.sendVideoTimeUpdate(this.videoStartTime, this.prevVideoTime,this.lessonId).subscribe(() => {
          console.log(`Прогресс сохранён: start = ${this.videoStartTime}, prev = ${this.prevVideoTime}`);
        });

        this.videoStartTime = currentTime;
        this.prevVideoTime = currentTime;
      } else {
        this.prevVideoTime = currentTime;
      }
    }
  }


  saveVideoFinish(): void {
    if (!this.nextLessonIsAvailable) {
      this.videoService.sendVideoTimeUpdate(this.videoStartTime, this.prevVideoTime,this.lessonId).subscribe(() => {
        this.firstVideoStartTimeSaved = false;
        this.videoStartTime = 0;
        this.prevVideoTime = 0;
      });
    }
  }


  checkLessonProgress(lessonId: number): void {
    this.videoService.checkProgress(lessonId).subscribe(
      (response: any) => {
        this.nextLessonIsAvailable = response.next_lesson_is_available;

        if (this.nextLessonIsAvailable) {
          console.log('Следующий урок доступен');
        } else {
          console.log('Следующий урок пока недоступен');
        }
      },
      (error) => {
        console.error('Ошибка при проверке прогресса:', error);

        if (error?.error?.detail === "Learner lesson not found") {
          console.log('Урок ученика не найден, остановка проверок.');
          if (this.checkProgressInterval) {
            clearInterval(this.checkProgressInterval);
          }

          this.messageService.add({
            severity: 'error',
            summary: 'Ошибка',
            detail: 'Урок ученика не найден'
          });
        }
      }
    );
  }


  loadLessonVideo(lessonId: number) {
    this.videoUrl = this.videoService.getLessonVideoUrl(lessonId, 720); // Default to 720p
    const video480Url = this.videoService.getLessonVideoUrl(lessonId, 480);
    const video720Url = this.videoService.getLessonVideoUrl(lessonId, 720);
    const video1080Url = this.videoService.getLessonVideoUrl(lessonId, 1080);

    this.player.source = {
      type: 'video',
      sources: [
        {
          src: video1080Url,
          type: 'video/mp4',
          size: 1080
        },
        {
          src: video720Url,
          type: 'video/mp4',
          size: 720
        },
        {
          src: video480Url,
          type: 'video/mp4',
          size: 480
        }
      ]
    };
  }

  changeQuality(quality: number) {
    let videoUrl: string = '';  // Initialize videoUrl with an empty string

    if (quality === 720) {
      videoUrl = this.videoService.getLessonVideoUrl(this.lessonId, 720);
    } else if (quality === 480) {
      videoUrl = this.videoService.getLessonVideoUrl(this.lessonId, 480);
    }

    // Ensure videoUrl is valid before using it
    if (videoUrl) {
      // Update Plyr player with the new video source
      this.player.source = {
        type: 'video',
        sources: [
          {
            src: videoUrl,
            type: 'video/mp4',
            size: quality
          }
        ]
      };

      // Optionally play the video after switching quality
      this.player.once('loadedmetadata', () => {
        this.player.play(); // Play after switching
      });
    } else {
      console.error('Video URL is not defined for the selected quality.');
    }
  }







}
