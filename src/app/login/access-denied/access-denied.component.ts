import {Component, inject} from '@angular/core';
import {Router, RouterLink} from "@angular/router";

@Component({
  selector: 'app-access-denied',
  standalone: true,
  imports: [
    RouterLink
  ],
  templateUrl: './access-denied.component.html',
  styleUrl: './access-denied.component.css'
})
export class AccessDeniedComponent {
  private router = inject(Router);
  goBack() {
    this.router.navigate(['/']);
  }
}
