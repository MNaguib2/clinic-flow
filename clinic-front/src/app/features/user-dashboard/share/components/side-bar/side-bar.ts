import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  imports: [RouterLink, RouterLinkActive, TranslatePipe],
  selector: 'app-side-bar',
  styleUrl: './side-bar.scss',
  templateUrl: './side-bar.html',
})
export class SideBar {}
