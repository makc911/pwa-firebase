# Clients

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 10.0.5.

This is test project just to check working of PWA (online/offline mode, Firebase, IndexedDB)

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files. `ng serve` can't work with Service worker.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

### Running Build
- Install `http-server` package globally `npm install http-server -g`.
- Run `ng build --prod` to build the project.
- Start local server `http-server -p 8080 dist\clients`
- Navigate to `localhost:8080` in browser.

### Using your mobile device for dev testing:
- Create **build** (see above).
- Start local server `http-server -p 8080 --proxy http://[your_local_ip]:8080? dist/clients` (*your_local_ip* should be like _192.168.0.100_ - see terminal log) or `http-server -p 8080 -c-1 --proxy http://localhost:8080? dist/clients`.
- Connect your device to the same WiFi network.
- Open in mobile browser `http://[your_local_ip]:8080`

### Setting
- there is a Firebase configuration in environment.ts. Any time you are available to change it for you own.
