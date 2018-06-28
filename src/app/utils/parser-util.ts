import { LOG_TO_SERVER } from "../state/actions";

/**
 * This function constructs a tree of app resources. The api returns a flat structure of parent and     child nodes
 * @param data - array of records with resourceMappingId and parentResourceMappingid properties which          indicate the parent child relationship
 *
 * @return array of app resources with their children
 */
export function parseAppResources(resources:Array<any>, accounts:Array<any>) {
  const rootApps = []; // Has all the root nodes which have parentResourceMappingId as null
  const resourceMap = {}; // map of resourceMappingId -> object

  resources.forEach(item => {
    item.items = [];//create children array
    //item.spriteCssClass = item.resourceTypeName.toLowerCase();
    let cssClass = "noimage";
    //let imageFile = item.imageFile ? item.imageFile : "noimage.png";

    if(item.imageFile){
      let imageFile = item.imageFile;
      cssClass = imageFile.toLowerCase().split(".")[0];
    }
    //fallback is resourceTypeName
    /* else if(item.resourceTypeName) {
      cssClass = item.resourceTypeName.toLowerCase();
    } */

    item.spriteCssClass = cssClass;

    item.hasChildren = false;

    if(item.resourceMappingId in resourceMap) {
      //If resource is already present it means a temporary resource was created
      //So populate the actual resource along with items from temporary resource
      let temp = resourceMap[item.resourceMappingId];
      resourceMap[item.resourceMappingId] = item;
      item.items = temp.items;
      item.hasChildren = item.items.length != 0;
    }
    else {
      resourceMap[item.resourceMappingId] = item;
    }

    if(item.parentResourceMappingid == null) {
      rootApps.push(item);//populate root nodes
    }
    else {
      if(item.parentResourceMappingid in resourceMap) {
        resourceMap[item.parentResourceMappingid].items.push(item);
        //Since parent node has children, set hasChildren for arrow to be displayed in tree
        resourceMap[item.parentResourceMappingid].hasChildren = true;
      }
      else {
        //If parent resource is not in map, create a temporary resource
        resourceMap[item.parentResourceMappingid] = {items:[item]};
      }
    }
  });

  /* accounts.sort((a,b) => {
    let nameA = a.name.toUpperCase(); // ignore upper and lowercase
    let nameB = b.name.toUpperCase(); // ignore upper and lowercase
    if (nameA < nameB) {
      return -1;
    }
    if (nameA > nameB) {
      return 1;
    }

    return 0;
  }); */

  accounts.forEach(ac => {
    ac.hasChildren = false;
    let accountType = ac.accountType.toLowerCase()
    if(accountType == "person")
      ac.spriteCssClass = "person";
    else
      ac.spriteCssClass = "group";

    let resource = resourceMap[ac.parentResourceMappingid];
    if(resource) {
      resource.items.push(ac);
      //Since permission/role node has children, set hasChildren for arrow to be displayed in tree
      resource.hasChildren = true;
    }
  });

  return rootApps;
}

/**
 * This function traverses the tree (provided as arr parameter) recursively to find the account with    provided id as accountId
 * @param id - accountId of the account to be found
 * @param arr - the array in tree from with children property as 'items'
 */
export function findById(id, arr) {
  for(let _item of arr) {
    if(_item.accountId === id) {
        return _item;
    }
    else if(_item.items && _item.items.length > 0) {
        const r = findById(id,_item.items);
        //This if fixes the issue where the children were not cached for sub-groups
        if(r) {
          return r;
        }
    }
  }

  return null;
}

/**
 * This function traverses the tree (provided as arr parameter) recursively to find an item with provided key and value
 * @param key - property of the item whose value is to be compared
 * @param value - value to be compared to
 * @param arr - the array in tree from with children property as 'items'
 */
export function findByKeyValue(key, value, arr) {
  for(let _item of arr) {
    if(key in _item && _item[key] === value) {
        return _item;
    }
    else if(_item.items && _item.items.length > 0) {
        const r = findByKeyValue(key,value,arr);

        if(r) {
          return r;
        }
    }
  }

  return null;
}

/**
 * This function creates an action to log error in server.
 * This function is used in service classes where http requests are made
 * @param err - Response
 * @param methodName - name of the method in *.service.ts class where http error occurred
 * @param fileName - filename where error occurred
 */
export function getErrorAction(err:any,methodName,fileName) {
  return {
    type: LOG_TO_SERVER,
    payload: {
      data: {
        ...err,
        message: "Http error",
        fileName: fileName,
        stack: methodName
      }
    }
  }
}

export function getAllTreeItems(treeview) {   
    let items = [];
    console.log(treeview.items())
    treeview.items().toArray().forEach(item => {
      items.push(treeview.dataItem(item));
    });
    return items;
  }

export function getErrorMessage(err) {
  let msg = "";

  if(err) {
    if(err._body) {
      let resp = JSON.parse(err._body);

      if(resp && resp.isError) {
        let model = JSON.parse(resp.model);
        let acDetailsMsg = model.AccountDetail;
        let impersonationMsg = model.ImpersonationDetails;
        let appResourceMsg = model.ApplicationResource;

        if(resp.errorMessage) {
          msg = resp.errorMessage;
        }
        else {
          if(acDetailsMsg) {
            msg += acDetailsMsg + "\n";
          }
          if(impersonationMsg) {
            msg += impersonationMsg + "\n";
          }
          if(appResourceMsg) {
            msg += appResourceMsg;
          }
        }
      }
    }
  }

  return msg;
}
