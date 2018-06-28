import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AppStateService } from '../state/app-state.service';
import { APPLICATIONS, ACCOUNT_SELECT, APPLICATIONS_RESULT, ROLES, ROLES_RESULT, USERS_DATA, USERS_DATA_RESULT, AFTER_SAVE_ALL_RESET } from '../state/actions';
import { USERACCOUNT_URL, APPLICATION_USER_URL, APPLICAION_ROLES_URL, APPLICATION_APPUSER_URL } from '../utils/constants';
import "@progress/kendo-ui/js/kendo.grid.js";
import "@progress/kendo-ui/js/kendo.listview.js";
import "@progress/kendo-ui/js/kendo.datepicker.js";
import { data as kdata } from "@progress/kendo-ui/js/kendo.core.js";

let $ = null;
let kendo;

@Component({
    moduleId: module.id,
    selector: 'adb-app-users',
    templateUrl: 'app-users.component.html',
    styleUrls: ['app-users.component.scss'],
    encapsulation: ViewEncapsulation.None
})

export class AppUsersComponent implements OnInit {
    // constants variables
    POST = 'POST';
    NAV = 'accountDetails';
    kendoGridId = 'app-user-grid';
    singleNoneSelect: string = <string>'SingleNoneAppSelect';
    multiSelect: string = <string>'MultiAppSelect';
    kendoColGrid = [
        {
            field: 'name', title: 'Account Name',
            template: (item) => {
                const userActive = (item.isActive) ? 'isActive' : 'isInactive';
                return `<div class="account-link ${userActive}">${item.name || ''}</div>`;
            },
            filterable: { extra: true, multi: true, search: true }
        },
        {
            field: 'firstName', title: 'First Name',
            template: (item) => {
                const userActive = (item.isActive) ? 'isActive' : 'isInactive';
                return `<div class="${userActive}">${item.firstName || ''}</div>`;
            },
            filterable: { extra: true, multi: true, search: true}
        },
        {
            field: 'lastName',  title: 'Last Name',
            template: (item) => {
                const userActive = (item.isActive) ? 'isActive' : 'isInactive';
                return `<div class="${userActive}">${item.lastName || ''}</div>`;
            },
            filterable: { extra: true, multi: true, search: true}
        },
        {
            field: "department", title: "Department",
            template: (item) => {
                const userActive = (item.isActive) ? 'isActive' : 'isInactive';
                return `<div class="${userActive}">${item.department || ''}</div>`;
            },
            filterable: { extra: true, multi: true, search: true} },
        {
            field: "company", title: "Company",
            template: (item) => {
                const userActive = (item.isActive) ? 'isActive' : 'isInactive';
                return `<div class="${userActive}">${item.company || ''}</div>`;
            },
            filterable: { extra: true, multi: true, search: true} },
        {
            field: "emailAddress", title: "Email",
            template: (item) => {
                const userActive = (item.isActive) ? 'isActive' : 'isInactive';
                return `<div class="${userActive}">${item.emailAddress || ''}</div>`;
            },
            filterable: { extra: true, multi: true, search: true} },
        {
            field: "phoneNumber", title: "Phone",
            template: (item) => {
                const userActive = (item.isActive) ? 'isActive' : 'isInactive';
                return `<div class="${userActive}">${item.phoneNumber || ''}</div>`;
            },
            filterable: { extra: true, multi: true, search: true} },
        {
            field: "isActive",
            'template': (item) => {
                let checked;
                if (item.isActive) {
                    checked = `<input type="checkbox" checked="${item.isActive}" disabled>`;
                }else {
                    checked = `<input type="checkbox" disabled>`;
                }
                return checked;
            },
            filterable: {
                multi: true,
                checkAll: true
                // dataSource: [{isActive: true}, {isActive: false}],
            }
        },
        {
            title: "Last Login Date",
            field: "lastLoginDate",
            format:"{0:yyyy-MM-dd}",
            // headerTemplate: '<label for="check-all"><b>Last Login Date</b></label>',
            headerAttributes: { style: "text-align: center;" },
            // filterable: {
            //     ui: function (element) {
            //         element.kendoDatePicker({
            //             format: 'yyyy MM, dd'
            //         });
            //     }
            // },
            template: (lastLoginValidate) => {
                const userActive = (lastLoginValidate.isActive) ? 'isActive' : 'isInactive';
                let templateRenderInfo = '';
                if ( (lastLoginValidate.lastLoginDate.toLowerCase().trim() === 'no login')) {
                    templateRenderInfo = `<div class="${userActive}">No Login</div>`;
                } else {
                    templateRenderInfo =`<div class="${userActive}"> ${(kendo.toString(lastLoginValidate.lastLoginDate, 'yyyy-MM-dd'))}</div>`;
                }
                // return `<div class="${userActive}">${(lastLoginValidate.lastLoginDate == null) ? 'No Login' : kendo.toString(lastLoginValidate.lastLoginDate.split(" ")[0], 'yyyy-MM-dd')}</div>`;
                return templateRenderInfo;
            }
        }
    ];
    //------------------------End of constants---------------------------//
    gridRef: any = {};
    appSelected: any = [];
    roleSelected: any = [];
    appData: Array<any> = [];
    appRoles: Array<any> = [];
    appDisabled: boolean = true;
    rolesDisabled: boolean = true;
    exportDisabled: boolean = true;
    previousSelection: any = '';
    storeAppId: any = [];
    storeRoleId: any = [];
    storeReqId: any = [];
    storeLogic: any = {
        disabled: true,
        logic: true
    };
    exportFileName: string = '';
    selectedInfo: any = {
        url: '',
        params: ''
    };
    // toggleBtn: Array<any> = [
    //     {text: 'OR', selected: false, disabled: true},
    //     {text: 'AND', selected: false, disabled: true}
    // ];
    enableLogicBtn: any = {
        selectable : false,
        info: [
            {text: 'OR', selected: false, disabled: true},
            {text: 'AND', selected: false, disabled: true}
        ]
    };
    gridData = {
        data: [],
    };
    defaultApplication = [
        { applicationId: 0, name: 'All' },
        { applicationId: -1, name: 'All Application'},
        { applicationId: -2, name: 'None' }
    ];
    defaultRoles = [
        {'roleId': 0, 'application': null, 'roleName': 'All', 'description': null, 'source' : null, 'sourceAccount': null},
        {'roleId': -1, 'application': null, 'roleName': 'All Roles', 'description': null, 'source' : null, 'sourceAccount': null},
        {'roleId': -2, 'application': null, 'roleName': 'None', 'description': null, 'source' : null, 'sourceAccount': null}
    ];

