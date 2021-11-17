// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  dbVersion: 1,
  appVersion: 3,
  useIndexedDb: true,

  firebaseConfig: {
    apiKey: 'AIzaSyBYCgXgHQa-Rf82pqRq2Ci6uHqne0lqRnA',
    authDomain: 'clients-app-20bb2.firebaseapp.com',
    projectId: 'clients-app-20bb2',
    storageBucket: 'clients-app-20bb2.appspot.com',
    messagingSenderId: '216691451391',
    appId: '1:216691451391:web:c339da033a66c5239fb3ca'
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
