let host = window.location.origin;

//For dev mode, point to tmpcmamva04 server. Else use the server from where app is served
if (window.location.hostname === "localhost") {
  host = "http://tmpcmamva04";
}

const ENDPOINT = `${host}/AdbAdminApi/api`; // "http://tmpcmamva05/AdbAdminApi/api";
const ACCOUNTS_URL = ENDPOINT + "/AccountNav/";
const ADB_URL = ACCOUNTS_URL + "adb";
const AD_URL = ACCOUNTS_URL + "ad";
const I_URL = ACCOUNTS_URL + "i";
const ALL_URL = ACCOUNTS_URL + "ALL";

const APP_RESOURCE_URL = ENDPOINT + "/ApplicationResource/ApplicationResource";
const APP_LIST_URL = APP_RESOURCE_URL + "/Applications";
const APP_RESOURCE_TREE_URL = APP_RESOURCE_URL + "/Applications/Resources";
//  http://tmpcmamva04/adbadminapi/api/Account/Details/
// temporary local JSON for Account Details Tab
const USERACCOUNT_URL = ENDPOINT + '/Account/Details/';
const USERMEMBERSHIP_URL = ENDPOINT + '/Account/RefreshMembership/';
const USERAUTHORIZATIONS_URL = ENDPOINT + '/Account/Details/Authorization/Applications/';
const USERAUTHORIZATIONS_RESOURCES_URL = ENDPOINT + '/Account/Details/Authorization/Applications/Resources/';
const USERIMPERSONATIONS_URL = ENDPOINT + '/Account/Details/Impersonation/';
const USERROLES_URL = ENDPOINT + '/Account/Details/Roles/';
const ACCOUNTS_SEARCH_URL = ACCOUNTS_URL + "search/";
const GROUP_DETAILS = ACCOUNTS_URL + "group/";
const PARENT_GROUPS_URL = USERACCOUNT_URL + "Groups/";

// API URLs for Impersonation module
const IMPERSONATION_APPLICATIONS_URL = ENDPOINT + '/Impersonation/Applications';
const IMPERSONATED_ACCOUNTS_URL = ENDPOINT + '/Impersonation/';
const IMPERSONATION_ACCOUNT_LIST_URL = ENDPOINT + '/Impersonation/ImpersonationAccountList/';

// API URLs for Application User module
const APPLICATION_USER_URL = ENDPOINT + '/ApplicationUsers/Applications';
const APPLICATION_APPUSER_URL = ENDPOINT + '/ApplicationUsers/Users';
const APPLICAION_ROLES_URL = ENDPOINT + '/ApplicationUsers/Roles';

// API URLs for Audit Log Modeul
const AUDITLOG_URL = ENDPOINT + '/AccountLog/Details';

const USER_INFO_URL = ENDPOINT + "/Common/UserInfo";
const SAVE_URL = ENDPOINT + "/Common/SaveAllResources";//ENDPOINT

const LOG_URL = ENDPOINT + "/log/";//Append error, success, warning, information accordingly
const LOG_ERROR_URL = LOG_URL + "error";
const LOG_SUCCESS_URL = LOG_URL + "success";
const LOG_WARNING_URL = LOG_URL + "warning";
const LOG_INFORMATION_URL = LOG_URL + "information";
const ROLE_DEV = "adbdeveloper";
const ROLE_ADMIN = "adbadministrator";
const PERM_DEV = "ADBDeveloper";
const PERM_ADMIN = "ADBAdministrator";
const PERM_IMPERSONATOR = "ADBImpersonator";
const ROLE_IMPERSONATOR = "adbimpersonator";