    @ViewChild('appmultiselect') public appmultiselect: any;
    @ViewChild('rolemultiselect') public rolemultiselect: any;

    constructor(private stateService: AppStateService, private _router: Router) {
        $ = window['jQuery'];
        kendo = window['kendo'];
        stateService.subscribe(APPLICATIONS_RESULT, this.getAppData.bind(this));
        stateService.subscribe(ROLES_RESULT, this.getRoleData.bind(this));
        stateService.subscribe(USERS_DATA_RESULT, this.getGridData.bind(this));
        this.stateService.subscribe(AFTER_SAVE_ALL_RESET, this.resetApplicationUser.bind(this));
    }

    ngOnInit() {
        const self = this;
        this.appRoles = this.defaultRoles;
        this.stateService.dispatch({
            type: APPLICATIONS,
            payload: {
                url: APPLICATION_USER_URL
            }
        });
        $('#' + this.kendoGridId).kendoGrid({
            dataSource: this.gridData,
            noRecords: true,
            excel: {
                allPages: true,
                fileName: 'AppUsers.xlsx'
            },
            excelExport: function(e: Event) {
                let exportName;
                const appSelection = self.appSelected[0].name.toUpperCase();
                if (self.appSelected.length === 0) {
                    return;
                } else if (self.appSelected.length === 1) {
                    switch (appSelection) {
                        case 'ALL' :
                            exportName = appSelection + '_USERS';
                            break;
                        case 'ALL APPLICATION' :
                            exportName = appSelection + '_USERS_' + self.storeLogic.logic;
                            break;
                        case 'NONE' :
                            exportName = appSelection + '_USERS';
                            break;
                        default :
                            exportName = appSelection + '_USERS';
                            break;
                    }
                } else if (self.appSelected.length > 1) {
                    exportName = 'APPLICATION_USERS_' + self.storeLogic.logic;
                }
                (e as any).workbook.fileName = exportName + ".xlsx";
            },
            scrollable: true,
            resizable: true,
            filterable: true,
            // filterMenuInit: onFilterMenuInit,
            sortable: true,
            columns: this.kendoColGrid,
            dataBound: function(e: Event) {
                (e as any).sender.element.find('.account-link').bind('click', function(event: Event) {
                    const gridRef = $('#' + self.kendoGridId).data('kendoGrid');
                    const accountInfo = gridRef.dataItem($(event.target).closest('tr'));
                    self.loadAccountDetails(accountInfo);
                });
            }
        });
        this.gridRef = $('#' + this.kendoGridId).data('kendoGrid');
        function onFilterMenuInit(e) {
            if (e.field == "accountName") {
                initCheckboxFilter.call(this, e);
            }
        }
        function initCheckboxFilter(e) {
            var popup = e.container.data("kendoPopup");
            var dataSource = this.dataSource;
            var field = e.field;
            var checkboxesDataSource = new kdata.DataSource({
                data: dataSource.data()
            });
            var helpTextElement = e.container.children(":first").children(":first");
            var element = $("<div class='checkbox-container'></div>").insertAfter(helpTextElement).kendoListView({
            dataSource: checkboxesDataSource,
            template: "<div><input type='checkbox' value='#:" + field + "#'/>#:" + field + "#</div>"
            });

            e.container.find("[type='submit']").click(function (e) {
                var filter = dataSource.filter() || { logic: "and", filters: [] };
                var fieldFilters = $.map(element.find(":checkbox:checked"), function (input) {
                    return {
                    field: field,
                    operator: "eq",
                    value: input.value
                    };
                });

                if (fieldFilters.length) {
                    e.preventDefault();
                    e.stopPropagation();
                    removeFiltersForField(filter, field);
                    filter.filters.push({
                        logic: 'or',
                        filters: fieldFilters
                    });
                    dataSource.filter(filter);
                    popup.close();
                }
            });
        }

        function removeFiltersForField(expression, field) {
            if (expression.filters) {
                expression.filters = $.grep(expression.filters, function (filter) {
                    removeFiltersForField(filter, field);
                    if (filter.filters) {
                        return filter.filters.length;
                    } else {
                        return filter.field != field;
                    }
                });
            }
        }
    }

