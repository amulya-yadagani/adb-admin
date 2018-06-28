import { Component, OnInit, ElementRef, ViewEncapsulation } from '@angular/core';
import { data as kdata } from "@progress/kendo-ui/js/kendo.core.js";
import '@progress/kendo-ui/js/kendo.grid.js';
import { USER_GROUPS, USER_GROUPS_RESULT, USER_GRID, USER_RESULT_DATA_CLEAR } from '../../state/actions';
import { AppStateService } from '../../state/app-state.service';
import { AccountDetailsService } from '../account-details.service';


let $ = null;


@Component({
    templateUrl: './groups.component.html',
    styleUrls: ['./groups.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class GroupsComponent implements OnInit {
    activeLink: any;
    gridDataSource: any;
    gridOptions: any = {};
    gridColumn: any;
    grid: any = {};
    containerHeight: string;

    constructor(private accountDetailsService: AccountDetailsService, private el: ElementRef, private appStateService:AppStateService) {
        $ = window['jQuery'];
        this.appStateService.subscribe(USER_GROUPS_RESULT, this.onResponseGroups.bind(this));
        this.appStateService.subscribe(USER_RESULT_DATA_CLEAR, this.onResponseClearInfo.bind(this));
    }
    ngOnInit() {
        this.containerHeight = <string>((((parseInt(this.el.nativeElement.offsetTop, 10) * 14))).toString());
        this.gridInitLoader();
    }
    gridInitLoader() {
        const gridAccountTabDetails = (this.appStateService.getAccountTabDetails());
        this.gridColumn = gridAccountTabDetails._gridColumns.groups || [{}];
        this.gridOptions = {
            groupable: false,
            resizable: true,
            autoBind: false,
            sortable: true,
            selectable: true,
            filterable: true,
            columns: this.gridColumn,
            dataSource : []
        };
    }
    gridDataLoader(gridInfo): void {
        this.gridDataSource = gridInfo.groups || [{}];
    }
    onResponseGroups(actions): void {
        this.gridDataLoader(actions.payload.data);
    }
    onResponseClearInfo(actions): void {
        this.gridDataSource = actions.payload.data;
    }
}
