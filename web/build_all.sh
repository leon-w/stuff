BUILD_DIR_NAME="__build__"

mkdir "$BUILD_DIR_NAME"

# countdown
mkdir "$BUILD_DIR_NAME/countdown"
cd countdown
npm ci
npm run build
cp -r build/. "../$BUILD_DIR_NAME/countdown"
cd ..

# helloworld
mkdir "$BUILD_DIR_NAME/helloworld"
cd helloworld
cp helloworld.html "../$BUILD_DIR_NAME/helloworld/index.html"
cd ..
