import { Component, OnInit, AfterViewInit, ViewEncapsulation } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { AppStateService } from '../state/app-state.service';
import { data as kdata } from '@progress/kendo-ui/js/kendo.core.js';
import '@progress/kendo-ui/js/kendo.grid.js';
import { AUDIT_LOG, AUDIT_LOG_RESULT, ACCOUNT_SELECT, AFTER_SAVE_ALL_RESET } from '../state/actions';
import { AUDITLOG_URL, USERACCOUNT_URL } from '../utils/constants';
import { AuditLogService } from './audit-log.service';

let $ = null;

@Component({
    selector: 'adb-audit-log',
    templateUrl: './audit-log.component.html',
    styleUrls: ['./audit-log.component.scss'],
    encapsulation: ViewEncapsulation.None
})

export class AuditLogComponent implements OnInit {
    STRING_JQuery = 'jQuery';
    STRING_NAV = 'accountDetails';
    STRING_Elm_Grid = 'auditLogGrid';
    STRING_POST = 'POST';
    auditUrl = '/auditLog';
    auditGrid = '';
    auditDataSource = {
        data: [],
        schema: {
            model: {
                field: {
                    applicationName: {type: 'string'},
                    deletedByUsername: {type: 'string'},
                    parentResourceName: {type: 'string'},
                    authorityName: {type: 'string'},
                    accountDisplayName: {type: 'string'},
                    deletedDate: {
                        type: 'date'
                    }
                }
            }
        }
    };
    auditColumn = [
        { field: 'applicationName', title: 'Application Name',
            filterable: {
                multi: true,
                search: true
            }
        },
        { field: 'deletedByUsername', title: 'Deleted By User Name', filterable: false,
            template: (item) => {
                return `<a class='delUsrLink'>${item.deletedByUserDisplayName}</a>`;
            }
        },
        { field: 'parentResourceName', title: 'Parent Resource Name', filterable: false},
        { field: 'authorityName', title: 'Authority Name', filterable: false },
        { field: 'accountDisplayName', title: 'Affected Account', filterable: false, width: 100,
            template: (item) => {
                return `<a class='accDisLink'>${item.accountDisplayName}</a>`;
            }
        },
        {
            field: 'deletedDate',
            template: '#= kendo.toString(kendo.parseDate(deletedDate, "MM/dd/yyyy"), "MM-dd-yyyy") #',
            format: '{0:MM/dd/yyyy}',
            title: 'Deleted Date',
            filterable: false,
            width: 100
        }
    ];

    constructor(private _auditLogService: AuditLogService, private _appStateService: AppStateService, private _router: Router) {
        $ = window[this.STRING_JQuery];
        this._appStateService.subscribe(AUDIT_LOG_RESULT, this.onResAuditLog.bind(this));
        this._router.events.filter((event: any) => {
            return event instanceof NavigationEnd;
        })
        .subscribe((route: any) => {
            if (route.url === this.auditUrl) {
                const action = {
                    type : AUDIT_LOG,
                    payload: {
                        url : AUDITLOG_URL
                    }
                };
                this.generateAction(action);
            }
        });
        this._appStateService.subscribe(AFTER_SAVE_ALL_RESET, this.reloadGrid.bind(this));
    }

    ngOnInit() {
        const self = this;
        $('#' + this.STRING_Elm_Grid).kendoGrid({
            dataSource: this.auditDataSource,
            columnResizeHandleWidth: 20,
            columns: this.auditColumn,
            height: '100%',
            resizable: true,
            selectable: true,
            sortable: true,
            filterable : {
                operators: {
                    string: {
                        eq: 'Equal to',
                        neq: 'Not equal to'
                    }
                },
            },
            dataBound : function(e: Event) {
                self.boundData(e, self);
            }
        });
        this.auditGrid = $('#' + this.STRING_Elm_Grid).data('kendoGrid');
    }

    boundData(e: Event, self) {
        (e as any).sender.element.find('.delUsrLink').bind('click', function(event: Event) {
            const delAccountName = self.auditGrid.dataItem($(event.target).closest('tr')).deletedByUsername;
            self.onAccClkTrigger(delAccountName);
            event.preventDefault(); // avoid page reload...
        });
        (e as any).sender.element.find('.accDisLink').bind('click', function(event: Event) {
            const affAccountName = self.auditGrid.dataItem($(event.target).closest('tr')).accountUsername;
            self.onAccClkTrigger(affAccountName);
            event.preventDefault(); // avoid page reload...
        });
    }

    generateAction(action): void {
        this._appStateService.dispatch(action);
    }

    onResAuditLog(resultData): void {
        let auditLogData = resultData.payload.data || [];
        auditLogData = auditLogData.map((eachLogData) => {
            eachLogData.deletedDate = new Date(eachLogData.deletedDate.split(' ')[0]);
            return eachLogData;
        });
        (this.auditGrid as any).dataSource.data(auditLogData);
        this._appStateService.showLoader(false);
    }

    onAccClkTrigger(accName) {
        const action = {
            type: ACCOUNT_SELECT,
            payload: {
                url: USERACCOUNT_URL + accName,
                reqType: this.STRING_POST,
                query: {accountName: accName}
            }
        };
        const promise = this._router.navigate([this.STRING_NAV]);
        promise.then(result => {
            this.generateAction(action);
        });
    }

    reloadGrid() {
        const action = {
            type : AUDIT_LOG,
            payload: {
                url : AUDITLOG_URL
            }
        };
        this.generateAction(action);
    }
};
