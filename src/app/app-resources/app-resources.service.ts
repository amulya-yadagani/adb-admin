import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';

import { AppStateService } from "../state/app-state.service";
import { APP_RESOURCES_ERROR } from "../utils/messages";
import { APP_RESOURCES,
  APP_RESOURCES_RESULT,
  NOTIFICATION,
  LOG_TO_SERVER,
  APP_LIST,
  APP_LIST_RESULT,
  PARENT_GROUPS} from "../state/actions";
import { parseAppResources, getErrorAction } from "../utils/parser-util";


@Injectable()
export class AppResourcesService {

    constructor(private http: Http, private stateService:AppStateService) {
      stateService.subscribe(APP_LIST, this.getApplications.bind(this));
      stateService.subscribe(APP_RESOURCES, this.getAppResources.bind(this));
      stateService.subscribe(PARENT_GROUPS, this.getParentGroups.bind(this));
    }

    getApplications(action) {
      const that = this;
      that.stateService.showLoader(true);
      this.http.get(action.payload.url)
               .map((res:Response) => res.json())
               .catch(this.handleError.bind(this))
               .subscribe((result) => {
                 let apps = <any[]>result.model;
                 apps.forEach((item => {
                   item.hasChildren = true;//To show expand arrow
                   item.spriteCssClass = "application"//item.resourceTypeName.toLowerCase();
                 }));

                 that.stateService.appResources = apps;

                  const act = {
                    type: APP_LIST_RESULT,
                    payload: {
                      data: apps
                    }
                  }

                  that.stateService.dispatch(act);

                  that.stateService.showLoader(false);
               });
    }

    getAppResources(action) {
      const that = this;
      that.stateService.showLoader(true);
      this.http.get(action.payload.url)
               .map((res:Response) => <any[]>res.json())
               .catch(this.handleError.bind(this))
               .subscribe((data:any) => {
                 if("model" in data) {
                  that.stateService.resources = data.model.resources;
                  that.stateService.resourceTypes = data.model.resourceTypes;
                  that.stateService.resourceTypeTargets = data.model.resourceTypeTargets;
                  let { applicationResources, authorizedAccounts } = data.model;
                  const resources = parseAppResources(applicationResources, authorizedAccounts);

                  that.stateService.cacheAppDetails(action.payload.applicationId, data.model);

                  const act = {
                    type: APP_RESOURCES_RESULT,
                    payload: {
                      data: resources,
                      event: action.payload.event
                    }
                  }

                  that.stateService.dispatch(act);
                  that.stateService.showLoader(false);
                 }
              });
    }

    getParentGroups(action) {
      const self = this;
      this.http.get(action.payload.url)
               .map((res:Response) => <any[]>res.json())
               .catch(this.handleError.bind(this))
               .subscribe((data:any) => {
                  if("model" in data) {
                    let map = self.stateService.parentGroupMap;
                    map[action.payload.accountId] = data.model;
                  }
                });
    }

    handleError(response: any) {
        this.stateService.showLoader(false);

        const action = {
            type: NOTIFICATION,
            payload: {msg: `${APP_RESOURCES_ERROR}: ${response.statusText}`}
        };

        this.stateService.dispatch(action);

        const errAction = getErrorAction(response, "getAppResources()", "app-resources.service.ts")
        this.stateService.dispatch(errAction);

		    return Observable.of([]);
    }
}
