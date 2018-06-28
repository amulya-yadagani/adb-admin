//App Service
const SAVE_ERROR = "Error occurred when saving data";

const SEARCH_ERROR = "Error occurred when performing search";
const GET_ACCOUNTS_ERROR = "Error occurred when getting accounts";

const APP_RESOURCES_ERROR = "Error occurred when getting Application Resources";
const DUPLICATE_ACCOUNT_ERROR = "Account already present in destination node";

//Account Details - Error Messages
const ACCOUNT_SEARCH_ERROR = "Error occurred, when performing search for an account";
const ACCOUNT_GRID_ERROR = "Error occured, while fetching grid field";
const ACCOUNT_UP_TO_DATE = 'Account is up to date';
const DELETE_MEMBER = "Are you sure you want to remove this member from group?"

//App resources
const DELETE_AUTHORIZATION = "Are you sure you want to delete authorization?";
const NO_AUTHORIZATION = "Account can not be excluded at this resource since no authorization exists for this account or any of its parents at the same or higher resource levels";
//const CHILD_AUTHORIZATION = "An authorization is already present at child resource level. So this authorization cannot be excluded at this level";
const CHILD_AUTHORIZATION = "Account can not be excluded at this resource since authorization exception or Permission already exists for a child resource at lower resource level. Please cleanup data before you assign this exception";

//Impersonation tab
const DELETE_IMPERSONATION = "Are you sure you want to delete this record?";
const SPAN_OVERLAP = "Multiple impersonations by same account must not have overlapping time span";

export {
  SAVE_ERROR,
  GET_ACCOUNTS_ERROR,
  SEARCH_ERROR,
  APP_RESOURCES_ERROR,
  DUPLICATE_ACCOUNT_ERROR,
  DELETE_AUTHORIZATION,
  NO_AUTHORIZATION,
  CHILD_AUTHORIZATION,
  DELETE_IMPERSONATION,
  SPAN_OVERLAP,
  DELETE_MEMBER
}
