#!/bin/bash
# from CodeBuild: export CLOUDFROUNT_DIST_ID="E1IVKYV6SH3ZXY"
# from CodeBuild: export REACT_APP_STAGE="prod"

export BUILD_DIR=$(pwd)
export ICON_APIS="icon-app-api-service-base icon-app-api-service-externo icon-app-api-service-interno icon-app-api-service-metas"

echo $(date)" - Adjust config file..."
for proj in $ICON_APIS; do
	mkdir -p \
		$BUILD_DIR/$proj/config \
		$BUILD_DIR/$proj/libs

	cp $BUILD_DIR/config/config.json $BUILD_DIR/$proj/config/config.json
	cp -r $BUILD_DIR/icon-api-libs/* $BUILD_DIR/$proj/libs/
done

echo $(date)" ============================================================================================="

echo $(date)" - Downloading NPM dependencies..."

for proj in $ICON_APIS; do
	cd $BUILD_DIR/$proj && npm install --no-optional > $BUILD_DIR/build.$proj.log 2>&1 &
	echo $(date)" - $proj - Finished"
done

cd $BUILD_DIR/icon-app-ui && npm install --no-optional --legacy-peer-deps > $BUILD_DIR/build.icon-app-ui.log 2>&1 &
wait
echo $(date)" - icon-app-ui - Finished"

echo $(date)" ============================================================================================="

echo $(date)" - Starting deploy..."

for proj in $ICON_APIS; do
	cd $BUILD_DIR/$proj
	serverless prune -n 3 --region sa-east-1 --stage $REACT_APP_STAGE >> $BUILD_DIR/build.$proj.log 2>&1
	serverless deploy --verbose --region sa-east-1 --stage $REACT_APP_STAGE >> $BUILD_DIR/build.$proj.log 2>&1 &
	echo $(date)" - $proj - Finished"
done

echo $(date)" ============================================================================================="

echo $(date)" - Start UI build..."
cd $BUILD_DIR/icon-app-ui && \
	npm run build-prod --prod >> $BUILD_DIR/build.icon-app-ui.log 2>&1 &

echo $(date)" - Waiting..."
wait
echo $(date)" - Finished"

echo $(date)" ============================================================================================="

echo $(date)" - Start UI deploy..."
cd $BUILD_DIR/icon-app-ui
serverless deploy --verbose --region sa-east-1 --stage $REACT_APP_STAGE #>> $BUILD_DIR/build.icon-app-ui.log 2>&1

echo $(date)" ============================================================================================="

echo $(date)" - Clear CF front..."
cd $BUILD_DIR/icon-app-ui && \
	aws cloudfront create-invalidation \
		--distribution-id $CLOUDFROUNT_DIST_ID \
		--paths "/*"

echo $(date)" - Finished"

echo $(date)" ============================================================================================="
echo $(date)" ============================================================================================="
echo ""

cd $BUILD_DIR
LOG_FILES=$(ls -1 build.*.log)
for x in $LOG_FILES; do
	echo ""
	echo "================================ $x ============================="
	echo ""
	cat $x
	echo ""
	echo "================================================================="
	echo ""
done