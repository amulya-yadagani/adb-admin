import { Component, OnInit, ElementRef, ViewEncapsulation } from '@angular/core';
import { data as kdata } from "@progress/kendo-ui/js/kendo.core.js";
import '@progress/kendo-ui/js/kendo.grid.js';
import { AccountDetailsService } from '../account-details.service';
import { AppStateService } from '../../state/app-state.service';
import { initialAppState } from '../../utils/constants';
import {
  USER_IMPERSONATIONS_RESULT,
  USER_RESULT_DATA_CLEAR } from '../../state/actions';

let $ = null;

@Component({
  selector: 'app-impersonations',
  templateUrl: './impersonations.component.html',
  styleUrls: ['./impersonations.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ImpersonationsComponent implements OnInit {
  activeLink;
  gridDataSource: any;
  gridOptions: any = {};
  gridColumn: any;
  grid: any = {};
  // containerHeight: string;

  subscribed$;
  initialAppState;

  constructor(private accountDetailsService: AccountDetailsService, private el: ElementRef, private appStateService: AppStateService) {
      $ = window['jQuery'];
      this.appStateService.subscribe(USER_IMPERSONATIONS_RESULT, this.onResponseImpersonations.bind(this));
      this.appStateService.subscribe(USER_RESULT_DATA_CLEAR, this.onResponseClearInfo.bind(this));
  }

  ngOnInit() {
    // this.containerHeight = <string> (((this.el.nativeElement.offsetParent.clientHeight-190)*90)/100).toString();
    this.gridInitLoader();
  }
  gridInitLoader() {
    const gridAccountTabDetails = (this.appStateService.getAccountTabDetails());
    this.gridColumn = gridAccountTabDetails._gridColumns.impersonations || [{}];
    this.gridOptions = {
        // height : '100vh',
        groupable: false,
        sortable: true,
        resizable: true,
        selectable: true,
        filterable: true,
        columns: this.gridColumn,
        dataSource : [],
    };
  }
  gridDataLoader(gridInfo) {
    if (gridInfo.impersonations) {
      gridInfo.impersonations = gridInfo.impersonations.map((eachImpersonation) => {
        eachImpersonation.effectiveDate = eachImpersonation.effectiveDate.split('T')[0];
        eachImpersonation.expires = eachImpersonation.expires.split('T')[0];
        return eachImpersonation;
      });
      this.gridDataSource = gridInfo.impersonations || [{}];
    }
  }
  onResponseImpersonations(actions) {
    let impersonationData;
    if ((actions.payload.data).hasOwnProperty('impersonations')) {
      impersonationData = { 'impersonations': actions.payload.data.impersonations};
    }else {
      impersonationData = {};
    }
    this.gridDataLoader(impersonationData);
  }
  onResponseClearInfo(actions): void {
    this.gridDataSource = actions.payload.data;
  }
}
