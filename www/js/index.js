function onDeviceReady() {
    $('body').addClass(device.platform.toLowerCase());

    // Bind events
    $(document).on("resume", onResume);
    $('#do-check').on("click", checkState);

    // Register change listeners for iOS
    if(device.platform === "iOS") {
        cordova.plugins.diagnostic.registerLocationAuthorizationStatusChangeHandler(function(status){
            console.log("Location authorization status changed to: "+status);
            checkState();
        });

        cordova.plugins.diagnostic.registerBluetoothStateChangeHandler(function(state){
            console.log("Bluetooth state changed to: "+state);
            checkState();
        });
    }

    // iOS settings
    $('#settings').on("click", function(){
        cordova.plugins.diagnostic.switchToSettings(function(){
            console.log("Successfully opened settings");
        }, function(error){
            console.error(error);
        });
    });

    $('#request-location-always').on("click", function(){
        cordova.plugins.diagnostic.requestLocationAuthorization(function(){
            console.log("Successfully requested location authorization always");
        }, function(error){
            console.error(error);
        }, "always");
    });

    $('#request-location-in-use').on("click", function(){
        cordova.plugins.diagnostic.requestLocationAuthorization(function(){
            console.log("Successfully requested location authorization when in use");
        }, function(error){
            console.error(error);
        }, "when_in_use");
    });

    $('#request-camera').on("click", function(){
        cordova.plugins.diagnostic.requestCameraAuthorization(function(granted){
            console.log("Successfully requested camera authorization: authorization was " + (granted ? "GRANTED" : "DENIED"));
            checkState();
        }, function(error){
            console.error(error);
        });
    });

    $('#request-camera-roll').on("click", function(){
        cordova.plugins.diagnostic.requestCameraRollAuthorization(function(status){
            console.log("Successfully requested camera roll authorization: authorization status is now " + status);
            checkState();
        }, function(error){
            console.error(error);
        });
    });

    // Android settings
    $('#location-settings').on("click", function(){
        cordova.plugins.diagnostic.switchToLocationSettings();
    });

    $('#mobile-data-settings').on("click", function(){
        cordova.plugins.diagnostic.switchToMobileDataSettings();
    });

    $('#bluetooth-settings').on("click", function(){
        cordova.plugins.diagnostic.switchToBluetoothSettings();
    });

    $('#wifi-settings').on("click", function(){
        cordova.plugins.diagnostic.switchToWifiSettings();
    });

    // Android set state
    $('#enable-wifi').on("click", function(){
        cordova.plugins.diagnostic.setWifiState(function(){
            console.log("Successfully enabled Wifi");
            setTimeout(checkState, 100);
        }, function(error){
            console.error(error);
        }, true);
    });

    $('#disable-wifi').on("click", function(){
        cordova.plugins.diagnostic.setWifiState(function(){
            console.log("Successfully disabled Wifi");
            setTimeout(checkState, 100);
        }, function(error){
            console.error(error);
        }, false);
    });

    $('#enable-bluetooth').on("click", function(){
        cordova.plugins.diagnostic.setBluetoothState(function(){
            console.log("Successfully enabled Bluetooth");
            setTimeout(checkState, 1000);
        }, function(error){
            console.error(error);
        }, true);
    });

    $('#disable-bluetooth').on("click", function(){
        cordova.plugins.diagnostic.setBluetoothState(function(){
            console.log("Successfully disabled Bluetooth");
            setTimeout(checkState, 1000);
        }, function(error){
            console.error(error);
        }, false);
    });

    $('#get-location').on("click", function(){
        var posOptions = { timeout: 35000, enableHighAccuracy: true, maximumAge: 5000 };
        navigator.geolocation.getCurrentPosition(function(position) {
            var lat = position.coords.latitude;
            var lon = position.coords.longitude;
            alert("Current position: "+lat+","+lon);
        }, function (err) {
            console.error("Position error: code="+ err.code + "; message=" + err.message);
            alert("Position error\ncode="+ err.code + "\nmessage=" + err.message);
        }, posOptions);
    });

    $('#use-camera').on("click", function(){
        navigator.camera.getPicture(function(){
            alert("Successfully took a photo");
        }, function(err){
            console.error("Camera error: "+ err);
            alert("Camera error: "+err);
        }, {
            saveToPhotoAlbum: false,
            destinationType: Camera.DestinationType.DATA_URL
        });
    });


    if(device.platform === "iOS") {
        // Make dummy Bluetooth request to cause authorization request on iOS
        bluetoothSerial.isEnabled(
            function () {
                // list the available BT ports:
                bluetoothSerial.list(
                    function (results) {
                        console.log(JSON.stringify(results));
                    },
                    function (error) {
                        console.log(JSON.stringify(error));
                    }
                );
            },
            function () {
                console.log("Bluetooth is not enabled/supported");
            }
        );
    }

    setTimeout(checkState, 500);
}