    resetApplicationUser() {
        this.appSelected = [];
        this.roleSelected = [];
        this.exportDisabled = true;
        this.appDisabled = true;
        this.rolesDisabled = true;
        this.storeAppId = [];
        this.storeRoleId = [];
        this.storeReqId = [];
        this.storeLogic = {
            disabled: true,
            logic: true
        };
        this.exportFileName = '';
        this.selectedInfo = {
            url: '',
            params: ''
        };
        this.enableLogicBtn = {
            selectable : false,
            info: [
                {text: 'OR', selected: false, disabled: true},
                {text: 'AND', selected: false, disabled: true}
            ]
        };
        this.rolemultiselect.toggle(true);
        this.appmultiselect.toggle(true);
        this.clearKendoGrid();
        this.stateService.dispatch({
            type: APPLICATIONS,
            payload: {
                url: APPLICATION_USER_URL
            }
        });
    }

    openPopup() {
        setTimeout(() => {
            // this workaround for popup covering dropdown, when it is opened.
            (document.getElementsByTagName('kendo-popup')[0] as any).style.top = '123px';
        }, 300);
    }

    getAppData(action): void {
        this.appDisabled = false;
        this.appData = action.payload.data;
        this.appData = this.defaultApplication.concat(this.appData);
    }

    getRoleData(action): void {
        this.appRoles = action.payload.data;
        this.appRoles = this.defaultRoles.concat(this.appRoles);
        this.rolesDisabled = false;
    }

