# ADB Admin

Angular version of ADB Admin Silverlight application

#### Pre-requisites
To run this application, [NodeJS](https://nodejs.org/dist/v6.11.1/node-v6.11.1-x64.msi) version v6.11.1 should be installed

#### To set up the app

* Checkput the project from TFS (http://tmpcmamva02:8080/tfs/ADBAdmin 2.0/Client/Main/adb-admin-2.0)
*	Then go to project directory adb-admin-2.0 where package.json is there
*	Then run npm install to download the dependencies
*	To build the project and run the server, execute npm start

If there are no errors, you can access the app at localhost:4200

#### Creating a build and deploying it

##### Pre-requisite
Running the build script also increments the patch version in `package.json` and updates the `src/environments/environment.prod.ts` file with new app version. This version number is then populated in `index.html`. So make sure the latest `package.json` is checked out before creating the build

To create a build,
* Make sure `replace-in-file` node package is installed. It is used along with `npm version patch` command to increment the version number in each 
* Also make sure `package.json` file and `src/environments/environment.prod.ts` are writable and not read only
* Run command `npm run build`. This will create a `dist` folder which will have the build files. To make sure the build works, the app will be automatically opened in the default browser with url `localhost:3000`. Do a sanity check
* To deploy the app, remote login to `tmpcmamva04` server
* Go to `D:\ADBAdmin\ADB Admin 2.0\client\dist` and paste the build files in this folder
