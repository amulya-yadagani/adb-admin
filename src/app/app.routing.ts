import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AccountDetailsComponent } from './account-details/account-details.component';
import { MembersComponent } from './account-details/members/members.component';
import { GroupsComponent } from './account-details/groups/groups.component';
import { ImpersonationsComponent } from './account-details/impersonations/impersonations.component';
import { AuthorizationComponent } from './account-details/authorization/authorization.component';
import { RolesComponent } from './account-details/roles/roles.component';

import { AppResourcesComponent } from './app-resources/app-resources.component';
import { AppUsersComponent } from './app-users/app-users.component';
import { ImpersonationComponent } from './impersonation/impersonation.component';
import { AuditLogComponent } from './audit-log/audit-log.component';
import { ResourceManagerComponent } from './resource-manager/resource-manager.component';

const routes: any = [
  {
    path: 'resources',
    component: AppResourcesComponent
  },
  {
    path: 'accountDetails',
    component: AccountDetailsComponent,
    children : [
      { path: '', redirectTo: 'members', pathMatch: 'full' },
      { path: 'groups', component: GroupsComponent },
      { path: 'members', component: MembersComponent },
      { path: 'roles', component: RolesComponent },
      { path: 'authorizations', component: AuthorizationComponent },
      { path: 'impersonations', component: ImpersonationsComponent }
    ]
  },
  {
    path : 'impersonation',
    component : ImpersonationComponent
  } ,
  {
    path : 'users',
    component : AppUsersComponent
  },
  {
    path : 'auditLog',
    component : AuditLogComponent
  },
  {
    path: '**',
    redirectTo: 'resources',
    pathMatch: 'full'
  }
]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }

export const ComponentDeclaration = [
  AppResourcesComponent,
  AppUsersComponent,
  ImpersonationComponent,
  AuditLogComponent,
  ResourceManagerComponent,

  //Account Details Tab Components
  AccountDetailsComponent,
  MembersComponent,
  GroupsComponent,
  ImpersonationsComponent,
  AuthorizationComponent,
  RolesComponent
];