    appValueChange(selectedApp: Array<any>): void {
        this.openPopup(); // auto sets the pop up to fixed position...
        this.storeAppId = [];
        this.storeRoleId = [];
        const findRelventApp: Array<any> = [];
        const gridRef = $('#' + this.kendoGridId).data('kendoGrid');
        if (this.appSelected.length === 0 && this.roleSelected.length > 0) {
            this.roleSelected = [];
            this.rolemultiselect.toggle(false);
            this.appmultiselect.toggle(true);
            this.rolesDisabled = true;
            this.exportDisabled = true;
            this.enableLogicBtn.selectable = false;
            if (!this.enableLogicBtn.selectable) {
                this.enableLogicBtn.info = this.enableLogicBtn.info.map((eachBtn) => {
                    eachBtn.selected = false;
                    eachBtn.disabled = true;
                    return eachBtn;
                });
                this.storeLogic.disabled = false;
                this.storeLogic.logic = true;
            }
            this.clearKendoGrid();
        } else if (this.appSelected.length > 0) {
            const reverseData = this.appSelected.reverse();
            const findLatestSelection = this.appSelected.find((eachApp) => {
                const appName = eachApp.name.toUpperCase();
                if (appName === 'ALL') {
                    return 'ALL';
                } else if (appName === 'ALL APPLICATION') {
                    return 'ALL APPLICATION';
                } else if (appName === 'NONE') {
                    return 'NONE';
                } else if (appName !== 'ALL' && appName !== 'ALL APPLICATION' && appName !== 'NONE') {
                    return 'INDIVIDUAL APPS';
                }
            });
            let appLength;
            switch (findLatestSelection.name.toUpperCase()) {
                case 'ALL' :
                    this.appSelected = this.appData.slice(0, 1);
                    this.storeAppId = this.appData.slice(0, 1).map((eachApp, index) => {
                        return {['applications']: eachApp.applicationId};
                    });
                    //-------------------btn logic----------------
                    this.enableLogicBtn.selectable = false;
                    if (!this.enableLogicBtn.selectable) {
                        this.enableLogicBtn.info = this.enableLogicBtn.info.map((eachBtn) => {
                            eachBtn.selected = false;
                            eachBtn.disabled = true;
                            return eachBtn;
                        });
                        this.storeLogic.disabled = false;
                        this.storeLogic.logic = true;
                    }
                    //--------------------btn logic ---------------
                    this.appRoles = this.appRoles.slice(0, 3);
                    this.rolesDisabled = true;
                    if (this.roleSelected.length === 0) {
                        // at initial we add all when all selected...
                        this.rolesHardReset();
                        this.storeRoleId.push({['roles']: 0});
                        // this.storeAppId.push({['isOr']: true});
                        this.roleSelected = this.appRoles.slice(0, 1);
                    } else {
                        // when user revisits all, we try to find selection is under below follows if not hard reset... for user to select...
                        // const findCustomRolesSelected = this.roleSelected.find((eachRoles) => {
                        //     if ((eachRoles.roleName.toUpperCase() === 'ALL') ||
                        //     (eachRoles.roleName.toUpperCase() === 'ALL ROLES') ||
                        //     (eachRoles.roleName.toUpperCase() === 'NONE')) {
                        //         return eachRoles;
                        //     }
                        // });
                        // if (findCustomRolesSelected) {
                        //     this.storeRoleId.push({['roles']: findCustomRolesSelected.roleId});
                        // }else {
                        //     // invokes, individual app and its related roles selected,
                        //     // if user tries selecting all again, we reset it back...
                        //     this.rolesHardReset();
                        //     this.storeRoleId.push({['roles']: 0});
                        //     this.roleSelected = this.appRoles.slice(0, 1);
                        // }
                        // below code commented, as we considered before all apps will have fixed all roles.
                        this.rolesHardReset();
                        this.storeRoleId.push({['roles']: 0});
                        this.roleSelected = this.appRoles.slice(0, 1);
                    }
                    this.storeReqId = this.storeAppId.concat(this.storeRoleId);
                    console.log(this.storeReqId);
                    gridRef.hideColumn('lastLoginDate');
                    // this.selectedInfo = this.defaultReqSelection(APPLICATION_APPUSER_URL, this.storeReqId);
                    break;
                case 'ALL APPLICATION' :
                    appLength = this.appData.length;
                    this.appSelected = this.appData.slice(1, 2);
                    this.rolesDisabled = false;
                    //-------------------btn logic----------------
                    this.enableLogicBtn.selectable = true;
                    if (this.enableLogicBtn.selectable) {
                        const alreadySelected = this.enableLogicBtn.info.find((eachBtn) => {
                            if (eachBtn.selected) {
                                if (eachBtn.text.toUpperCase() === 'AND') { this.storeLogic.logic = false; }
                                return eachBtn;
                            };
                            if (eachBtn.text.toUpperCase() === 'OR') {
                                this.storeLogic.disabled = false;
                                this.storeLogic.logic = true;
                            } else {
                                this.storeLogic.disabled = false;
                                this.storeLogic.logic = false;
                            }
                        });
                        if (!(alreadySelected)) {
                            this.enableLogicBtn.info = this.enableLogicBtn.info.map((eachBtn) => {
                                if (eachBtn.text.toUpperCase() === 'OR') {
                                    eachBtn.selected = true;
                                    eachBtn.disabled = true;
                                } else {
                                    eachBtn.selected = false;
                                    eachBtn.disabled = false;
                                }
                                return eachBtn;
                            });
                            this.storeLogic.disabled = false;
                            this.storeLogic.logic = true;
                        }
                    };
                    //--------------------btn logic ---------------
                    this.storeAppId = this.appData.slice(1, 2).map((eachApp, index) => {
                        return {['applications']: eachApp.applicationId};
                    });
                    if (this.roleSelected.length === 0) {
                        this.rolesHardReset();
                        this.storeRoleId.push({['roles']: 0});
                        // this.storeAppId.push({['isOr']: true});
                        this.roleSelected = this.appRoles.slice(0, 1);
                    } else {
                        // when user revisits all, we try to find selection is under below follows if not hard reset... for user to select...
                        const findCustomRolesSelected = this.roleSelected.find((eachRoles) => {
                            if ((eachRoles.roleName.toUpperCase() === 'ALL') ||
                            (eachRoles.roleName.toUpperCase() === 'ALL ROLES') ||
                            (eachRoles.roleName.toUpperCase() === 'NONE')) {
                                return eachRoles;
                            }
                        });
                        if (findCustomRolesSelected) {
                            this.storeRoleId.push({['roles']: findCustomRolesSelected.roleId});
                        }else {
                            this.rolesHardReset();
                            this.storeRoleId.push({['roles']: 0});
                            this.roleSelected = this.appRoles.slice(0, 1);
                        }
                        // this.rolesHardReset();
                        // this.storeRoleId.push({['roles']: 0});
                        // this.roleSelected = this.appRoles.slice(0, 1);
                    }
                    this.storeReqId = this.storeAppId.concat(this.storeRoleId);
                    gridRef.hideColumn('lastLoginDate');
                    break;
                case 'NONE' :
                    this.appSelected = this.appData.slice(2, 3);
                    this.storeAppId = this.appSelected.map((eachApp, index) => {
                        return {['applications']: eachApp.applicationId};
                    });
                    //-------------------btn logic----------------
                    this.enableLogicBtn.selectable = false;
                    if (!this.enableLogicBtn.selectable) {
                        this.enableLogicBtn.info = this.enableLogicBtn.info.map((eachBtn) => {
                            eachBtn.selected = false;
                            eachBtn.disabled = true;
                            return eachBtn;
                        });
                    }
                    //--------------------btn logic ---------------
                    this.rolesDisabled = true;
                    this.storeRoleId = [{['roles']: -2}];
                    this.roleSelected = this.appRoles.slice(2, 3);
                    this.storeReqId = this.storeAppId.concat(this.storeRoleId);
                    console.log(this.storeReqId);
                    gridRef.hideColumn('lastLoginDate');
                    // this.selectedInfo = this.defaultReqSelection(APPLICATION_APPUSER_URL, this.storeReqId);
                    break;
                default :
                    this.appSelected.forEach((eachApp) => {
                        const appName = eachApp.name.toUpperCase();
                        if (appName !== 'ALL' && appName !== 'ALL APPLICATION' && appName !== 'NONE') {
                            findRelventApp.push(eachApp);
                        }
                    });
                    this.appSelected = findRelventApp.reverse();
                    if (findRelventApp.length <= 1) {
                        // this triggers when one app with roles or no roles...
                        // this.toggleBtn = this.defaultToggleBtn(this.singleNoneSelect, this.toggleBtn);
                        this.rolesHardReset();  // fresh data gets loaded, hence we hard reset it...
                        this.rolesDisabled = false;
                        //-------------------btn logic----------------
                        this.enableLogicBtn.selectable = false;
                        this.storeLogic.disabled = true;
                        this.storeLogic.logic = true;
                        if (!this.enableLogicBtn.selectable) {
                            this.enableLogicBtn.info = this.enableLogicBtn.info.map((eachBtn) => {
                                eachBtn.selected = false;
                                eachBtn.disabled = true;
                                return eachBtn;
                            });
                            this.storeLogic.disabled = true;
                            this.storeLogic.logic = true;
                        }
                        //--------------------btn logic ---------------
                        this.storeAppId = this.appSelected.map((eachApp, index) => {
                            if ((index === 0) && (this.appSelected.length === 1) && (this.roleSelected.length === 0)) {
                                return {['applicationId']: eachApp.applicationId};
                            } else if (index === 0 && this.appSelected.length > 1) {
                                return {['applications']: eachApp.applicationId};
                            }else {
                                return {['applications']: eachApp.applicationId};
                            }
                        });
                        if (this.roleSelected.length > 0) {
                            this.storeRoleId = this.roleSelected.map((eachRole) => {
                                return {['roleId']: eachRole.roleId};
                            });
                        }
                        this.exportDisabled = true;
                        this.storeReqId = this.storeAppId.concat(this.storeRoleId);
                        gridRef.showColumn('lastLoginDate');
                    } else {
                        //-------------------btn logic----------------
                        this.enableLogicBtn.selectable = true;
                        this.storeLogic.disabled = false;
                        if (this.enableLogicBtn.selectable) {
                            const alreadySelected = this.enableLogicBtn.info.find((eachBtn) => {
                                if (eachBtn.selected) {
                                    if (eachBtn.text.toUpperCase() === 'OR') {
                                        this.storeLogic.disabled = false;
                                        this.storeLogic.logic = true;
                                    } else if (eachBtn.text.toUpperCase() === 'AND') {
                                        this.storeLogic.disabled = false;
                                        this.storeLogic.logic = false;
                                    }
                                    return eachBtn;
                                }
                                // if (eachBtn.text.toUpperCase() === 'OR') {
                                //     this.storeLogic.disabled = false;
                                //     this.storeLogic.logic = true;
                                // } else {
                                //     this.storeLogic.disabled = false;
                                //     this.storeLogic.logic = false;
                                // }
                            });
                            if (!alreadySelected) {
                                this.enableLogicBtn.info = this.enableLogicBtn.info.map((eachBtn) => {
                                    if (eachBtn.text.toUpperCase() === 'OR') {
                                        eachBtn.selected = true;
                                        eachBtn.disabled = true;
                                    } else {
                                        eachBtn.selected = false;
                                        eachBtn.disabled = false;
                                    }
                                    return eachBtn;
                                });
                                this.storeLogic.logic = true;
                                this.storeLogic.disabled = false;
                            }
                        }
                        //--------------------btn logic ---------------
                        this.storeAppId = this.appSelected.map((eachApp, index) => {
                            if ((index === 0) && (this.appSelected.length === 1) && (this.roleSelected.length === 0)) {
                                return {['applicationId']: eachApp.applicationId};
                            } else if (index === 0 && this.appSelected.length > 1) {
                                return {['applications']: eachApp.applicationId};
                            }else {
                                return {['applications']: eachApp.applicationId};
                            }
                        });
                        if (this.roleSelected.length === 0) {
                            this.rolesHardReset();
                            this.storeRoleId.push({['roles']: 0});
                            this.roleSelected = this.appRoles.slice(0, 1);
                        } else {
                            // when user revisits all, we try to find selection is under below follows if not hard reset... for user to select...
                            const findCustomRolesSelected = this.roleSelected.find((eachRoles) => {
                                if ((eachRoles.roleName.toUpperCase() === 'ALL') ||
                                (eachRoles.roleName.toUpperCase() === 'ALL ROLES') ||
                                (eachRoles.roleName.toUpperCase() === 'NONE')) {
                                    return eachRoles;
                                }
                            });
                            if (findCustomRolesSelected) {
                                this.storeRoleId.push({['roles']: findCustomRolesSelected.roleId});
                                this.appRoles = this.appRoles.slice(0, 3);
                            }else {
                                this.rolesHardReset();
                                this.storeRoleId.push({['roles']: 0});
                                this.roleSelected = this.appRoles.slice(0, 1);
                            }
                        }
                        this.storeReqId = this.storeAppId.concat(this.storeRoleId);
                        console.log(this.storeReqId);
                        gridRef.hideColumn('lastLoginDate');
                    }
                    break;
            }
        } else {
            this.roleSelected = [];
            //-------------------btn logic----------------
            this.enableLogicBtn.selectable = false;
            if (!this.enableLogicBtn.selectable) {
                this.enableLogicBtn.info = this.enableLogicBtn.info.map((eachBtn) => {
                    eachBtn.selected = false;
                    eachBtn.disabled = true;
                    return eachBtn;
                });
                this.storeLogic.disabled = true;
                this.storeLogic.logic = true;
            }
            //--------------------btn logic ---------------
            this.rolesDisabled = true;
            this.clearKendoGrid();
            this.exportDisabled = true;
            gridRef.showColumn('lastLoginDate');
        }
    }

