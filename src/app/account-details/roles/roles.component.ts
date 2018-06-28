import { Component, OnInit, ElementRef, ViewEncapsulation } from '@angular/core';
import { data as kdata } from '@progress/kendo-ui/js/kendo.core.js';
import '@progress/kendo-ui/js/kendo.grid.js';
import { AccountDetailsService } from '../account-details.service';
import { AppStateService } from '../../state/app-state.service';
import { USER_ROLES, USER_ROLES_RESULT, USER_GRID, USER_RESULT_DATA_CLEAR } from '../../state/actions';

let $ = null;

@Component({
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class RolesComponent implements OnInit {
  activeLink;
  gridDataSource: any;
  gridOptions: any = {};
  gridColumn: any;
  grid: any = {};
  containerHeight: string;

  subscribed$;

  constructor(private accountDetailsService: AccountDetailsService, private el: ElementRef, private appStateService: AppStateService) {
      $ = window['jQuery'];
      this.appStateService.subscribe(USER_ROLES_RESULT, this.onResponseRoles.bind(this));
      this.appStateService.subscribe(USER_RESULT_DATA_CLEAR, this.onResponseClearInfo.bind(this));
  }

  ngOnInit() {
    this.gridInitLoader();
  }
  gridInitLoader() {
    const gridAccountTabDetails = (this.appStateService.getAccountTabDetails());
    this.gridColumn = gridAccountTabDetails._gridColumns.roles || [{}];
    this.gridOptions = {
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
    this.gridDataSource = (gridInfo) ? gridInfo.roles : [];
  }
  onResponseRoles(actions) {
    this.gridDataLoader(actions.payload.data);
  }
  onResponseClearInfo(actions) {
    this.gridDataSource = actions.payload.data;
  }
}
