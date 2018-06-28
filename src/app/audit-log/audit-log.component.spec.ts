import { NO_ERRORS_SCHEMA } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { TestBed, ComponentFixtureAutoDetect, async } from '@angular/core/testing';
import { HttpModule } from '@angular/http';
import { AuditLogComponent } from './audit-log.component';
import { AuditLogService } from './audit-log.service';
import { AppStateService } from '../state/app-state.service';

describe('Audit Log Component Testing', () => {
    let fixture;
    let component;
    let debugElement;
    let auditLogService;
    let appStateService;
    describe('Inital State', () => {
        beforeEach(async(() => { // async allows you to get component with binded template & css...
            TestBed.configureTestingModule({
                declarations: [
                    AuditLogComponent
                ],
                providers: [
                    AuditLogService,
                    AppStateService
                ],
                imports: [HttpModule, RouterTestingModule.withRoutes([ ])],
                schemas: [NO_ERRORS_SCHEMA] // ensures custome element is skipped from throwing error...
            })
            .compileComponents(); // compile template and css
        }));
        beforeEach(async(() => {
            fixture = TestBed.createComponent(AuditLogComponent);
            component = fixture.componentInstance;
            auditLogService = TestBed.get(AuditLogService);
            appStateService = TestBed.get(AppStateService);
            debugElement = fixture.nativeElement;
        }));
        it('Validate constants of Audit Log Component', async(() => {
            expect(component.STRING_JQuery).toContain('jQuery');
            expect(component.STRING_NAV).toContain('accountDetails');
            expect(component.STRING_Elm_Grid).toContain('auditLogGrid');
            expect(component.STRING_POST).toContain('POST');
            expect(component.auditUrl).toContain('/auditLog');
            expect(component.auditDataSource).toBeDefined();
            expect(component.auditDataSource.schema).toBeDefined();
            expect(component.auditDataSource.data).toBeDefined();
            expect(component.auditColumn).toBeDefined();
        }));
    });
    describe('Post Initial State', () => {
        beforeEach(async(() => { // async allows you to get component with binded template & css...
            TestBed.configureTestingModule({
                declarations: [
                    AuditLogComponent
                ],
                providers: [
                    AuditLogService,
                    AppStateService
                ],
                imports: [HttpModule, RouterTestingModule.withRoutes([ ])],
                schemas: [NO_ERRORS_SCHEMA] // ensures custome element is skipped from throwing error...
            })
            .compileComponents(); // compile template and css
        }));
        beforeEach(async(() => {
            fixture = TestBed.createComponent(AuditLogComponent);
            component = fixture.componentInstance;
            auditLogService = TestBed.get(AuditLogService);
            appStateService = TestBed.get(AppStateService);
            debugElement = fixture.nativeElement;

            component.ngOnInit();
        }));
        it('Test the functionality of onResAuditLog', async(() => {
            const mockResData = {
                type: 'audit log result',
                payload: {
                    data: [
                        {'accountLogId':0,'applicationName':'AdbAPITNew2','deletedByUsername':'ranjanpb','deletedByUserDisplayName':'Biranchi RanjanParida','parentResourceName':'AdbDeveloper','authorityName':'SERVICE - Service','deletedDate':'12/07/2017 01:47:49 PM','accountUsername':'sherlish','accountDisplayName':'Henry Sherlis'}
                    ]
                }
            };
            component.auditGrid = {
                dataSource: {
                    data: function(aryData) {
                        return aryData;
                    }
                }
            };
            const spyShowLoader = spyOn(appStateService, 'showLoader');

            component.onResAuditLog(mockResData);

            expect(component.auditGrid.dataSource.data).toBeDefined();
            expect(component.auditGrid.dataSource.data.length).toBeGreaterThan(0);
            expect(spyShowLoader).toHaveBeenCalled();
            expect(spyShowLoader).toHaveBeenCalledTimes(1);
            expect(spyShowLoader).toHaveBeenCalledWith(false);
        }));
        it('Test the funtionality of generateAction', async(() => {
            const mockAction = {type: 'dummy', payload: {data: 'dummy'}};
            const mockDispatch = spyOn(appStateService, 'dispatch');
            
            component.generateAction(mockAction);

            expect(mockDispatch).toHaveBeenCalled();
            expect(mockDispatch).toHaveBeenCalledTimes(1);
            expect(mockDispatch).toHaveBeenCalledWith(mockAction);
        }));
        it('Test the click event trigger of classNamed btn ".delUsrLink"', async(() => {
            const mockAuditData = [
                {'accountLogId':0,'applicationName':'AdbAPITNew2','deletedByUsername':'ranjanpb','deletedByUserDisplayName':'Biranchi RanjanParida','parentResourceName':'AdbDeveloper','authorityName':'SERVICE - Service','deletedDate':'12/07/2017 01:47:49 PM','accountUsername':'sherlish','accountDisplayName':'Henry Sherlis'}
            ];
            component.auditGrid.dataSource.data(mockAuditData);
            const spyOnAccClickTrigger = spyOn(component, 'onAccClkTrigger');
            const btnDelUsrLink =  debugElement.querySelectorAll('.delUsrLink');
            
            expect(btnDelUsrLink[0]).toBeDefined();
            btnDelUsrLink[0].click();
            expect(spyOnAccClickTrigger).toHaveBeenCalled();
            expect(spyOnAccClickTrigger).toHaveBeenCalledTimes(1);
            expect(spyOnAccClickTrigger).toHaveBeenCalledWith(btnDelUsrLink[0].text);
        }));
    });
});

