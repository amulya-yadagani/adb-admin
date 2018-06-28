import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { DebugElement, NgModule } from "@angular/core";
import { By } from '@angular/platform-browser';

import { ResourceManagerComponent } from './resource-manager.component'
import { ResourceComponent } from './resource.component'
import { AppStateService } from "../state/app-state.service";
import { SHOW_RESOURCE } from "../state/actions";
import { AnchorDirective } from "../directives/anchor.directive";
import { resourceTypes } from './resourceTypesJson'
@NgModule({
	declarations: [ResourceComponent],
	entryComponents: [
		ResourceComponent,
	]
})
class TestModule { }

describe("ResourceManagerComponent", () => {
	let comp: ResourceManagerComponent;
	let fixture: ComponentFixture<ResourceManagerComponent>;
	let de: DebugElement;
	let el: HTMLElement;
	let stateService: AppStateService;
	let $ = null;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [ResourceManagerComponent, AnchorDirective],
			providers: [AppStateService],
			imports: [TestModule]
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(ResourceManagerComponent);
		comp = fixture.componentInstance;
		$ = window["jQuery"];
		stateService = fixture.debugElement.injector.get(AppStateService);
	});

	//const data = {_childrenOptions : {data : {items : resourceTypes}}}

	const data = {"parentResourceId":null,"resourceMappingId":3,"name":"JobTrackerTAG","spriteCssClass":"application","items":[{"parentResourceId":3,"resourceMappingId":28,"name":"All Job Requests","spriteCssClass":"cluster","items":[{"parentResourceId":28,"resourceMappingId":51,"name":"User","spriteCssClass":"permission","items":[],"index":0}],"index":0},{"parentResourceId":3,"resourceMappingId":29,"name":"All Sources","spriteCssClass":"cluster","items":[{"parentResourceId":29,"resourceMappingId":52,"name":"User","spriteCssClass":"permission","items":[],"index":0}],"index":1},{"parentResourceId":3,"resourceMappingId":30,"name":"All Titles","spriteCssClass":"cluster","items":[{"parentResourceId":30,"resourceMappingId":53,"name":"User","spriteCssClass":"permission","items":[],"index":0},{"parentResourceId":30,"resourceMappingId":54,"name":"Foreign Affairs","spriteCssClass":"cluster","items":[{"parentResourceId":54,"resourceMappingId":55,"name":"User","spriteCssClass":"permission","items":[],"index":0},{"parentResourceId":54,"resourceMappingId":56,"name":"FF - Foreign Affairs","spriteCssClass":"title","items":[],"index":1}],"index":1}],"index":2},{"parentResourceId":3,"resourceMappingId":31,"name":"D - Direct Mail","spriteCssClass":"edit","items":[{"parentResourceId":31,"resourceMappingId":57,"name":"User","spriteCssClass":"permission","items":[],"index":0}],"index":3},{"parentResourceId":3,"resourceMappingId":32,"name":"I - Insert Cards/Wraps/Ads","spriteCssClass":"edit","items":[{"parentResourceId":32,"resourceMappingId":58,"name":"User","spriteCssClass":"permission","items":[],"index":0}],"index":4},{"parentResourceId":3,"resourceMappingId":33,"name":"O - Other","spriteCssClass":"edit","items":[{"parentResourceId":33,"resourceMappingId":59,"name":"User","spriteCssClass":"permission","items":[],"index":0}],"index":5},{"parentResourceId":3,"resourceMappingId":34,"name":"R - Retention","spriteCssClass":"edit","items":[{"parentResourceId":34,"resourceMappingId":60,"name":"User","spriteCssClass":"permission","items":[],"index":0}],"index":6},{"parentResourceId":3,"resourceMappingId":35,"name":"W - Online","spriteCssClass":"edit","items":[{"parentResourceId":35,"resourceMappingId":61,"name":"User","spriteCssClass":"permission","items":[],"index":0}],"index":7},{"parentResourceId":3,"resourceMappingId":36,"name":"ADBAdministrator","spriteCssClass":"permission","items":[],"index":8},{"parentResourceId":3,"resourceMappingId":37,"name":"ADBDeveloper","spriteCssClass":"permission","items":[],"index":9},{"parentResourceId":3,"resourceMappingId":38,"name":"User","spriteCssClass":"permission","items":[],"index":10},{"parentResourceId":3,"resourceMappingId":39,"name":"Admin - Administrator","spriteCssClass":"role","items":[],"index":11},{"parentResourceId":3,"resourceMappingId":40,"name":"CA - Copy Acceptance","spriteCssClass":"role","items":[],"index":12},{"parentResourceId":3,"resourceMappingId":41,"name":"Legal - Legal","spriteCssClass":"role","items":[],"index":13},{"parentResourceId":3,"resourceMappingId":42,"name":"Marketing - Marketing","spriteCssClass":"role","items":[],"index":14},{"parentResourceId":3,"resourceMappingId":43,"name":"TAG PM - TAG PM","spriteCssClass":"role","items":[],"index":15},{"parentResourceId":3,"resourceMappingId":44,"name":"Traffic - Traffic","spriteCssClass":"role","items":[],"index":16},{"parentResourceId":3,"resourceMappingId":45,"name":"A - Ads","spriteCssClass":"module","items":[{"parentResourceId":45,"resourceMappingId":62,"name":"User","spriteCssClass":"permission","items":[],"index":0}],"index":17},{"parentResourceId":3,"resourceMappingId":46,"name":"B - Billing","spriteCssClass":"module","items":[{"parentResourceId":46,"resourceMappingId":63,"name":"User","spriteCssClass":"permission","items":[],"index":0}],"index":18},{"parentResourceId":3,"resourceMappingId":47,"name":"D - Direct Mail","spriteCssClass":"module","items":[{"parentResourceId":47,"resourceMappingId":64,"name":"User","spriteCssClass":"permission","items":[],"index":0}],"index":19},{"parentResourceId":3,"resourceMappingId":48,"name":"I - Inserts","spriteCssClass":"module","items":[{"parentResourceId":48,"resourceMappingId":65,"name":"User","spriteCssClass":"permission","items":[],"index":0}],"index":20},{"parentResourceId":3,"resourceMappingId":49,"name":"W - Wraps","spriteCssClass":"module","items":[{"parentResourceId":49,"resourceMappingId":66,"name":"User","spriteCssClass":"permission","items":[],"index":0}],"index":21},{"parentResourceId":3,"resourceMappingId":50,"name":"R - Renewals","spriteCssClass":"module","items":[{"parentResourceId":50,"resourceMappingId":67,"name":"User","spriteCssClass":"permission","items":[],"index":0}],"index":22}],"index":2,"selected":true,"expanded":true};


	it("should be defined", () => {
		expect(comp).toBeDefined();
	})

	xit("should create resources component", () => {
		stateService.dispatch({
			type: SHOW_RESOURCE,
			payload: data
		});
		expect(fixture.nativeElement.querySelector("adb-resource")).not.toBeNull();
	})
});