import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from '@angular/platform-browser';
import { DebugElement } from "@angular/core";
import { AppStateService } from "../state/app-state.service";
import { ResourceComponent } from "./resource.component";
import { resourceTypes } from './resourceTypesJson';
import { resources } from './resourcesJson';
import { RES_MANAGER_RESOURCES, RES_MANAGER_RESOURCES_RESULT, RES_MANAGER_RESOURCES_TYPES, RES_MANAGER_RESOURCES_TYPES_RESULT } from '../state/actions';
import { data as kdata } from "@progress/kendo-ui/js/kendo.core.js";
import { FormsModule } from '@angular/forms';

describe("ResourceComponent", () => {
	let comp: ResourceComponent;
	let fixture: ComponentFixture<ResourceComponent>;
	let de: DebugElement;
	let el: HTMLElement;
	let stateService: AppStateService;
	let $ = null;
	let contextMenu;

	let loadGrid = (stateService) => {

		if (!stateService) {
			return;
		}
		stateService.dispatch({
			type: RES_MANAGER_RESOURCES_TYPES_RESULT,
			payload: {
				data: resourceTypes
			}
		});

		stateService.dispatch({
			type: RES_MANAGER_RESOURCES_RESULT,
			payload: {
				data: resources
			}
		});
	}

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [FormsModule],
			declarations: [ResourceComponent],
			providers: [AppStateService]
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(ResourceComponent);
		comp = fixture.componentInstance;
		$ = window["jQuery"];
		de = fixture.debugElement.query(By.css("div"));
		el = de.nativeElement;
		stateService = fixture.debugElement.injector.get(AppStateService);
		contextMenu = $("#resources-context-menu").data("kendoContextMenu");
	});

	afterEach(() => {
		if (contextMenu) {
			contextMenu.remove($('li.cmPaste'));
			contextMenu.close();
		}
	});

	const nodeData = {
		"parentResourceId": null,
		"resourceMappingId": 3,
		"name": "JobTrackerTAG",
		"spriteCssClass": "application",
		"items": [{
			"parentResourceId": 3,
			"resourceMappingId": 28,
			"name": "All Job Requests",
			"spriteCssClass": "cluster",
			"items": [{
				"parentResourceId": 28,
				"resourceMappingId": 51,
				"name": "User",
				"spriteCssClass": "permission",
				"items": []
			}]
		}, {
			"parentResourceId": 3,
			"resourceMappingId": 29,
			"name": "All Sources",
			"spriteCssClass": "cluster",
			"items": [{
				"parentResourceId": 29,
				"resourceMappingId": 52,
				"name": "User",
				"spriteCssClass": "permission",
				"items": []
			}]
		}, {
			"parentResourceId": 3,
			"resourceMappingId": 30,
			"name": "All Titles",
			"spriteCssClass": "cluster",
			"items": [{
				"parentResourceId": 30,
				"resourceMappingId": 53,
				"name": "User",
				"spriteCssClass": "permission",
				"items": []
			}, {
				"parentResourceId": 30,
				"resourceMappingId": 54,
				"name": "Foreign Affairs",
				"spriteCssClass": "cluster",
				"items": [{
					"parentResourceId": 54,
					"resourceMappingId": 55,
					"name": "User",
					"spriteCssClass": "permission",
					"items": []
				}, {
					"parentResourceId": 54,
					"resourceMappingId": 56,
					"name": "FF - Foreign Affairs",
					"spriteCssClass": "title",
					"items": []
				}]
			}]
		}, {
			"parentResourceId": 3,
			"resourceMappingId": 31,
			"name": "D - Direct Mail",
			"spriteCssClass": "edit",
			"items": [{
				"parentResourceId": 31,
				"resourceMappingId": 57,
				"name": "User",
				"spriteCssClass": "permission",
				"items": []
			}]
		}, {
			"parentResourceId": 3,
			"resourceMappingId": 32,
			"name": "I - Insert Cards/Wraps/Ads",
			"spriteCssClass": "edit",
			"items": [{
				"parentResourceId": 32,
				"resourceMappingId": 58,
				"name": "User",
				"spriteCssClass": "permission",
				"items": []
			}]
		}, {
			"parentResourceId": 3,
			"resourceMappingId": 33,
			"name": "O - Other",
			"spriteCssClass": "edit",
			"items": [{
				"parentResourceId": 33,
				"resourceMappingId": 59,
				"name": "User",
				"spriteCssClass": "permission",
				"items": []
			}]
		}, {
			"parentResourceId": 3,
			"resourceMappingId": 34,
			"name": "R - Retention",
			"spriteCssClass": "edit",
			"items": [{
				"parentResourceId": 34,
				"resourceMappingId": 60,
				"name": "User",
				"spriteCssClass": "permission",
				"items": []
			}]
		}, {
			"parentResourceId": 3,
			"resourceMappingId": 35,
			"name": "W - Online",
			"spriteCssClass": "edit",
			"items": [{
				"parentResourceId": 35,
				"resourceMappingId": 61,
				"name": "User",
				"spriteCssClass": "permission",
				"items": []
			}]
		}, {
			"parentResourceId": 3,
			"resourceMappingId": 36,
			"name": "ADBAdministrator",
			"spriteCssClass": "permission",
			"items": []
		}, {
			"parentResourceId": 3,
			"resourceMappingId": 37,
			"name": "ADBDeveloper",
			"spriteCssClass": "permission",
			"items": []
		}, {
			"parentResourceId": 3,
			"resourceMappingId": 38,
			"name": "User",
			"spriteCssClass": "permission",
			"items": []
		}, {
			"parentResourceId": 3,
			"resourceMappingId": 39,
			"name": "Admin - Administrator",
			"spriteCssClass": "role",
			"items": []
		}, {
			"parentResourceId": 3,
			"resourceMappingId": 40,
			"name": "CA - Copy Acceptance",
			"spriteCssClass": "role",
			"items": []
		}, {
			"parentResourceId": 3,
			"resourceMappingId": 41,
			"name": "Legal - Legal",
			"spriteCssClass": "role",
			"items": []
		}, {
			"parentResourceId": 3,
			"resourceMappingId": 42,
			"name": "Marketing - Marketing",
			"spriteCssClass": "role",
			"items": []
		}, {
			"parentResourceId": 3,
			"resourceMappingId": 43,
			"name": "TAG PM - TAG PM",
			"spriteCssClass": "role",
			"items": []
		}, {
			"parentResourceId": 3,
			"resourceMappingId": 44,
			"name": "Traffic - Traffic",
			"spriteCssClass": "role",
			"items": []
		}, {
			"parentResourceId": 3,
			"resourceMappingId": 45,
			"name": "A - Ads",
			"spriteCssClass": "module",
			"items": [{
				"parentResourceId": 45,
				"resourceMappingId": 62,
				"name": "User",
				"spriteCssClass": "permission",
				"items": []
			}]
		}, {
			"parentResourceId": 3,
			"resourceMappingId": 46,
			"name": "B - Billing",
			"spriteCssClass": "module",
			"items": [{
				"parentResourceId": 46,
				"resourceMappingId": 63,
				"name": "User",
				"spriteCssClass": "permission",
				"items": []
			}]
		}, {
			"parentResourceId": 3,
			"resourceMappingId": 47,
			"name": "D - Direct Mail",
			"spriteCssClass": "module",
			"items": [{
				"parentResourceId": 47,
				"resourceMappingId": 64,
				"name": "User",
				"spriteCssClass": "permission",
				"items": []
			}]
		}, {
			"parentResourceId": 3,
			"resourceMappingId": 48,
			"name": "I - Inserts",
			"spriteCssClass": "module",
			"items": [{
				"parentResourceId": 48,
				"resourceMappingId": 65,
				"name": "User",
				"spriteCssClass": "permission",
				"items": []
			}]
		}, {
			"parentResourceId": 3,
			"resourceMappingId": 49,
			"name": "W - Wraps",
			"spriteCssClass": "module",
			"items": [{
				"parentResourceId": 49,
				"resourceMappingId": 66,
				"name": "User",
				"spriteCssClass": "permission",
				"items": []
			}]
		}, {
			"parentResourceId": 3,
			"resourceMappingId": 50,
			"name": "R - Renewals",
			"spriteCssClass": "module",
			"items": [{
				"parentResourceId": 50,
				"resourceMappingId": 67,
				"name": "User",
				"spriteCssClass": "permission",
				"items": []
			}]
		}]
	}



	it("should be defined", () => {
		expect(comp).toBeDefined();
	});

	xit("should create treeview on load of component", () => {
		comp.createNode(nodeData);
		fixture.detectChanges();
		de = fixture.debugElement.query(By.css("div#childTree.k-treeview"));
		expect(de).not.toBeNull();
	})

	xit("should load resource type and resource data in grids", () => {
		comp.ngOnInit();
		loadGrid(stateService);
		fixture.detectChanges();
		expect(el.querySelector('.k-grid-norecords')).toBeNull();
	});

	xit("should not delete the resourceType, if there are resources of this resourceType", () => {
		comp.ngOnInit();
		loadGrid(stateService);
		let resTypeGrid = $("#k-ui-rt-grid").data("kendoGrid");
		let resGrid = $("#k-ui-r-grid").data("kendoGrid");
		let noOfRows = resTypeGrid.items().length;
		comp['stateService'].setResourceTargets(["Application", "Permission", "Title", "Module", "Cluster", "Role", "Jobrequest"])
		let removeButton = fixture.debugElement.nativeElement.querySelector("#resourceTypes a.k-button.k-grid-remove");
		let tr = $(removeButton).closest("tr");
		let dataItem = resTypeGrid.dataItem(tr);
		removeButton.click();
		if (resGrid.dataSource.indexOf(dataItem.name)) {
			expect(noOfRows).toEqual(resTypeGrid.items().length);
		} else {
			expect(noOfRows).toBeGreaterThan(resTypeGrid.items().length);
		}
	});

	xit("should not delete the resources, if it is used in resource hierarchy", () => {
		comp.createNode(nodeData);
		comp.ngOnInit();
		loadGrid(stateService);
		let resGrid = $("#k-ui-r-grid").data("kendoGrid");
		let treeview = $("#childTree").data("kendoTreeView");
		let noOfRows = resGrid.items().length;
		let removeButton = fixture.debugElement.nativeElement.querySelector("#resources a.k-button.k-grid-remove");
		let tr = $(removeButton).closest("tr");
		let dataItem = resGrid.dataItem(tr);
		removeButton.click();
		if (treeview.findByText(dataItem.name).length) {
			expect(noOfRows).toEqual(resGrid.items().length);
		} else {
			expect(noOfRows).toBeGreaterThan(resGrid.items().length);
		}
	});

	xit("should not delete the node, if there are child resources or accounts assigned to it", () => {
		comp.createNode(nodeData);
		comp.ngOnInit();
		loadGrid(stateService);
		let treeview = $("#childTree").data("kendoTreeView");
		// let contextMenu = $("#resources-context-menu").data("kendoContextMenu");
		treeview.expand(treeview.findByText("JobTrackerTAG"));
		let destNode = treeview.findByText("All Titles");

		contextMenu.trigger("select", {
			item: {
				textContent: 'Delete'
			},
			target: destNode
		});
		expect(treeview.findByText("All Titles").length).toEqual(1);
	})

	xit("should delete the node, if there are no child resources or accounts assigned to it", () => {
		comp.createNode(nodeData);
		comp.ngOnInit();
		loadGrid(stateService);
		let treeview = $("#childTree").data("kendoTreeView");
		// let contextMenu = $("#resources-context-menu").data("kendoContextMenu");
		treeview.expand(treeview.findByText("JobTrackerTAG"));
		let destNode = treeview.findByText("Traffic - Traffic");
		spyOn(window, 'confirm').and.returnValue(true);
		contextMenu.trigger("select", {
			item: {
				textContent: 'Delete'
			},
			target: destNode
		});
		expect(treeview.findByText("Traffic - Traffic").length).toEqual(0);
	})

	xit("should be able to drop the nodes in correct targets from resource grid", () => {
		comp.createNode(nodeData);
		comp.ngOnInit();
		loadGrid(stateService);
		let treeview = $("#childTree").data("kendoTreeView");
		let treeview1 = $("#childTree").data("kendoDropTargetArea");
		treeview.expand(treeview.findByText("JobTrackerTAG"))
		let drpTarget = $("#childTree span.k-in:contains('All Titles')");
		treeview1.trigger("drop", {
			type: "drop",
			valid: true,
			draggable: {
				userEvents: {
					filter: "tr.k-state-selected"
				},
				currentTarget: "#resources tr:nth-child(4)"
			},
			dropTarget: drpTarget
		});
		expect(treeview.findByText("CATEGORY TEST").length).toEqual(1);
	});

	xit("should be able to drop the nodes in correct targets from treeview", () => {
		comp.createNode(nodeData);
		comp.ngOnInit();
		loadGrid(stateService);
		let treeview = $("#childTree").data("kendoTreeView");
		treeview.expand(treeview.findByText("JobTrackerTAG"))
		let srcnode = treeview.findByText("A - Ads");
		let destnode = treeview.findByText("All Titles");
		treeview.trigger("drop", {
			type: "drop",
			valid: true,
			sourceNode: srcnode,
			destinationNode: destnode
		})
		expect($(destnode).find("li.k-item:contains('A - Ads')").length).toEqual(1);
	});

	xit("should not drop the nodes on in-correct targets from resource grid", () => {
		comp.createNode(nodeData);
		comp.ngOnInit();
		loadGrid(stateService);
		let treeview = $("#childTree").data("kendoTreeView");
		let treeview1 = $("#childTree").data("kendoDropTargetArea");
		treeview.expand(treeview.findByText("JobTrackerTAG"))
		let drpTarget = $("#childTree span.k-in:contains('D - Direct Mail')");
		treeview1.trigger("drop", {
			type: "drop",
			valid: true,
			draggable: {
				userEvents: {
					filter: "tr.k-state-selected"
				},
				currentTarget: "#resources tr:nth-child(6)"
			},
			dropTarget: drpTarget
		});
		expect(treeview.findByText("CATEGORY TEST").length).toEqual(0);
	});

	xit("should not drop the nodes on in-correct targets from treeview", () => {
		comp.createNode(nodeData);
		comp.ngOnInit();
		loadGrid(stateService);
		let treeview = $("#childTree").data("kendoTreeView");
		treeview.expand(treeview.findByText("JobTrackerTAG"))
		let srcnode = treeview.findByText("A - Ads");
		let destnode = treeview.findByText("D - Direct Mail");
		treeview.trigger("drop", {
			type: "drop",
			valid: true,
			sourceNode: srcnode,
			destinationNode: destnode
		});
		expect($(destnode).find("li.k-item:contains('A - Ads')").length).toEqual(0);
	});

	xit("should disable delete and copy option for root node", () => {
		comp.createNode(nodeData);
		comp.ngOnInit();
		loadGrid(stateService);
		let treeview = $("#childTree").data("kendoTreeView");
		let rootNode = treeview.findByText("JobTrackerTAG");
		let root = $(rootNode).find("span.k-in");
		root.trigger("contextmenu");
		console.log((contextMenu));
		expect($(contextMenu.element).children().length).toEqual($(contextMenu.element).children("li.k-state-disabled").length);
	});

	xit("should show paste option on correct targets only when data is copied", () => {
		comp.createNode(nodeData);
		comp.ngOnInit();
		loadGrid(stateService);
		let treeview = $("#childTree").data("kendoTreeView");
		treeview.expand(treeview.findByText("JobTrackerTAG"));
		let destNode = treeview.findByText("All Titles");
		let destTarget = $(destNode).find("span.k-in");
		//comp.copiedData = { "parentResourceId": 3, "resourceMappingId": 48, "name": "I - Inserts", "spriteCssClass": "module", "items": [], "id": "", "index": 20 }
		comp.copiedData = {"parentResourceId":3,"resourceMappingId":48,"name":"I - Inserts","spriteCssClass":"module","items":[{"parentResourceId":48,"resourceMappingId":65,"name":"User","spriteCssClass":"permission","items":[],"index":0}],"index":20};
		destTarget.trigger("contextmenu");
		//let contextMenu = $("#resources-context-menu").data("kendoContextMenu");

		expect($(contextMenu.element).children().length).toEqual(3);
	});

	xit("should add copied node on select of paste option in context menu", () => {
		comp.createNode(nodeData);
		comp.ngOnInit();
		loadGrid(stateService);
		let treeview = $("#childTree").data("kendoTreeView");
		// let contextMenu = $("#resources-context-menu").data("kendoContextMenu");
		treeview.expand(treeview.findByText("JobTrackerTAG"));
		let srcNode = treeview.findByText("A - Ads");
		let destNode = treeview.findByText("All Titles");
		let srcTarget = $(srcNode).find("span.k-in");
		let destTarget = $(destNode).find("span.k-in");
		srcTarget.trigger("contextmenu");
		contextMenu.trigger("select", {
			item: {
				textContent: 'Copy'
			},
			target: srcNode
		});
		destTarget.trigger("contextmenu");
		contextMenu.trigger("select", {
			item: {
				textContent: 'Paste'
			},
			target: destNode
		});
		expect($(destNode).find("ul.k-group li.k-item:contains('A - Ads')").length).toEqual(1)
	});
});