    defaultReqSelection(url, data) {
        const selection = {
            url: url,
            params: data
        };
        return selection;
    };

    rolesValueChange(selectedRole: Array<any>): void {
        const findRelventRole: Array<any> = [];
        this.storeAppId = [];
        this.storeRoleId = [];
        this.storeAppId = this.appSelected.map((appId, index) => {
            return {['applications']: appId.applicationId};
        });
        if (this.roleSelected.length > 0) {
            const reverseData = this.roleSelected.reverse();
            const findLatestSelection = reverseData.find((eachRole) => {
                const roleName = eachRole.roleName.toUpperCase();
                if (roleName === 'ALL') {
                    return 'ALL';
                } else if (roleName === 'ALL ROLES') {
                    return 'ALL ROLES';
                } else if (roleName === 'NONE') {
                    return 'NONE';
                } else if (roleName !== 'ALL' && roleName !== 'ALL ROLES' && roleName !== 'NONE') {
                    return 'INDIVIDUAL ROLES';
                }
            });
            switch (findLatestSelection.roleName.toUpperCase()) {
                case 'ALL' :
                    this.roleSelected = this.appRoles.slice(0, 1);
                    this.storeRoleId = [{['roles'] : 0}];
                    this.storeLogic.disabled = false;
                    this.storeReqId = this.storeReqId.map((eachReq) => {
                        if ('isOr' in eachReq) {
                            eachReq.isOr = this.storeLogic.logic;
                        }
                        return eachReq;
                    });
                    this.storeReqId = this.storeAppId.concat(this.storeRoleId);
                    break;
                case 'ALL ROLES' :
                    this.roleSelected = this.appRoles.slice(1, 2);
                    this.storeRoleId = [{['roles'] : -1}];
                    this.storeLogic.disabled = false;
                    this.storeReqId = this.storeReqId.map((eachReq) => {
                        if ('isOr' in eachReq) {
                            eachReq.isOr = this.storeLogic.logic;
                        }
                        return eachReq;
                    });
                    this.storeReqId = this.storeAppId.concat(this.storeRoleId);
                    break;
                case 'NONE' :
                    this.roleSelected = this.appRoles.slice(2, 3);
                    this.storeRoleId = [{['roles'] : -2}];
                    this.storeLogic.disabled = false;
                    this.storeReqId = this.storeReqId.map((eachReq) => {
                        if ('isOr' in eachReq) {
                            eachReq.isOr = this.storeLogic.logic;
                        }
                        return eachReq;
                    });
                    this.storeReqId = this.storeAppId.concat(this.storeRoleId);
                    break;
                default :
                    this.roleSelected.forEach((eachRole) => {
                        const roleName = eachRole.roleName.toUpperCase();
                        if (roleName !== 'ALL' && roleName !== 'ALL ROLES' && roleName !== 'NONE') {
                            findRelventRole.push(eachRole);
                        }
                    });
                    this.roleSelected = findRelventRole.reverse();
                    this.storeRoleId = this.roleSelected.map((eachRole, index) => {
                        return {['roles']: eachRole.roleId};
                    });
                    this.storeLogic.disabled = false;
                    this.storeReqId = this.storeReqId.map((eachReq) => {
                        if ('isOr' in eachReq) {
                            eachReq.isOr = this.storeLogic.logic;
                        }
                        return eachReq;
                    });
                    this.storeReqId = this.storeAppId.concat(this.storeRoleId);
                    break;
            }
        } else {
            if (this.roleSelected.length === 0) {
                this.storeLogic.disabled = true;
                this.exportDisabled = true;
            }
            this.clearKendoGrid();
        }
    }