const newApp = {
	applicationId: 0,
	description: '',
	hasChildren: true,
	imageFile: 'Application.png',
	isExcluded: false,
	items: [{
			applicationId: 0,
			description: 'ADB Administrator',
			hasChildren: false,
			imageFile: 'permission.png',
			isExcluded: false,
			name: 'ADBAdministrator',
			parentResourceMappingId: 0,
			resourceID: 0,
			resourceMappingId: 0,
			resourceTypeName: 'Permission',
			spriteCssClass: 'permission',
			state: ''
		},
		{
			applicationId: 0,
			description: 'ADB Developer',
			hasChildren: true,
			imageFile: 'permission.png',
			isExcluded: false,
			name: 'ADBDeveloper',
            items: [
                {
                    accountId: 0,
                    accountName: '',
                    accountType: "Person",
                    applicationId: 0,
                    authorizationId:0,
                    hasChildren: false,
                    isActive: true,
                    isExclud: false,
                    name: '',
                    parentResourceMappingId: 0,
                    spriteCssClass: 'person',
                    state: ''
                }
            ],
			parentResourceMappingId: 0,
			resourceID: 0,
			resourceMappingId: 0,
			resourceTypeName: 'Permission',
			spriteCssClass: 'permission',
			state: ''
		}
	],
	name: '',
	parentResourceMappingId: 0,
	resourceID: 0,
	resourceMappingId: 0,
	resourceTypeName: 'Application',
	spriteCssClass: 'application',
	state: ''
}

const newAppResources = {
    resourceTypes: [
        {
            resourceTypeId: 0,
            applicationId: 0,
            name: "Application",
            imageFile: "Application.png",
            state: "Added"
        },
         {
            resourceTypeId: 0,
            applicationId: 0,
            name: "Role",
            imageFile: "Role.png",
            state: "Added"
        },
         {
            resourceTypeId: 0,
            applicationId: 0,
            name: "Permission",
            imageFile: "permission.png",
            state: "Added"
        }
    ],
    resourceTypeTargets: [
        {
            applicationId: 0,
            resourceTypeTargetId : 0,
            sourceResourceTypeId: 0,
            targetResourceTypeId: 0,
            state: "Added"
        },
        {
            applicationId: 0,
            resourceTypeTargetId : 0,
            sourceResourceTypeId: 0,
            targetResourceTypeId: 0,
            state: "Added"
        }
    ],
    resources: [
        {
            name: "",
            resourceId: 0,
            description: "",
            resourceTypeId: 0,
            applicationId: 0,
            resourceTypeName: "Application",
            imageFile: "application",
            state: "Added"
        },
        {
            name: "",
            resourceId: 0,
            description: "",
            resourceTypeId: 0,
            applicationId: 0,
            resourceTypeName: "Permission",
            imageFile: "permission",
            state: "Added"
        },
        {
            name: "",
            resourceId: 0,
            description: "",
            resourceTypeId: 0,
            applicationId: 0,
            resourceTypeName: "Permission",
            imageFile: "permission",
            state: "Added"
        }
    ],

    applicationResources: [
       {
            resourceMappingId: 0,
            applicationId: 0,
            name: "",
            resourceID: "",
            parentResourceMappingId: 0,
            resourceTypeName: "Application",
            imageFile: "Application.png",
            description: "",
            state: "Added",
            isExcluded: false
       },
       {
            resourceMappingId: 0,
            applicationId: 0,
            name: "",
            resourceID: "",
            parentResourceMappingId: 0,
            resourceTypeName: "Permission",
            imageFile: "permission.png",
            description: "",
            state: "Added",
            isExcluded: false
       },
       {
            resourceMappingId: 0,
            applicationId: 0,
            name: "",
            resourceID: "",
            parentResourceMappingId: 0,
            resourceTypeName: "Permission",
            imageFile: "permission.png",
            description: "",
            state: "Added",
            isExcluded: false
       }

    ]
}

