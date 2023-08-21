#!/usr/bin/env bash

ANDROID_HOME=~/Library/Android/sdk

compile() {
  javac -d build/classes -classpath $ANDROID_HOME/platforms/android-25/android.jar $*
}

rm -rf build
mkdir -p build/{classes,apk}

compile src/cztomsik/app/*.java

# compile everything to one classes.dex file
$ANDROID_HOME/build-tools/26.0.2/dx --dex --output=build/apk/classes.dex build/classes

# create apk
$ANDROID_HOME/build-tools/26.0.2/aapt package -vf -M src/AndroidManifest.xml -I $ANDROID_HOME/platforms/android-25/android.jar -F build/app.apk build/apk

# sign with debug key
$ANDROID_HOME/build-tools/26.0.2/apksigner sign -ks ~/.android/debug.keystore --ks-key-alias androiddebugkey --ks-pass pass:android --key-pass pass:android build/app.apk