    loadAccountDetails(accountInfo: any): void {
        // triggers hyper link of account Name re-directing it to Account Details tab...
        const actions = {
            type: ACCOUNT_SELECT,
            reqType: this.POST,
            payload: {
                url: USERACCOUNT_URL + accountInfo.name,
                query: { accountName : accountInfo.name }
            }
        };
        const promise = this._router.navigate([this.NAV]);
        promise.then(result => {
            this.stateService.dispatch(actions);
        });
    }

    getGridData(actionData): void {
        const gridRef = $('#' + this.kendoGridId).data('kendoGrid');
        const appUsrDataSource = new kdata.DataSource({
            data: actionData.payload.gridData,
            schema: { // schema should be updated for new data for checkbox filter to work...
                model: {
                    id: 'isActive',
                    fields: {
                        isActive: { type: 'boolean' }
                    }
                }
            }
        });
        if (appUsrDataSource && appUsrDataSource.options.data) {
            gridRef.setDataSource(appUsrDataSource);
            gridRef.dataSource.read();
            this.exportDisabled = false;
        } else {
            this.clearKendoGrid();
            this.exportDisabled = true;
        }
    }

    exportToExcel(): void {
        const grid = $('#' + this.kendoGridId).data('kendoGrid');
        grid.saveAsExcel();
    }

