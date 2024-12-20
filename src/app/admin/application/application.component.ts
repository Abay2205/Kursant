import {Component, inject, OnInit} from '@angular/core';
import {RouterLink, RouterLinkActive} from "@angular/router";
import {TableModule} from "primeng/table";
import {NgClass, NgForOf, NgIf, NgStyle} from "@angular/common";
import {DialogModule} from "primeng/dialog";
import {Button} from "primeng/button";
import {InputTextModule} from "primeng/inputtext";
import {MessageService} from "primeng/api";
import {FormBuilder, ReactiveFormsModule} from "@angular/forms";
import {CourseService} from "../../service/course.service";
import {OrderService} from "../../service/order.service";
import {UserService} from "../../service/user.service";
import {SalesApplication} from "../../../assets/models/salesApplication.interface";
import {Course} from "../../../assets/models/course.interface";
import {DropdownModule} from "primeng/dropdown";
import {OverlayPanelModule} from "primeng/overlaypanel";
import {PaginatorModule} from "primeng/paginator";
import {GetFlows} from "../../../assets/models/getFlows.interface";
import {FlowService} from "../../service/flow.service";
import {NgxMaskDirective} from "ngx-mask";
import {environment} from "../../../environments/environment";

@Component({
  selector: 'app-application',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    TableModule,
    NgClass,
    DialogModule,
    Button,
    InputTextModule,
    DropdownModule,
    NgForOf,
    NgIf,
    OverlayPanelModule,
    PaginatorModule,
    ReactiveFormsModule,
    NgStyle,
    NgxMaskDirective
  ],
  templateUrl: './application.component.html',
  styleUrl: './application.component.css'
})
export class ApplicationComponent implements OnInit{
  private superAdminService = inject(CourseService);
  private courseService = inject(CourseService);
  private orderService = inject(OrderService);
  private messageService = inject(MessageService);
  private userService = inject(UserService);
  private fb = inject(FormBuilder);
  private flowService = inject(FlowService);
  public userUrl = environment.apiUrl
  status: string | null = null;
  applications: SalesApplication[] = [];
  public coursesList: Course[] = [];
  visible: boolean = false;
  visibleAdd: boolean = false;
  public courses: Course[] = [];
  public selectedApplication: SalesApplication | null = null;
  activeStatus: string = '';
  searchText: string = '';
  selectedCourse: any = null;
  coursesAddList: Course[] = [];
  public flows: GetFlows[] = [];
  selectedFile: File | null = null;
  selectedFileName: string | null = null;
  selectedApplicationType: any;
  rejection_reason!:string;
  public selectedFlow: number | null = null;
  modalImageUrl: string | undefined = undefined;
  modalImageCaption: string | undefined = undefined;
  selectedName:string|null=null;
  selectedNum:number|null=null;
  imageUrl: string | undefined = undefined;
  isModalVisible: boolean = false;

  ngOnInit(): void {
    this.getApplications();
    this.loadCourses();
  }



  public applicationsForm = this.fb.group({
    learner_fullname: [''],
    learner_phone_number: [''],
    learner_region: [''],
    comments:['']});


  get isVisible(): boolean {
    return this.visible || this.visibleAdd;
  }

  set isVisible(value: boolean) {
    if (this.visible) {
      this.visible = value;
    } else if (this.visibleAdd) {
      this.visibleAdd = value;
    }
  }
  showAddDialog() {
    this.visibleAdd  = true;
    this.loadCourses();
  }

  private loadCourses() {
    this.superAdminService.getCourses().subscribe(data => {
      this.courses = data.map((course: Course) => ({
        ...course,
        poster: `${this.userUrl}${course.poster}`
      }));
    })
  }

  loadFlows(){
    this.flowService.getFlows().subscribe(data=>{
      this.flows = data;
    })
  }

