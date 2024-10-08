import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {DialogModule} from "primeng/dialog";
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {Location, NgForOf, NgIf} from "@angular/common";
import {ActivatedRoute, NavigationEnd, Router, RouterOutlet} from "@angular/router";
import {TopicService} from "../../../service/topic.service";
import {Topic} from "../../../../assets/models/topic.interface";
import {ModuleService} from "../../../service/module.service";
import {filter, Subscription} from "rxjs";
import {ConfirmationService, MessageService} from "primeng/api";
import {ConfirmPopupModule} from "primeng/confirmpopup";

@Component({
  selector: 'app-edit-module',
  standalone: true,
  imports: [
    DialogModule,
    FormsModule,
    NgForOf,
    NgIf,
    RouterOutlet,
    ReactiveFormsModule,
    ConfirmPopupModule
  ],
  templateUrl: './edit-module.component.html',
  styleUrl: './edit-module.component.css'
})
export class EditModuleComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private topicService = inject(TopicService);
  private moduleService = inject(ModuleService);
  private fb = inject(FormBuilder);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  public EditTopicVisible: boolean = false;
  public AddTopicVisible: boolean = false;
  public isTopicOpened: boolean = false;
  public topics: Topic[] = [];
  public courseId!: number;
  public moduleId!: number;
  public selectedTopicId!: number;
  public moduleName!: string;
  public moduleIndex!: number;
  public addTopicForm!: FormGroup;
  public editTopicForm!: FormGroup;

  private navigationSubscription: Subscription;

  constructor() {
    this.navigationSubscription = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.checkTopicOpened();
    });
  }


  ngOnInit() {
    this.route.parent!.paramMap.subscribe(params => {
      this.courseId = +params.get('courseId')!;
    });

    this.route.paramMap.subscribe(params => {
      this.moduleId = +params.get('moduleId')!;
      this.loadTopics();
    });

    this.topicService.topicUpdated$.subscribe(() => {
      this.loadTopics();
    });

    this.initAddTopicForm();
    this.initEditTopicForm();
    this.checkTopicOpened();
  }

  private checkTopicOpened() {
    this.isTopicOpened = this.route.firstChild != null;
  }

  ngOnDestroy() {
    if (this.navigationSubscription) {
      this.navigationSubscription.unsubscribe();
    }
  }

  private initAddTopicForm() {
    this.addTopicForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
    });
  }

  private initEditTopicForm() {
    this.editTopicForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
    });
  }

  public loadTopics() {
    this.topicService.getTopics(this.moduleId).subscribe({
      next: (data) => {
        this.topics = data.topics;
        this.moduleName = data.module.name
        this.moduleIndex = data.module.index
      },
      error: (err) => {
        console.error('Ошибка при загрузке тем:', err);
      }
    });
  }

  public addTopics() {
    if (this.addTopicForm.invalid) {
      return;
    }
    const newTopic: Topic = this.addTopicForm.value;
    this.topicService.saveTopic(newTopic, this.moduleId).subscribe({
      next: () => {
        this.loadTopics();
        this.AddTopicVisible = false;
        this.addTopicForm.reset();
      },
      error: (err) => {
        console.error('Ошибка при добавлении темы:', err);
      }
    });
  }

  public editTopic(topicId: number) {
    if (this.editTopicForm.invalid) {
      return;
    }
    const updatedTopic: Topic = this.editTopicForm.value;
    updatedTopic.id = topicId;
    this.topicService.saveTopic(updatedTopic, this.moduleId).subscribe({
      next: () => {
        this.loadTopics();
        this.EditTopicVisible = false;
        this.editTopicForm.reset();
      },
      error: (err) => {
        console.error('Ошибка при редактировании темы:', err);
      }
    });
  }

  public deleteModule(event: Event, moduleId: number) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Вы действительно хотите удалить этот модуль?',
      icon: 'pi pi-info-circle',
      rejectLabel: 'Нет',
      acceptLabel: 'Да',
      acceptButtonStyleClass: 'p-button-danger p-button-sm',
      accept: () => {
        this.moduleService.deleteCourseModule(moduleId).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Успешно',
              detail: 'Модуль успешно удален!'
            });
            this.router.navigate([`/admin/edit-course/${this.courseId}`]);
          },
          error: (error) => {
            if (error.status === 409) {
              this.messageService.add({
                severity: 'warn',
                summary: 'Ошибка',
                detail: 'Нельзя удалить данный модуль'
              });
            } else {
              this.messageService.add({
                severity: 'error',
                summary: 'Ошибка',
                detail: 'Ошибка при удалении модуля'
              });
            }
          }
        });
      }
    });
  }

  public showEditDialog(topicId: number, topicName: string) {
    this.selectedTopicId = topicId;
    this.editTopicForm.patchValue({
      name: topicName
    });
    this.EditTopicVisible = true;
  }

  public showAddDialog() {
    this.AddTopicVisible = true;
  }

  public back() {
    this.router.navigate([`/admin/edit-course/${this.courseId}`]);
  }

  public navigateToEditTema(topicId: number) {
    this.router.navigate([`/admin/edit-course/${this.courseId}/edit-module/${this.moduleId}/edit-topic/`, topicId]);
    this.isTopicOpened = true;
  }
}