    toggleORANDBtn(selectedBtnInfo): void {
        // calls on dynamically toggled by user... for multi app selected...        
        if (this.enableLogicBtn.selectable) {
            this.enableLogicBtn.info.map((eachBtn) => {
                if (eachBtn.text.toUpperCase()  === selectedBtnInfo.text.toUpperCase()) {
                    eachBtn.selected = true;
                    eachBtn.disabled = true;
                } else {
                    eachBtn.selected = false;
                    eachBtn.disabled = false;
                }
                if (selectedBtnInfo.text.toUpperCase() === 'OR') {
                    this.storeLogic.disabled = false;
                    this.storeLogic.logic = true;
                } else if (selectedBtnInfo.text.toUpperCase() === 'AND') {
                    this.storeLogic.disabled = false;
                    this.storeLogic.logic = false;
                }
            });
        }
        if (!this.storeLogic.disabled) {
            this.storeReqId = this.storeReqId.map((eachReq) => {
                if ('isOr' in eachReq) {
                    eachReq.isOr = this.storeLogic.logic;
                }
                return eachReq;
            });
        }
        if ((this.roleSelected.length > 0) && (this.appSelected.length > 0)) {
            this.selectedInfo = this.defaultReqSelection(APPLICATION_APPUSER_URL, this.storeReqId);
            this.dispatchUsrAction(USERS_DATA, this.selectedInfo);
        }
    }

