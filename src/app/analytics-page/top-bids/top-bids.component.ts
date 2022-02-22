import { Component, OnInit } from '@angular/core';
import { GlobalVarsService } from 'src/app/global-vars.service';

@Component({
  selector: 'app-top-bids',
  templateUrl: './top-bids.component.html',
  styleUrls: ['./top-bids.component.scss']
})
export class TopBidsComponent implements OnInit {

  constructor(public globalVars: GlobalVarsService) { }

  ngOnInit(): void {
  }

}
