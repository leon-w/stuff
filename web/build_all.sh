BUILD_DIR="__build__"

mkdir "$BUILD_DIR"

# countdown
mkdir "$BUILD_DIR/countdown"
cd countdown
npm ci
npm run build
cp -r build/. "$BUILD_DIR/countdown"
cd ..

# helloworld
mkdir "$BUILD_DIR/helloworld"
cd helloworld
cp helloworld.html "$BUILD_DIR/helloworld/index.html"
cd ..
