import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule, ErrorHandler } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { DialogModule } from '@progress/kendo-angular-dialog';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { InputsModule } from '@progress/kendo-angular-inputs';

import { LayoutModule } from '@progress/kendo-angular-layout';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { RouterModule } from '@angular/router';
import { CustomReuseStrategy } from './utils/custom-reuse';
import { RouteReuseStrategy} from '@angular/router';
import { SharedGridComponent } from './account-details/grid/shared-grid.component';

import { AppComponent } from './app.component';
import { AppRoutingModule, ComponentDeclaration } from './app.routing';
import { AccountPanelComponent } from "./accounts/accounts.component";
import { AppService } from "./app.service";
import { AccountService } from "./accounts/accounts.service";
import { AccountDetailsService } from "./account-details/account-details.service";
import { ImpersonationService } from "./impersonation/impersonation.service";
import { AppUsersService } from "./app-users/app-users.service";
import { AuditLogService } from "./audit-log/audit-log.service";

import { AppResourcesService } from "./app-resources/app-resources.service";
import { AppStateService } from "./state/app-state.service";
import { NotificationService } from "./utils/notification.service";
import { LoaderService } from "./utils/loader.service";
import { LoggerService } from "./utils/logger.service";
import { ResourceManagerComponent } from './resource-manager/resource-manager.component';
import { ResourceComponent } from './resource-manager/resource.component';

import { AnchorDirective } from "./directives/anchor.directive";
@NgModule({
  declarations: [
    AppComponent,
    AccountPanelComponent,
    ComponentDeclaration,
    SharedGridComponent,
    ResourceManagerComponent,
    AnchorDirective,
    ResourceComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    InputsModule,
    FormsModule,
    ReactiveFormsModule,
    HttpModule,
    LayoutModule,
    DropDownsModule,
    AppRoutingModule,
    DialogModule
  ],
  providers: [
    {provide: RouteReuseStrategy, useClass: CustomReuseStrategy},
    AppService,
    AccountService,
    AccountDetailsService,
    ImpersonationService,
    AppUsersService,
    AuditLogService,
    AppStateService,
    AppResourcesService,
    NotificationService,
    LoaderService,
    {provide: ErrorHandler, useClass: LoggerService}
  ],
  entryComponents: [ResourceComponent],
  bootstrap: [AppComponent]
})
export class AppModule { }
