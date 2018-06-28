import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { Http, BaseRequestOptions, BaseResponseOptions, XHRBackend, XHRConnection, BrowserXhr, CookieXSRFStrategy } from '@angular/http';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import { USER_INFO_URL } from "./app/utils/constants";
import { Observable } from 'rxjs/Observable';

if (environment.production) {
  enableProdMode();
}

//Write the build version as attribute
document.documentElement.setAttribute("adb-version",environment.version)
window["getUserInfo"] = () => ({name:"hirparaj",displayName:"Guest",role:"ADBDeveloper",accountId:1105});
platformBrowserDynamic().bootstrapModule(AppModule);

/**
 * Create a strategy which does nothing.
 * This is done just to create an instance of Http so that we can make a call to get user info
 * Reference - https://stackoverflow.com/questions/39452451/angular2-ansychronous-bootstrapping-with-external-json-configuration-file/39454713#39454713
 */
/* class NoopCookieXSRFStrategy extends CookieXSRFStrategy {
  configureRequest(request) {
    // noop
  }
}

function getUserInfo() {
  let reqOptions = new BaseRequestOptions();
  let respOptions = new BaseResponseOptions();
  //let url = "http://tmpcmamva04/AdbAdminApiWinAuthEnabled/api/Common/UserInfo";
  return new Http(new XHRBackend(new BrowserXhr(),respOptions,new NoopCookieXSRFStrategy()),reqOptions).get(USER_INFO_URL)
                  .map(response => response.json())
                  .catch((err,observable) => {
                    console.log("Error occurred when getting user info -> ",err)
                    return Observable.of(err.json());
                  });
}

let sub = getUserInfo();
sub.subscribe((response) => {
  let el = document.querySelector(".root");

  if(!environment.production) {
    window["getUserInfo"] = () => ({name:"hirparaj",displayName:"Guest",role:"ADBDeveloper"});
  }
  else if("isError" in response) {
    if(response.isError && response.errorCode == 401) {
      el.textContent = `${response.errorMessage} ${response.message}`;
      return;
    }
    else if(!response.model) {
      el.textContent = "You are not authorized to access ADB Admin. Please contact your application administrator";
      return;
    }

    window["getUserInfo"] = () => response.model;

    if(!response.model.role) {
      el.textContent = "You do not have any role to access ADB Administrator application";
      return;
    }
  }
  else if(response.status == 401) {
    el.textContent = "You are not authorized to access ADB Admin. Please contact your application administrator";
    return;
  }

  platformBrowserDynamic().bootstrapModule(AppModule);
}) */
