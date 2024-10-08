import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {UserService} from "./user.service";
import {Observable} from "rxjs";
import {CuratorHomeWorks} from "../../assets/models/curatorHomeWorks.interface";
import {HomeworkDetails} from "../../assets/models/curatorHomeWorkDetails.interfact";
import {LearnerHomework} from "../../assets/models/curatorLearnerHomeWork.interface";
import {FlowTest} from "../../assets/models/curatorTestWork.interface";
import {LearnerHomeworkDetails, LearnerHomeworks} from "../../assets/models/learnerHomework.ineteface";
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class LearnerHomeworkService {
  private apiUrl = environment.apiUrl + '/api/learner_homework';
  private http = inject(HttpClient);
  private userService = inject(UserService);

  constructor() { }

  public getLearnerHomeworks(): Observable<LearnerHomeworks[]> {
    const token = this.userService.token;
    const headers = new HttpHeaders().set('Authorization', `Token ${token}`);

    return this.http.get<LearnerHomeworks[]>(`${this.apiUrl}/learner_get_homeworks/`, { headers });
  }



  public getLearnerHomework(learner_homework_id: number): Observable<LearnerHomeworkDetails> {
    const token = this.userService.token;
    const headers = new HttpHeaders().set('Authorization', `Token ${token}`);
    const params = new HttpParams().set('learner_homework_id', learner_homework_id.toString());

    return this.http.get<LearnerHomeworkDetails>(`${this.apiUrl}/get_homework/`, { headers, params });
  }

  public saveLearnerHomework(learner_homework_id: number, file: File): Observable<any> {
    const token = this.userService.token;
    const headers = new HttpHeaders().set('Authorization', `Token ${token}`);

    const formData = new FormData();
    formData.append('learner_homework_id', learner_homework_id.toString());
    formData.append('file', file);

    return this.http.post(`${this.apiUrl}/save_homework/`, formData, { headers });
  }

  public getFlowHomeWorks(id: number,search: string = '',): Observable<CuratorHomeWorks[]> {
    const token = this.userService.token;
    const headers = new HttpHeaders().set('Authorization', `Token ${token}`);
    let params = new HttpParams().set('flow_id', id.toString());

    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<CuratorHomeWorks[]>(`${this.apiUrl}/get_flow_homeworks/`, {headers, params}
    );
  }



  public getFlowHomeWorkDetails(id: number): Observable<HomeworkDetails> {
    const token = this.userService.token;
    const headers = new HttpHeaders().set('Authorization', `Token ${token}`);
    const params = new HttpParams().set('flow_homework_id', id.toString());

    return this.http.get<HomeworkDetails>(`${this.apiUrl}/get_topic_homework/`, { headers, params });
  }

  public getLearnerHomeWorkDetails(status: string = '', id: number): Observable<LearnerHomework[]> {
    const token = this.userService.token;
    const headers = new HttpHeaders().set('Authorization', `Token ${token}`);

    let params = new HttpParams().set('flow_homework_id', id.toString());

    if (status) {
      params = params.set('status', status);
    }

    return this.http.get<LearnerHomework[]>(`${this.apiUrl}/get_learner_homeworks/`, { headers, params });
  }

  public retakeHomeWork(learner_homework_id: number, retake_comment: string): Observable<any> {
    const token = this.userService.token;
    const headers = new HttpHeaders().set('Authorization', `Token ${token}`);

    const retake = {
      learner_homework_id: learner_homework_id,
      retake_comment: retake_comment
    };

    return this.http.post(`${this.apiUrl}/retake_homework/`, retake, { headers });
  }

  public giveMarkHomeWork(learner_homework_id: number, mark: number): Observable<any> {
    const token = this.userService.token;
    const headers = new HttpHeaders().set('Authorization', `Token ${token}`);

    const retake = {
      learner_homework_id: learner_homework_id,
      mark: mark
    };

    return this.http.post(`${this.apiUrl}/save_mark/`, retake, { headers });
  }


}
