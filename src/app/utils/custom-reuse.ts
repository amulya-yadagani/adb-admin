import { ActivatedRouteSnapshot, DetachedRouteHandle, RouteReuseStrategy, Route, PRIMARY_OUTLET } from '@angular/router';

//Implemented as provided here -> https://github.com/angular/angular/issues/13869#issuecomment-301632612
// This impl. bases upon one that can be found in the router's test cases.
export class CustomReuseStrategy implements RouteReuseStrategy {

  handlers: { [path: string]: DetachedRouteHandle } = {};

  shouldDetach(route: ActivatedRouteSnapshot): boolean {
    //Avoid second call to getter
    let config: Route = route.routeConfig;
    //Don't store lazy loaded routes
    return config && !config.loadChildren;
  }

  store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle): void {
    let path: string = this.getRoutePath(route);
    this.handlers[path] = handle;
    /*
      This is where we circumvent the error.
      Detached route includes nested routes, which causes error when parent route does not include the same nested routes
      To prevent this, whenever a parent route is stored, we change/add a redirect route to the current child route
    */
    let config: Route = route.routeConfig;
    if (config) {
      let childRoute: ActivatedRouteSnapshot = route.firstChild;

      let futureRedirectTo = childRoute ? childRoute.url.map(function (urlSegment) {
        return urlSegment.path;
      }).join('/') : '';
      let childRouteConfigs: Route[] = config.children;
      if (childRouteConfigs) {
        let redirectConfigIndex: number;
        let redirectConfig: Route = childRouteConfigs.find(function (childRouteConfig, index) {
          if (childRouteConfig.path === '' && !!childRouteConfig.redirectTo) {
            redirectConfigIndex = index;
            return true;
          }
          return false;
        });
        //Redirect route exists
        if (redirectConfig) {
          if (futureRedirectTo !== '') {
            //Current activated route has child routes, update redirectTo
            redirectConfig.redirectTo = futureRedirectTo;
          } else {
            //Current activated route has no child routes, remove the redirect (otherwise retrieval will always fail for this route)
            childRouteConfigs.splice(redirectConfigIndex, 1);
          }
        } else if (futureRedirectTo !== '') {
          childRouteConfigs.push({
            path: '',
            redirectTo: futureRedirectTo,
            pathMatch: 'full'
          });
        }
      }
    }
  }

  shouldAttach(route: ActivatedRouteSnapshot): boolean {
    return !!this.handlers[this.getRoutePath(route)];
  }

  retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle {
    let config: Route = route.routeConfig;
    //We don't store lazy loaded routes, so don't even bother trying to retrieve them
    if (!config || config.loadChildren) {
      return false;
    }
    return this.handlers[this.getRoutePath(route)];
  }

  shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
    return future.routeConfig === curr.routeConfig;
  }

  getRoutePath(route: ActivatedRouteSnapshot): string {
    let namedOutletCount: number = 0;
    return route.pathFromRoot.reduce((path, route) => {
      let config: Route = route.routeConfig;
      if (config) {
        if (config.outlet && config.outlet !== PRIMARY_OUTLET) {
          path += `(${config.outlet}:`;
          namedOutletCount++;
        } else {
          path += '/';
        }
        return path += config.path;
      }
      return path;
    }, '') + (namedOutletCount ? new Array(namedOutletCount + 1).join(')') : '');
  }
}
