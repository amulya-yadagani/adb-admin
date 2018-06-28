import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { DialogService } from '@progress/kendo-angular-dialog';

import { AppStateService } from "./state/app-state.service";
import { SAVE_URL } from "./utils/constants";
import { SAVE_ERROR } from "./utils/messages";
import { SAVE_DATA, SAVE_DATA_RESULT, NOTIFICATION, LOADER } from "./state/actions";
import { getErrorAction, getErrorMessage } from "./utils/parser-util";

@Injectable()
export class AppService {

  constructor(private http: Http, private stateService:AppStateService, private dialogService:DialogService) {
    stateService.subscribe(SAVE_DATA, this.saveData.bind(this));
  }

  saveData(action) {
    const self = this;
    this.stateService.showLoader(true);

    this.http.post(SAVE_URL,action.payload)
             .map((res:Response) => {
               const result = res.json();
               return result;
             })
             .catch(this.handleError.bind(this))
             .subscribe(result => {
               self.stateService.showLoader(false);
               let data = {
                 success: !result.isError
               };

               self.stateService.dispatch({
                 type: SAVE_DATA_RESULT,
                 payload: data
               })
             });
  }

  handleError(err:any,caught): any {
    console.log(`AppService Status: ${err.status} Message: ${err.statusText}`);

    this.stateService.showLoader(false);

    /* const nAction = {
        type: NOTIFICATION,
        payload: {msg: `${SAVE_ERROR}: ${err.statusText} - ${getErrorMessage(err)}`}
    }; */

    let msg = getErrorMessage(err);
    this.dialogService.open({
      title: "Error",
      content: `${SAVE_ERROR}: ${err.statusText} - ${msg}`,
      //width: 200
    });

    //this.stateService.dispatch(nAction);

    const errAction = getErrorAction(err, "saveData()", "app.service.ts");
    this.stateService.dispatch(errAction);

    //Return observable that emits response. This will call fn passed to subscribe() with that response
    return Observable.of(JSON.parse(err._body));
  }
}
