import { Component, AfterContentInit, ComponentFactoryResolver, ViewChild } from '@angular/core';

import { ResourceComponent } from "./resource.component";
import { AnchorDirective } from "../directives/anchor.directive";

import { AppStateService } from "../state/app-state.service";
import { SHOW_RESOURCE, REMOVE_RESOURCE } from "../state/actions";

@Component({
  moduleId: module.id,
  selector: 'adb-resource-manager',
  template: `<ng-template anchor></ng-template>`
})

export class ResourceManagerComponent implements AfterContentInit {
  title: string = "Resource";
  @ViewChild(AnchorDirective) anchor: AnchorDirective;

  constructor(private compFactoryResolver: ComponentFactoryResolver,
    private stateService: AppStateService) {
    this.stateService.subscribe(SHOW_RESOURCE, this.loadComponent.bind(this));
    this.stateService.subscribe(REMOVE_RESOURCE, this.removeComponent.bind(this));
  }

  ngAfterContentInit() {
    /* let factory = this.compFactoryResolver.resolveComponentFactory(ResourceComponent);
    let viewConRef = this.anchor.viewContainerRef;
    viewConRef.clear();

    let compRef = viewConRef.createComponent(factory); */
  }

  private loadComponent(action) {
    let factory = this.compFactoryResolver.resolveComponentFactory(ResourceComponent);
    let viewConRef = this.anchor.viewContainerRef;
    viewConRef.clear();
    let compRef = viewConRef.createComponent(factory);
    compRef.instance.title = action.payload.name;
    compRef.instance.applicationId = action.payload.applicationId;
    if(action.payload.applicationId < 0){
      compRef.instance.newAppData = action.payload;
    }
    this.stateService.applicationId = action.payload.applicationId;
    compRef.instance.createNode(JSON.parse(JSON.stringify(action.payload._childrenOptions.data)));
  }

  private removeComponent(action) {    
    let viewConRef = this.anchor.viewContainerRef;
    viewConRef.clear();
  }
}