const initialAppState = {
    userInfo: {
      name: "hirparaj",
      displayName: "Guest",
      role: "ADBDeveloper"
    },
    accountsTree: [{
        accountId: "root_adb",
        displayName: "ADB Groups",
        hasChildren: true,
        spriteCssClass: "k-icon folder",
        endpoint: ADB_URL,
        isActive: true
    },
    {
        accountId: "root_ad",
        displayName: "AD Groups",
        hasChildren: true,
        spriteCssClass: "k-icon folder",
        endpoint: AD_URL,
        isActive: true
    },
    {
        accountId: "root_i",
        displayName: "Individuals",
        hasChildren: true,
        spriteCssClass: "k-icon folder",
        endpoint: I_URL,
        isActive: true
    }],
    groupChildrenMap: {},
    appResourceTab: {
      appResources: [],
      appResourceTypes: [],
      appResourcesData: [],
      appResourceTypeMap: [],
      applicationResources: [],
      //map of applicationId -> {resourceTypes,resourceTypeTargets,resources,applicationResources,authorizedAccounts}
      appResourceMap: {},
      authAccounts: [],
      //map of accountId -> array of groups an account belongs to. This is used when excluding an account
      parentGroupMap: {}
    },
    accountPanel: {
        _initialForm : {
            usrADB : {
                accountId: '',
                accountName: '',
                firstName: '',
                lastName: '',
                type: 'ADB Group',
                accountType: 'ADB Group',
                status: 'New',
                department: '',
                company: '',
                emailAddress: '',
                phoneNumber: '',
                isActive: true
            },
            usrIndividual : {
                accountId: '',
                accountName: '',
                firstName: '',
                lastName: '',
                type: 'Unknown',
                accountType: 'Unknown',
                status: 'Provisional',
                department: '',
                company: '',
                emailAddress: '',
                phoneNumber: '',
                isActive: false
            }
        },
        _gridColumns : {
            'groups': [
                {'hidden': true, 'field': 'accountId'},
                {'field': 'groupName', 'title': 'Group Name', 'filterable': {'multi': true, 'search': true, extra: true}},
                {'field': 'groupType', 'title': 'Type', 'filterable': {'multi': true, 'search': true}},
                {'field': 'status', 'title': 'Status', 'filterable': {'multi': true, 'search': true}}
            ],
            'members': [
                {'hidden': true, 'field': 'accountId', 'width': 420},
                {'field': 'accountName', 'title': 'Account Name', 'template': '<a click="accountLink()">#=name#</a>'},
                {'field': 'firstName', 'title': 'First Name'},
                {'field': 'lastName', 'title': 'Last Name'},
                {'field': 'emailAddress', 'title': 'Email'},
                {'field': 'department', 'title': 'Department'},
                {'field': 'phoneNumber', 'title': 'Phone Number'},
                {'field': 'isActive', 'title': 'Is Active', 'template': '<input type="checkbox" value="#=isActive#" checked="#=isActive#" disabled>'},
                {'field': 'accountType', 'title': 'Type'},
                {'field': 'lastLoginDate', 'title': 'Last Login'},
                {'field': 'status', 'title': 'Status'}
            ],
            'roles' : [
                {'hidden': true, 'field': 'roleId'},
                {'field': 'application', 'title': 'Application', 'filterable': {'multi': true, 'search': true}},
                {'field': 'roleName', 'title': 'Role', 'filterable': {'multi': true, 'search': true}},
                {'field': 'description', 'title': 'Description', 'filterable': {'multi': true, 'search': true}},
                {'field': 'source', 'title': 'Source', 'filterable': {'multi': true, 'search': true}},
                {'field': 'sourceAccount', 'title': 'Source Account', 'filterable': {'multi': true, 'search': true}}
            ],
            'impersonations': [
                {'field': 'applicationName', 'title': 'Application', 'filterable': {'multi': true, 'search': true}},
                {'field': 'impersonatedAccountDisplayName', 'title': 'Impersonated Account', 'filterable': {'multi': true, 'search': true}},
                {'field': 'effectiveDate', 'title': 'Effective From', 'filterable': {'multi': true, 'search': true}},
                {'field': 'expires', 'title': 'Expires', 'filterable': {'multi': true, 'search': true}}
            ]
        },
        searched: false,
        routedLink : '',
        //Maintain an array of new accounts to be used when populating search results
        newAccounts: [],
        selectedAccount: {
            // user: {},
            // members: [],
            // roles: [],
            // authorizations: [],
            // impersonations: []
        },
        accountDetailsMap: {
            // (name as key) : {
            //     user: {},
            //     members: [],
            //     roles: [],
            //     authorizations: [],
            //     impersonations: []
            // }
        }
    },
    impersonation: {
        selectedApp: {},
        accounts: [],
        batch: {}
    },
    appUsers: {},
    auditLog: [],
    resourceManager: {
        resourcesTypes: [],
        resources: [],
        selectedApp: {}
    },
    saveContext: {
      accountDetail: []
    }
};

/* Account filter values */
const ACCOUNT_ALL = "All";
const ACCOUNT_ACTIVE = "Active";
const ACCOUNT_INACTIVE = "Inactive";

