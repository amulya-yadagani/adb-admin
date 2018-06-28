import { Component, OnInit, OnDestroy, ElementRef } from '@angular/core';
import { data as kdata } from '@progress/kendo-ui/js/kendo.core.js';
import '@progress/kendo-ui/js/kendo.treeview.js';

import {
  USER_AUTHORIZATION_RESULT,
  USER_AUTHORIZATION_CHILD_RESULT,
  USER_RESULT_DATA_CLEAR } from '../../state/actions';
import { AppStateService } from '../../state/app-state.service';
import { AccountDetailsService } from '../account-details.service';

let $ = null;

@Component({
  templateUrl: './authorization.component.html',
  styleUrls: ['./authorization.component.scss']
})

export class AuthorizationComponent implements OnInit {
  treeView: any;
  refDataSource: any;
  currentSelectedNode: string;
  currentUid: string;

  constructor(private accountDetailsService: AccountDetailsService, private el: ElementRef, private appStateService: AppStateService) {
     $ = window['jQuery'];
     this.appStateService.subscribe(USER_AUTHORIZATION_RESULT, this.onResponseAuthorizations.bind(this));
     this.appStateService.subscribe(USER_RESULT_DATA_CLEAR, this.onResponseClearInfo.bind(this));
     this.appStateService.subscribe(USER_AUTHORIZATION_CHILD_RESULT, this.onResponseAuthorizationsChild.bind(this));
  }

  ngOnInit() {
    const componentContext = this;
    // below element will bind to widget once...
    $('#authorizationTreeView').kendoTreeView({
        animation: {
          expand: {
            duration: 300
          }
        },
        template: (item) => {
          return componentContext.onTemplateRender(item);
          // const node = item.item;
          // let result = node.text;

          // if (node.isExcluded) {
          //   result = `<span class="excluded">${result}</span>`;
          // }

          // return result;
        },
        select: (e) => {
          // const currentItem = componentContext.treeView.dataItem(e.node);
        },
        expand: (e) => {
          componentContext.onExpandResource(e);
        }
      });
      // Once binded widget element, we get reference to it...
      this.treeView = $('#authorizationTreeView').data('kendoTreeView');
  }

  onTemplateRender(item) {
    const node = item.item;
    let result = node.text;
    if (node.isExcluded) {
      result = `<span class="excluded">${result}</span>`;
    }
    return result;
  }

  onExpandResource(e: Event) {
    const currentItem = this.treeView.dataItem((e as any).node);
    const currAccName = this.appStateService.getSelectedAccountInformation().user.accountName;
    this.currentUid = currentItem.uid;
    this.currentSelectedNode = currentItem.text;
    if (currentItem.expandable) {
      // expand only if expandable, if not don't call API
      this.accountDetailsService.fetchAuthorizationChildren(currAccName, currentItem);
    }
  }

  onResponseAuthorizations(actions) {
    const currAccName = this.appStateService.getSelectedAccountInformation().user.accountName;
    if (actions.payload.data.application) {
      let authorizationDataSource = actions.payload.data.application;
      authorizationDataSource = this.treeResponseView(authorizationDataSource);
      this.treeView.dataSource.data(authorizationDataSource);
    }
  }

  onResponseAuthorizationsChild(eventAction): void {
    const childTreeView = this.treeResponseView(eventAction.payload.data);
    const uid = this.currentUid;
    childTreeView.map((eachTreeViewChild) => {
      // avoiding refetching data on expand node, when user revisits same node.
      this.treeView.dataItem(this.treeView._clickTarget).expandable = false;
      // this.treeView.append(eachTreeViewChild, this.treeView.findByText(this.currentSelectedNode));
      this.treeView.append(eachTreeViewChild, this.treeView.findByUid(uid));
    });
  }

  onResponseClearInfo() {
    if (this.treeView) {
      this.treeView.dataSource.data([]);
    }
  }

  treeResponseView(data) {
    let modData;
    modData = data.map((eachApplication) => {
      // validates after permission level, user can expland or not...
      // let spriteCSS = (eachApplication.resourceTypeName) ? eachApplication.resourceTypeName.toLowerCase() : 'application';
      let spriteCSS = (eachApplication.parentResourceMappingid === null) ? // if null then it is root
                      'application' : ((eachApplication.imageFile === '' || eachApplication.imageFile === null) && (eachApplication.parentResourceMappingid > 0)) ?  
                      // if empty string it is child nodes with no image or empty with parent id greater then broken image else show image...
                      'noimage' :  (eachApplication.imageFile.split('.')[0]).toLowerCase();
      const textName =  (eachApplication.resourceTypeName) ? eachApplication.description : eachApplication.name;
      // append exclude css class along with default class...
      spriteCSS = (eachApplication.isExcluded) ? spriteCSS + ' excludedAccount' : spriteCSS + ' nonExcludedAccount';
      const expandable = (eachApplication.resourceTypeName === 'Permission') ? false : true;
      const childrenExist = (eachApplication.resourceTypeName === 'Permission') ? false : true;
      return {
        spriteCssClass: spriteCSS,
        account: eachApplication.name,
        text: textName,
        isExcluded: eachApplication.isExcluded,
        hasChildren: childrenExist,
        resourceId: eachApplication.resourceMappingId,
        resourceTypeName: eachApplication.resourceTypeName,
        applicationId: eachApplication.applicationId,
        imageFile: eachApplication.imageFile,
        state: eachApplication.state,
        description: eachApplication.description,
        expandable: expandable
      };
    });
    return modData;
  }
}
