# lively4-app
Lively4 to run locally

### Technologies
 
`electron` - we package and bundle our app with electron  


### Setup

run `./setup.sh`
- this inits all submodules
- installs all dependencies
- clones `lively4-core` repository and installs dependencies

### Scripts

- `npm start` - start an electron instance with the lively4-core embedded  
- `npm run dist` - builds a package with additional installer  
- `npm run pack` - builds the app for production  

### Dependencies

- `npm run install-submodules` - updates all dependencies from the submodules
- `npm run update-submodules` - updates submodules with the newest versions on github