const CONTEXT_MENU_DELETE = "Delete";
const CONTEXT_MENU_COPY = "Copy";
const CONTEXT_MENU_CUT = "Cut";
const CONTEXT_MENU_PASTE = "Paste";
const CONTEXT_MENU_EXCLUDE = "Exclude";

const ORIGINAL = "Original";
const ADDED = "Added";
const MODIFIED = "Modified";
const DELETED = "Deleted";

const RESOURCE_TREE_MENU_ITEMS = {
  CONTEXT_MENU_DELETE,
  CONTEXT_MENU_COPY,
  CONTEXT_MENU_CUT,
  CONTEXT_MENU_PASTE,
  CONTEXT_MENU_EXCLUDE,
  data: [
    CONTEXT_MENU_DELETE,
    //Copy/Paste functionality will be implemented properly in phase 2
    /* CONTEXT_MENU_COPY,
    CONTEXT_MENU_CUT,
    CONTEXT_MENU_PASTE, */
    CONTEXT_MENU_EXCLUDE
  ]
};

const RESOURCE_IMGS = ['Application.png','Authority.png','Cluster.png','current.png','Division.png','Edit.png','Folder.png','Group.png','GroupDefault.png','Individual.png','Individuals.png','Module.png','permission.png','PermissionGroup.png','Provisional.png','Role.png','Title.png'];
const DEL_RESTYPE_ROW = "This resource type cannot be deleted because there are resources of this resource types.Please delete resources first.";
const DEL_RES_ROW = "This resource cannot be deleted because it is used to build the resource hierarchy for application"
const RES_TREEVIEW_DEL_OK = "Do you want to delete this resource from the application resource hierachy?"
const RES_TREEVIEW_DEL_CANCEL = "This resource cannot be deleted from the hierarchy since there are child resources or accounts assigned to it."
const RES_NAME_VALIDATION = "Resource name should be unique within the Resource Type";
const RES_TYPE_NAME_VALIDATION = "Resource Type name should be unique within application";
const RES_TYPE_IMAGE_VALIDATION = "Image File is required";
const RES_TYPE_IMAGE_DUPLICATE = "Resource Type image file should be unique within application";
const TARGET_VALIDATION = "The selected Target Type is not applicable for Resource Type";


export {
    ADB_URL,
    AD_URL,
    I_URL,
    ALL_URL,
    ACCOUNTS_SEARCH_URL,
    GROUP_DETAILS,
    PARENT_GROUPS_URL,
    newApp,
    newAppResources,
    initialAppState,
    ACCOUNT_ALL,
    ACCOUNT_ACTIVE,
    ACCOUNT_INACTIVE,
    RESOURCE_TREE_MENU_ITEMS,
    APP_LIST_URL,
    APP_RESOURCE_TREE_URL,
    RESOURCE_IMGS,
    DEL_RESTYPE_ROW,
    DEL_RES_ROW,
    RES_TREEVIEW_DEL_OK,
    RES_TREEVIEW_DEL_CANCEL,
    RES_NAME_VALIDATION,
    RES_TYPE_NAME_VALIDATION,
    RES_TYPE_IMAGE_VALIDATION,
    RES_TYPE_IMAGE_DUPLICATE,
    TARGET_VALIDATION,
    // Account Details Tab http URLs
    USERACCOUNT_URL,
    USERMEMBERSHIP_URL,
    USERAUTHORIZATIONS_URL,
    USERAUTHORIZATIONS_RESOURCES_URL,
    USERIMPERSONATIONS_URL,
    USERROLES_URL,
    SAVE_URL,
    LOG_ERROR_URL,
    LOG_INFORMATION_URL,
    LOG_SUCCESS_URL,
    AUDITLOG_URL,
    //Impersonation Tab http URLs
    IMPERSONATION_APPLICATIONS_URL,
    IMPERSONATED_ACCOUNTS_URL,
    IMPERSONATION_ACCOUNT_LIST_URL,

    // Application User Tab
    APPLICATION_USER_URL,
    APPLICAION_ROLES_URL,
    APPLICATION_APPUSER_URL,

    ORIGINAL,
    MODIFIED,
    ADDED,
    DELETED,
    USER_INFO_URL,
    ROLE_DEV,
    ROLE_ADMIN,
    ROLE_IMPERSONATOR,
    PERM_DEV,
    PERM_ADMIN,
    PERM_IMPERSONATOR

}
