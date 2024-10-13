import {inject, Injectable} from '@angular/core';
import {environment} from "../../environments/environment";
import {UserService} from "./user.service";
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {Observable, throwError} from "rxjs";
import {catchError} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class MeetService {
  private apiUrl = environment.apiUrl + '/api/meet';
  private userService = inject(UserService);
  private http = inject(HttpClient)

  constructor() { }

  public getMeetings(flow_id: number, flow_course_id: number, search?: string): Observable<any> {
    const token = this.userService.token;
    const headers = new HttpHeaders().set('Authorization', `Token ${token}`);

    let params = new HttpParams()
      .set('flow_course_id', flow_course_id)
      .set('flow_id', flow_id);

    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<any>(`${this.apiUrl}/get_meetings/`, { headers, params });
  }


  public saveMeeting(meetingData: any): Observable<any> {
    const token = this.userService.token;
    const headers = new HttpHeaders().set('Authorization', `Token ${token}`);

    return this.http.post<any>(`${this.apiUrl}/save_meeting/`, meetingData, { headers }).pipe(
      catchError(error => {
        console.error('Save meeting failed:', error);
        return throwError(error);
      })
    );
  }

}
