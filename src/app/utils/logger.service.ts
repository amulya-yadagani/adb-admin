import { Injectable, ErrorHandler } from '@angular/core';
import { Http } from "@angular/http";
import { Observable } from 'rxjs/Observable';

import { environment } from '../../environments/environment';
import { AppStateService } from '../state/app-state.service';
import { LOG_TO_SERVER } from "../state/actions";
import { LOG_ERROR_URL } from "./constants";

@Injectable()
export class LoggerService implements ErrorHandler {

  constructor(private http:Http, private stateService:AppStateService) {
    this.stateService.subscribe(LOG_TO_SERVER, this.logToServer.bind(this));

    //Only use console in dev env
    if(!environment.production) {
      this.stateService.subscribe(LOG_TO_SERVER, (action) => {
        console.log(this.parseError(action.payload.data));
      });
    }
  }

  /**
   * Global error handler. It handles errors that occur at run time and also the ones that are thrown   using throw
   * @param error - either ErrorEvent (when throw is used) or sub-classes of Error (run time errors     like TypeError, ReferenceError etc)
   */
  handleError(error:any) {
    let action = {
      payload: {
        data: error
      }
    }

    this.logToServer(action);

    //Only use console in dev env
    if(!environment.production) {
      throw error;
    }
  }

  /**
   * Logs error to the server. The url passed in payload is used to log error. If no url is provided, default url used is Constants.LOG_ERROR_URL. data field in payload is the error object.
   * If it is a subclass of Error object (e.g TypeError generated at run time) then message, fileName and stack properties  are used to log error.
   * If it is ErrorEvent then its error property is used to log error to server
   * @param action {type,paload:{url, data}}
   */
  logToServer(action) {
    let url = action.payload.data.logUrl;
    let data = this.parseError(action.payload.data);

    if(!url)
      url = LOG_ERROR_URL;

    this.http.post(url,data)
      .catch(this.handleResponseError.bind(this))
      .subscribe(response => {
        //message logged to server or failed to do so
      })
  }

  handleResponseError(err:any,source:any) {
    return Observable.of("Fail silently on LoggerService response error");
  }

  /**
   * Convert error to object that the api accepts.
   * @param error - either ErrorEvent or sub-class of Error (e.g TypeError generated at runtime)
   */
  private parseError(error:any) {
    let result = null, errorMessage, errorDescription, component, logType = 1;//For error;

    // error is ErrorEvent
    if(error.error) {
      error = error.error;
    }

    errorMessage = error.message ? error.message : error.toString();
    errorDescription = error["fileName"] ? `${error.message}, in file: ${error["fileName"]} at ${error["lineNumber"]}` : error.toString()
    component = error["stack"] ? error["stack"] : "Unknown";

    result = {
      errorMessage,
      errorDescription,
      component,
      logType
    }

    return result;
  }
}
