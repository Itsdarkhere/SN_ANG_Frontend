import { Component, OnInit } from '@angular/core';
import { GlobalVarsService } from '../global-vars.service';

@Component({
  selector: 'app-creator-card',
  templateUrl: './creator-card.component.html',
  styleUrls: ['./creator-card.component.scss']
})
export class CreatorCardComponent implements OnInit {

  pk = "BC1YLfgucuJF6n288pZNhfkTeXsFiWNEgfDoK6jw97jkdoGcKtEUDTW";
  constructor(public globalVars: GlobalVarsService) {}

  ngOnInit(): void {}
}
