npm run setup
cd lively4/
git clone -b gh-pages https://github.com/LivelyKernel/lively4-core.git
cd lively4-core/
npm i
cd ../../

# create root symlinks
cd scripts
./create-symlink.sh
