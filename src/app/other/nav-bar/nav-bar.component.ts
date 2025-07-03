import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-nav-bar',
  imports: [CommonModule],
  templateUrl: './nav-bar.component.html',
  styleUrl: './nav-bar.component.css'
})
export class NavBarComponent implements OnInit, OnDestroy {
  menuOpen = false;
  // currentUser$: Observable<User | null>;
  // currentUser: User | null = null;
  private subscription = new Subscription();

  constructor(
    // private authService: AuthService,
    private router: Router
  ) {
    // this.currentUser$ = this.authService.currentUser$;
  }

  ngOnInit(): void {
    // const sub = this.currentUser$.subscribe(user => {
    //   // this.currentUser = user;
    // });
    // this.subscription.add(sub);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  navigate(path: string): void {
    this.router.navigate([path]);
    this.menuOpen = false;
  }

  logout(): void {
    // this.authService.logout();
    this.router.navigate(['']);
    this.menuOpen = false;
  }

  // isAdmin(): boolean {
  //   // return this.currentUser?.role === 'admin';
  // }

  // isLoggedIn(): boolean {
  //   // return this.currentUser !== null;
  // }
}
