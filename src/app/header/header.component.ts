import { Component, OnInit } from '@angular/core';
import { AppRoutingModule } from '../app-routing.module';
import { GlobalVarsService } from '../global-vars.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  AppRoutingModule = AppRoutingModule;

  constructor(public globalVars: GlobalVarsService) {}

  ngOnInit(): void {
  }


}
