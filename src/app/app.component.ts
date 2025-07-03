import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from "./other/footer/footer.component";
import { NavBarComponent } from "./other/nav-bar/nav-bar.component";
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, FooterComponent, NavBarComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})


export class AppComponent {
  title = 'admin-dashboard';

  constructor(public router: Router) {}

  isLoginRoute(): boolean {
    return this.router.url === '/login';
  }
  
}
