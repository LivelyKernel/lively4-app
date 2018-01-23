# lively4-app
Lively4 to run locally

### Technologies
 
`electron` - we package and bundle our app with electron  


### Setup

run `npm run setup`  
- this inits all submodules
- installs all dependencies
- handle the gulp and babel stuff (in lively4-server)

### Scripts

- `npm start` - start an electron instance with the lively4-core embedded  
- `npm run dist` - builds a package with additional installer  
- `npm run pack` - builds the app for production  

### Dependencies

- `npm run update-submodules` - updates submodules with the newest versions on github
- `npm run install-submodules` - updates all dependencies from the submodules
