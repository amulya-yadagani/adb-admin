import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { LayoutModule } from '@progress/kendo-angular-layout';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import "@progress/kendo-ui/js/kendo.splitter.js";

import { Injectable, DebugElement }    from '@angular/core';
import { FormsModule  }    from '@angular/forms';
import {By} from "@angular/platform-browser";
import {Router} from "@angular/router";

import { AppComponent } from './app.component';
import { AppService } from './app.service'
import { AccountPanelComponent } from "./accounts/accounts.component";
import { ResourceManagerComponent } from "./resource-manager/resource-manager.component";
import { AppStateService } from "./state/app-state.service";
import { AccountService } from "./accounts/accounts.service";
import { NotificationService } from "./utils/notification.service";
import { LoaderService } from "./utils/loader.service";
import { AppUsersService } from "./app-users/app-users.service";
import { AccountDetailsService } from "./account-details/account-details.service";
import { AppResourcesComponent } from './app-resources/app-resources.component';
import { AppResourcesService } from "./app-resources/app-resources.service";
import { ImpersonationService } from "./impersonation/impersonation.service";
import { AccountDetailsComponent } from "./account-details/account-details.component";
import { AuthorizationComponent } from "./account-details/authorization/authorization.component";
import { SharedGridComponent } from "./account-details/grid/shared-grid.component";
import { GroupsComponent } from "./account-details/groups/groups.component";
import { ImpersonationsComponent } from "./account-details/impersonations/impersonations.component";
import { MembersComponent } from "./account-details/members/members.component";
import { RolesComponent } from "./account-details/roles/roles.component";
import { ImpersonationComponent } from './impersonation/impersonation.component';
import { AuditLogComponent } from './audit-log/audit-log.component';
import { ResourceComponent } from './resource-manager/resource.component';

@Injectable()
class MockAppService{}

@Injectable()
class MockAppResourcesService{}

@Injectable()
class MockAccountService{}

@Injectable()
class MockNotificationService{}

@Injectable()
class MockAppUsersService{}

@Injectable()
class MockLoaderService{}

@Injectable()
class MockAcDetailsService{}

@Injectable()
class MockResourceService{}

@Injectable()
class MockImpersonationService{}

describe('AppComponent', () => {

 let component: AppComponent;
 let fixture: ComponentFixture<AppComponent>;
 let debug: DebugElement;
 let htmlElem: HTMLElement;
 let router: Router;
 window["getUserInfo"] = () => ({name:"hirparaj",displayName:"Guest"});
  beforeEach(
    async(() => {
    TestBed.configureTestingModule({
      imports: [
        LayoutModule,
        FormsModule,
        DropDownsModule,
        RouterTestingModule.withRoutes([
          {
            path: 'resources',
            component: AppResourcesComponent
          },
          {
            path : 'impersonation',
            component : ImpersonationComponent
          },
          {
            path : 'auditLog',
            component : AuditLogComponent
          },
          {
            path: '**',
            redirectTo: 'resources',
            pathMatch: 'full'
          }])
      ],
      declarations: [
        AppComponent,
        AccountPanelComponent,
        ResourceManagerComponent,
        AppResourcesComponent,
        ImpersonationComponent,
        AuditLogComponent,
        AccountDetailsComponent,
        MembersComponent,
        GroupsComponent,
        RolesComponent,
        ImpersonationsComponent,
        SharedGridComponent,
        ResourceComponent
      ],
      providers: [
        AppStateService,
        {provide: AppService , useclass : MockAppService},
        {provide: AppResourcesService , useclass : MockAppResourcesService},
        {provide: AccountService, useclass: MockAccountService},
        {provide: NotificationService, useclass: MockNotificationService},
        {provide: AppUsersService, useclass: MockAppUsersService},
        {provide: LoaderService, useclass: MockLoaderService},
        {provide: AccountDetailsService, useclass: MockAcDetailsService},
        {provide: ImpersonationService, useclass: MockImpersonationService}
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    router = TestBed.get(Router);
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.debugElement.componentInstance;
    let $ = window["jQuery"];
    $("#divided-box").kendoSplitter({
            panes: [
                {
                    id: "accounts",
                    collapsible: true,
                    size: 260,
                    scrollable: false,
                    min: 260
                },
                {
                    id: "tabs"
                },
                {   id : "resource-manager",
                    collapsed: true,
                    scrollable: false
                }
            ]
        });
    router.initialNavigation();
  });

  it('should create the app', async(() => {
    expect(component).toBeTruthy();
  }));

  it(`should have header 'ADB Administrator'`, async(() => {
    debug = fixture.debugElement.query(By.css("h3"));
    htmlElem = debug.nativeElement;
    expect(htmlElem.textContent).toContain('ADB Administrator');
  }));

 it(`should have 'Accounts' section injected`, async(() => {
      htmlElem = fixture.debugElement.nativeElement;
      expect(htmlElem.querySelector('adb-account-panel')).not.toBeNull();
    }));

  it('navigate to "" redirects you to /resources', async(() => {
      router.navigate(['/']).then(() => {
        expect(router.url).toEqual('/resources');
      });
  }));

  it('navigate to "impersonation" redirects you to /impersonation', async(() => {
      router.navigate(['/impersonation']).then(() => {
          expect(router.url).toEqual('/impersonation');
      });
  }));

  xit('navigate to "auditLog" redirects you to /auditLog', async(() => {
      router.navigate(['/auditLog']).then(() => {
          expect(router.url).toEqual('/auditLog');
      });
  }));

  it('navigate to "unknown" redirects you to /resources', async(() => {
      router.navigate(['/unknown']).then(() => {
          expect(router.url).toEqual('/resources');
      });
  }));

  it(`should have 'Resource Manager' section injected with collapsed state`, async(() => {
      htmlElem = fixture.debugElement.nativeElement;
      expect(htmlElem.querySelector('adb-resource-manager')).not.toBeNull();
      expect(htmlElem.querySelector('adb-resource-manager').className).toContain('k-state-collapsed');
  }));
});
