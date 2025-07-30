import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppLayoutComponent } from './components/app-layout/app-layout';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, AppLayoutComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  protected readonly title = signal('client');
}