    dispatchUsrAction(type, selectionData) {
        this.stateService.dispatch({
            type : type,
            payload : {
                selectedInfo : selectionData
            }
        });
    }

    onAppMultiClose(e?) {
        if (e) {
            e.preventDefault();
        }
        const comContext = this;
        setTimeout(() => {
            if (!this.appmultiselect.wrapper.nativeElement.contains(document.activeElement)) {
                this.appmultiselect.toggle(false);
                if (comContext.appSelected.length > 0 && comContext.roleSelected.length === 0) {
                    if (!this.storeLogic.disabled) {
                        const logicParams = [this.logicParams(this.storeLogic.logic)];
                        this.storeReqId = this.storeReqId.concat(logicParams);
                    }
                    const defaultSelection = comContext.appSelected.find((eachApp) => {
                        const appName = eachApp.name.toUpperCase();
                        if (appName !== 'ALL' || appName !== 'ALL APPLICATION' || appName !== 'NONE') {
                            return eachApp;
                        }
                    });
                    if (comContext.appSelected.length === 1 && (defaultSelection)) {
                        comContext.selectedInfo = comContext.defaultReqSelection(APPLICAION_ROLES_URL, comContext.storeAppId);
                        comContext.dispatchUsrAction(ROLES, comContext.selectedInfo);
                    }
                } else if (comContext.appSelected.length === 1 && comContext.roleSelected.length > 0) {
                    if (
                        (comContext.appSelected[0].name.toUpperCase() !== 'ALL') &&
                        (comContext.appSelected[0].name.toUpperCase() !== 'ALL APPLICATION') &&
                        (comContext.appSelected[0].name.toUpperCase() !== 'NONE')) {
                        comContext.selectedInfo = comContext.defaultReqSelection(APPLICAION_ROLES_URL, comContext.storeAppId);
                        comContext.dispatchUsrAction(ROLES, comContext.selectedInfo);
                    }
                    if (!this.storeLogic.disabled) {
                        const logicParams = [this.logicParams(this.storeLogic.logic)];
                        this.storeReqId = this.storeReqId.concat(logicParams);
                    }
                    comContext.selectedInfo = comContext.defaultReqSelection(APPLICATION_APPUSER_URL, comContext.storeReqId);
                    comContext.dispatchUsrAction(USERS_DATA, comContext.selectedInfo);
                } else if (comContext.appSelected.length > 1 && comContext.roleSelected.length > 0) {
                    if (!this.storeLogic.disabled) {
                        const logicParams = [this.logicParams(this.storeLogic.logic)];
                        this.storeReqId = this.storeReqId.concat(logicParams);
                    }
                    comContext.selectedInfo = comContext.defaultReqSelection(APPLICATION_APPUSER_URL, comContext.storeReqId);
                    comContext.dispatchUsrAction(USERS_DATA, comContext.selectedInfo);
                }
            }
        });
    }

    onRoleMultiClose(e?) {
        if (e) {
            e.preventDefault();
        }
        const comContext = this;
        setTimeout(() => {
            if (!this.rolemultiselect.wrapper.nativeElement.contains(document.activeElement)) {
                this.rolemultiselect.toggle(false);
                if (comContext.appSelected.length > 0 && comContext.roleSelected.length > 0) {
                    if (!this.storeLogic.disabled) {
                        const logicParams = [this.logicParams(this.storeLogic.logic)];
                        this.storeReqId = this.storeReqId.concat(logicParams);
                    }
                    comContext.selectedInfo = comContext.defaultReqSelection(APPLICATION_APPUSER_URL, comContext.storeReqId);
                    comContext.dispatchUsrAction(USERS_DATA, comContext.selectedInfo);
                }
            }
        });
    }

    rolesHardReset(): void {
        this.appRoles = this.appRoles.slice(0, 3);
        this.roleSelected = [];
        this.clearKendoGrid();
    }

    logicParams(boolData: boolean) {
        return {'isOr': boolData};
    }

    clearKendoGrid(): void {
        // const gridRef = $('#' + this.kendoGridId).data('kendoGrid');
        this.gridRef.setDataSource(new kendo.data.DataSource({data: []}));
    }

    onAppRemove(e: Event): void {
        this.appmultiselect.focus();
        this.appmultiselect.toggle(true);
    }
    onRoleRemove(e: Event): void {
        this.rolemultiselect.focus();
        this.rolemultiselect.toggle(true);
    }
}
