import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar';
import { SidebarComponent } from '../sidebar/sidebar';

@Component({
    selector: 'app-layout',
    standalone: true,
    imports: [RouterOutlet, NavbarComponent, SidebarComponent],
    templateUrl: './app-layout.html',
    styleUrls: ['./app-layout.css']
})
export class AppLayoutComponent {
    // This component serves as a layout wrapper
    // It includes the navbar, sidebar, and router outlet
} 