function checkState(){
    console.log("Checking state...");

    $('#state li').removeClass('on off');

    // Location
    cordova.plugins.diagnostic.isLocationEnabled(function(enabled){
        $('#state .location').addClass(enabled ? 'on' : 'off');
    }, onError);

    if(device.platform === "iOS"){
        cordova.plugins.diagnostic.isLocationEnabledSetting(function(enabled){
            $('#state .location-setting').addClass(enabled ? 'on' : 'off');
        }, onError);

        cordova.plugins.diagnostic.isLocationAuthorized(function(enabled){
            $('#state .location-authorization').addClass(enabled ? 'on' : 'off');
        }, onError);

        cordova.plugins.diagnostic.getLocationAuthorizationStatus(function(status){
            $('#state .location-authorization-status').find('.value').text(status.toUpperCase());
            $('.request-location').toggle(status === "not_determined");
        }, onError);
    }

    if(device.platform === "Android"){
        cordova.plugins.diagnostic.isGpsLocationEnabled(function(enabled){
            $('#state .gps-location').addClass(enabled ? 'on' : 'off');
        }, onError);

        cordova.plugins.diagnostic.isNetworkLocationEnabled(function(enabled){
            $('#state .network-location').addClass(enabled ? 'on' : 'off');
        }, onError);

        cordova.plugins.diagnostic.getLocationMode(function(mode){
            $('#state .location-mode').find('.value').text(mode.toUpperCase());
        }, onError);
    }

    // Camera
    cordova.plugins.diagnostic.isCameraEnabled(function(enabled){
        $('#state .camera').addClass(enabled ? 'on' : 'off');
    }, onError);

    if(device.platform === "iOS"){
        cordova.plugins.diagnostic.isCameraPresent(function(enabled){
            $('#state .camera-present').addClass(enabled ? 'on' : 'off');
        }, onError);

        cordova.plugins.diagnostic.isCameraAuthorized(function(enabled){
            $('#state .camera-authorized').addClass(enabled ? 'on' : 'off');
        }, onError);

        cordova.plugins.diagnostic.getCameraAuthorizationStatus(function(status){
            $('#state .camera-authorization-status').find('.value').text(status.toUpperCase());
            $('#request-camera').toggle(status === "not_determined");
        }, onError);

        cordova.plugins.diagnostic.isCameraRollAuthorized(function(enabled){
            $('#state .camera-roll-authorized').addClass(enabled ? 'on' : 'off');
        }, onError);

        cordova.plugins.diagnostic.getCameraRollAuthorizationStatus(function(status){
            $('#state .camera-roll-authorization-status').find('.value').text(status.toUpperCase());
            $('#request-camera-roll').toggle(status === "not_determined");
        }, onError);
    }

    cordova.plugins.diagnostic.isWifiEnabled(function(enabled){
        $('#state .wifi').addClass(enabled ? 'on' : 'off');

        if(device.platform === "Android") {
            $('#enable-wifi').toggle(!enabled);
            $('#disable-wifi').toggle(!!enabled);
        }
    }, onError);

    cordova.plugins.diagnostic.isBluetoothEnabled(function(enabled){
        $('#state .bluetooth-available').addClass(enabled ? 'on' : 'off');

        if(device.platform === "Android") {
            $('#enable-bluetooth').toggle(!enabled);
            $('#disable-bluetooth').toggle(!!enabled);
        }
    }, onError);

    if(device.platform === "iOS"){
        cordova.plugins.diagnostic.getBluetoothState(function(state){
            $('#state .bluetooth-state').find('.value').text(state.toUpperCase());
        }, onError);
    }
}

function onError(error){
    console.error("An error occurred: "+error);
}

function onResume(){
    checkState();
}


$(document).on("deviceready", onDeviceReady);