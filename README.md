# lively4-app
Lively4 to run locally

#### Technologies

`yarn` - if you don't know about yarn [look at this!](https://yarnpkg.com/lang/en/docs/install/)  
we don't need gulp because `yarn` handles the building stuff  
`electron` - we package and bundle our app with electron  


#### Setup

- `yarn run setup` - inits submodules and installs all dependencies

#### Start

- `yarn start` - start an electron instance with the lively4-core embedded
- `yarn run dist` - builds a package with additional installer
- `yarn run pack` - builds the app for production

#### Dependencies

- `yarn run update-submodules` - updates submodules with the newest versions on github
- `yarn run install-submodules` - updates all dependencies from the submodules