  showDialog(application: SalesApplication) {
    this.visible  = true;
    this.coursesList = [];
    this.loadFlows();

    this.orderService.getApplicationById(application.order_id).subscribe(data => {
      this.selectedApplication = data;
      this.selectedApplicationType = { ...application, showAccess: false, showCancelReason: false };

      this.status = data.status;
      this.selectedNum = data.order_id;
      this.selectedName = data.learner_fullname

      this.applicationsForm.patchValue({
        learner_fullname: data.learner_fullname,
        learner_phone_number: data.learner_phone_number,
        learner_region: data.learner_region,
        comments: data.comments
      });

      if (data.courses && data.courses.length > 0) {
        this.coursesList = data.courses.map((courseData) => {
          return this.courses.find(course => course.id === courseData.course_id);
        }).filter(course => course !== undefined) as Course[];
      }

      if (data.paid_check) {
        if (typeof data.paid_check === 'string') {
          const urlParts = data.paid_check.split('/');
          this.selectedFileName = urlParts[urlParts.length - 1];
          this.imageUrl = `${this.userUrl}${data.paid_check}`;
        } else if (data.paid_check instanceof File) {
          this.selectedFileName = data.paid_check.name;
        }
      } else {
        this.selectedFileName = 'Файл не выбран';
        this.imageUrl = undefined;
      }

    });
  }

  // onFileSelected(event: any) {
  //   const file: File = event.target.files[0];
  //
  //   if (file) {
  //     this.selectedFile = file;
  //     this.selectedFileName = file.name;
  //   } else {
  //     console.error('No file was selected');
  //     this.selectedFileName = null;
  //   }
  // }
  //
  // triggerFileInputFirst() {
  //   const fileInput = document.getElementById('fileInput1') as HTMLInputElement;
  //   if (fileInput) {
  //     fileInput.click();
  //   }
  // }


  filterApplications(status: string) {
    this.activeStatus = status;
    this.getApplications(status, this.searchText);
  }

  searchApplications() {
    this.getApplications(this.activeStatus, this.searchText);
  }
  getApplications(status: string = '', search: string = '') {
    this.orderService.getApplications(status, search).subscribe(data => {
      this.applications = data.orders;
    });
  }

  openModal(imageUrl: string, imageCaption: string) {
    this.modalImageUrl = imageUrl;
    this.modalImageCaption = imageCaption;
    this.isModalVisible = true;
  }

  closeModal() {
    this.isModalVisible = false;
  }

  saveDialog() {

    if (this.visible && this.selectedApplication && this.selectedFlow) {
      const order_Id = this.selectedApplication.order_id;
      const flow_Id = this.selectedFlow;

      this.orderService.acceptAdminOrder(order_Id, flow_Id).subscribe(
        response => {
          if (response.success) {
            this.visible=false;
            this.getApplications();
            this.messageService.add({
              severity: 'success',
              summary: 'Успешно',
              detail: 'Доступ к курсам успешно предоставлен'
            });
          }
        },
        error => {
          this.messageService.add({
            severity: 'error',
            summary: 'Ошибка',
            detail: 'Не удалось предоставить доступ к курсам'
          });
        }
      );
    }
  }


  saveCancelDialog() {
    if (this.selectedApplication) {
      const formData = this.applicationsForm.value;

      const payload = {
        order_id: this.selectedApplication.order_id.toString(),
        learner_fullname: formData.learner_fullname || '',
        learner_phone_number: formData.learner_phone_number || '',
        learner_region: formData.learner_region || '',
        rejection_reason: this.rejection_reason || ''
      };

      this.orderService.cancelSalesManagerOrder(payload).subscribe(
        response => {
          this.visible = false;
          this.getApplications();
          this.applicationsForm.reset()
          this.rejection_reason = '';
          this.messageService.add({
            severity: 'success',
            summary: 'Заявка отклонена',
            detail: 'Заявка успешно отклонена',
          });
        },
        error => {
          this.messageService.add({
            severity: 'error',
            summary: 'Ошибка',
            detail: 'Произошла ошибка при отклонении заявки',
          });
        }
      );
    }
  }


  onDialogHide() {
    this.applicationsForm.reset();
  }


  removeCourse(index: number) {
    this.coursesList.splice(index, 1);
    this.calculateTotalPrice();
  }


  calculateTotalPrice(): number {
    return this.coursesList.reduce((total, course) => total + course.current_price, 0);
  }


  closeDialog() {
    this.visible  = false;
    this.visibleAdd = false;
    if (this.selectedApplication) {
      this.selectedApplicationType.showAccess = false;
      this.selectedApplicationType.showCancelReason = false;
    }
    this.messageService.add({severity:'info', summary:'Отмена', detail:'Никаких изменений'});
  }

  cancelDialog() {
    if (this.selectedApplication) {
      this.selectedApplicationType.showCancelReason = true;
      this.visibleAdd = false;
      console.log("showCancelReason:", this.selectedApplicationType.showCancelReason); // Отладочный вывод
    }
  }

}

