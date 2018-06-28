import { Component, OnInit, OnDestroy, ElementRef, Input } from '@angular/core';
import '@progress/kendo-ui/js/kendo.ooxml.js';
import { data as kdata } from '@progress/kendo-ui/js/kendo.core.js';
import '@progress/kendo-ui/js/kendo.grid.js';
import '@progress/kendo-ui/js/kendo.draganddrop.js';
import { AccountDetailsService } from '../account-details.service';
import { USER_GRID, TOGGLE_COMMAND_COLUMN } from '../../state/actions';
import { AppStateService } from '../../state/app-state.service';

let $ = null;

@Component({
  selector: 'app-shared-grid',
  templateUrl: './shared-grid.component.html',
  styleUrls: ['./shared-grid.component.scss']
})
export class SharedGridComponent implements OnInit {
    // constants of components
    STRING_GRIDELM_ID: string = <string>'grid-account-details';
    gridToolbalEventHandlers: any;
    gridRef;
    @Input()
    set gridConfig(gridConfig) {
        const routePath = this.appStateService.getResourceLocatorPath();
        if (gridConfig.toolbar !== undefined) {
            this.gridToolbalEventHandlers = gridConfig.toolbar;
        }
        $('#' + this.STRING_GRIDELM_ID).kendoGrid(gridConfig);
        this.gridRef = $('#' + this.STRING_GRIDELM_ID).data('kendoGrid');
    }
    @Input()
    set gridDataSource(gridDataSource) {
        // refreshes datasource, filter...
        const accountDataSource = new kdata.DataSource({
            data: gridDataSource
        });
        this.gridRef.setDataSource(accountDataSource);
        this.gridRef.dataSource.read();
    };
    constructor(private el: ElementRef, private accountDetailsService: AccountDetailsService, private appStateService: AppStateService) {
        $ = window['jQuery'];
        appStateService.subscribe(TOGGLE_COMMAND_COLUMN, this.toggleCommandColumn.bind(this));
    }
    ngOnInit() {
        if (this.gridToolbalEventHandlers !== undefined) {
            this.gridToolbalEventHandlers.map((eachToolBar) => {
                if (eachToolBar.click !== undefined) {
                    $('.' + eachToolBar.className).bind('click', eachToolBar.click);
                }
                return eachToolBar;
            });
        }
        $('#' + this.STRING_GRIDELM_ID).kendoDraggable({
            dragenter :  this.droptargetOnDragEnter,
        });
    }
    droptargetOnDragEnter(e: Event): void {}
    revokeTriggered(e: Event): void {};

    toggleCommandColumn(action): void {
      if (this.gridRef) {
        const { columns } = this.gridRef.getOptions();
        const lastColumn = columns[columns.length - 1];
        const isCommandColumn = 'command' in lastColumn;

        if (isCommandColumn) {
          if (action.payload.showColumn) {
            this.gridRef.showColumn(columns.length - 1);
          } else {
            this.gridRef.hideColumn(columns.length - 1);
          }
        }
      }
    }

    clearGrid() {
        $('#' + this.STRING_GRIDELM_ID).kendoGrid({});
        this.gridRef = $('#' + this.STRING_GRIDELM_ID).data('kendoGrid');
        const { columns } = this.gridRef.getOptions();
        this.gridRef.showColumn(columns.length - 1);
    }
}
