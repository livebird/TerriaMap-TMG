import PropTypes from "prop-types";
import React from "react";
import RelatedMaps from "terriajs/lib/ReactViews/RelatedMaps/RelatedMaps";
import {
  ExperimentalMenu,
  MenuLeft
} from "terriajs/lib/ReactViews/StandardUserInterface/customizable/Groups";
import { action, runInAction, observable, computed } from "mobx";
import MenuItem from "terriajs/lib/ReactViews/StandardUserInterface/customizable/MenuItem";
import StandardUserInterface from "terriajs/lib/ReactViews/StandardUserInterface/StandardUserInterface";
import version from "../../version";
import "./global.scss";

// function loadAugmentedVirtuality(callback) {
//   require.ensure(
//     "terriajs/lib/ReactViews/Map/Navigation/AugmentedVirtualityTool",
//     () => {
//       const AugmentedVirtualityTool = require("terriajs/lib/ReactViews/Map/Navigation/AugmentedVirtualityTool");
//       callback(AugmentedVirtualityTool);
//     },
//     "AugmentedVirtuality"
//   );
// }

// function isBrowserSupportedAV() {
//   return /Android|iPhone|iPad/i.test(navigator.userAgent);
// }

export default function UserInterface(props) {
  const relatedMaps = props.viewState.terria.configParameters.relatedMaps;
  const aboutButtonHrefUrl =
    props.viewState.terria.configParameters.aboutButtonHrefUrl;
  const aboutEnabled = props.terria.configParameters.aboutEnabled;
  const relatedMapsEnabled = props.terria.configParameters.relatedMapsEnabled;

  function sendEventToDevice(event) {
    var ifrm = document.createElement("IFRAME");
    ifrm.setAttribute("src", "js-frame:" + event);
    document.documentElement.appendChild(ifrm);
    ifrm.parentNode.removeChild(ifrm);
    ifrm = null;
  }

  const eventArray = {
    onClick: function (next) {
      if (
        props.terria.mainViewer._lastViewer &&
        props.terria.mainViewer._lastViewer.scene &&
        props.terria.mainViewer._lastViewer.scene.map &&
        props.terria.mainViewer._lastViewer.scene.map._events &&
        props.terria.mainViewer._lastViewer.scene.map._events.click
      ) {
        var newPickLocation =
          props.terria.mainViewer._lastViewer.scene.map._events.click[0].fn;
        props.terria.mainViewer._lastViewer.scene.map._events.click[0].fn =
          function (e) {
            console.log("new location");
            newPickLocation(e);
            window.currentLatLong = {
              latitude: props.terria.leaflet.mouseCoords.latitude,
              longitude: props.terria.leaflet.mouseCoords.longitude
            };
            console.log(window.currentLatLong);
            sendEventToDevice("onClick");
          };
      } else if (next) {
        next(next);
      }
    },
    move: function (next) {
      if (
        props.terria.mainViewer._lastViewer &&
        props.terria.mainViewer._lastViewer.scene &&
        props.terria.mainViewer._lastViewer.scene.map &&
        props.terria.mainViewer._lastViewer.scene.map._events &&
        props.terria.mainViewer._lastViewer.scene.map._events.move
      ) {
        var newPickLocation =
          props.terria.mainViewer._lastViewer.scene.map._events.move[0].fn;
        props.terria.mainViewer._lastViewer.scene.map._events.move[0].fn =
          function (e) {
            console.log("move map");
            newPickLocation(e);
            window.currentLatLong = {
              latitude: props.terria.leaflet.mouseCoords.latitude,
              longitude: props.terria.leaflet.mouseCoords.longitude
            };
            console.log(window.currentLatLong);
            sendEventToDevice("move");
          };
      } else if (next) {
        next(next);
      }
    },
    zoomend: function (next) {
      if (
        props.terria.mainViewer._lastViewer &&
        props.terria.mainViewer._lastViewer.scene &&
        props.terria.mainViewer._lastViewer.scene.map &&
        props.terria.mainViewer._lastViewer.scene.map._events &&
        props.terria.mainViewer._lastViewer.scene.map._events.zoomend
      ) {
        var newPickLocation =
          props.terria.mainViewer._lastViewer.scene.map._events.zoomend[0].fn;
        props.terria.mainViewer._lastViewer.scene.map._events.zoomend[0].fn =
          function (e) {
            console.log("zoomend map");
            newPickLocation(e);
            window.currentLatLong = {
              latitude: props.terria.leaflet.mouseCoords.latitude,
              longitude: props.terria.leaflet.mouseCoords.longitude
            };
            console.log(window.currentLatLong);
            sendEventToDevice("zoomend");
          };
      } else if (next) {
        next(next);
      }
    }
  };

  function triggerAllEvents() {
    for (const key in eventArray) {
      if (Object.hasOwnProperty.call(eventArray, key)) {
        const element = eventArray[key];
        const newFunc = function (next) {
          setTimeout(function () {
            element(next);
          }, 1000);
        };
        newFunc(newFunc);
      }
    }
  }

  triggerAllEvents();

  props.terria.locationService = function (zoomToLocation) {
    /*
      My location code
       */
    window.zoomToMyLocation = function (
      latitude,
      longitude,
      error = undefined
    ) {
      if (latitude !== undefined && longitude !== undefined) {
        zoomToLocation({
          coords: {
            latitude: latitude,
            longitude: longitude
          }
        });
      } else if (error !== undefined) {
        //Show alert
      }
    };
    function post(url) {
      return new Promise((resolve, reject) => {
        const req = new XMLHttpRequest();
        req.open("POST", url);
        req.onload = () =>
          req.status === 200
            ? resolve(req.response)
            : reject(Error(req.statusText));
        req.onerror = (e) => reject(Error(`Network Error: ${e}`));
        req.send();
      });
    }

    post("./getLocation")
      .then((result) => {
        console.log("getLocation", result);
        result = JSON.parse(result);
        if (result.latitude !== undefined && result.longitude !== undefined) {
          zoomToLocation({
            coords: {
              latitude: result.latitude,
              longitude: result.longitude
            }
          });
        } else {
          alert("Error in getting location");
        }
      })
      .catch((err) => {
        // Do stuff on error...
        alert("Error in calling network call");
      });

    // $.ajax({
    //   url: "./getLocation",
    //   method: "POST",
    //   success: function(result) {
    //     if (result.isSuccess !== undefined && result.isSuccess === true) {
    //       window.zoomToMyLocation(result.latitude, result.longitude);
    //     } else if (result.message !== undefined) {
    //       //Show alert
    //     }
    //   }
    // });
  };

  let myLocation = null;
  /*
      Go to coordinate code
       */
  props.terria.gotoCoordinate = function (gotoCoordinate, that) {
    myLocation = that;
    window.gotoCoordinate = function (latitude, longitude) {
      gotoCoordinate(latitude, longitude, myLocation);
    };
  };

  props.terria.getCenterLatLong = function (getCenterLatLong, that) {
    myLocation = that;
    window.getCenterLatLong = function () {
      return getCenterLatLong(myLocation);
    };
  };

  /**
   *
   * @param {Object} baseMap : viewState.terria.baseMaps[index]
   * Change index to update map type, refer baseMaps array for more details
   * @use : selectBaseMap(viewState.terria.baseMaps[0])
   */
  const mapTypes = {
    "Bing Maps Aerial with Labels": "basemap-bing-aerial-with-labels",
    "Bing Maps Aerial": "basemap-bing-aerial",
    "Bing Maps Roads": "basemap-bing-roads",
    "Natural Earth 2": "basemap-natural-earth-II",
    "NASA Black Marble": "basemap-black-marble",
    "Postitron(Light)": "basemap-positron",
    "Dark Matter": "basemap-darkmatter",
    "Here Terrain": "basemap-here-terrain",
    "Here Satellite": "basemap-here-satellite",
    "Thunderforest Outdoors": "basemap-thunderforest-outdoors",
    "Thunderforest Transport Dark": "basemap-thunderforest-transport-dark",
    "ESRI World Imagenary Basemap": "basemap-esri-world-imagery-basemap",
    "ESRI Shaded Relief Basemap": "basemap-esri-shaded-relief",
    "ESRI World Street Map Basemap": "basemap-esri-world-street-map",
    "ESRI NatGeo World Map Basemap": "basemap-esri-natGeo-world-map"
  };
  /**
   *
   * @param {} mapJson
   */
  function getBaseMap(maptype) {
    const basemaps = props.viewState.terria.baseMapsModel.baseMapItems;
    for (let i = 0; i < basemaps.length; i++) {
      if (basemaps[i].item.uniqueId == mapTypes[maptype]) {
        return basemaps[i];
      }
    }
  }
  window.selectBaseMap = function (mapJson) {
    const tmpJSON = JSON.parse(mapJson);
    const baseMap = getBaseMap(tmpJSON.maptype);
    props.terria.mainViewer.setBaseMap(baseMap.item);

    if (baseMap.item) {
      const baseMapId = baseMap.item.uniqueId;
      if (baseMapId) {
        props.terria.setLocalProperty("basemap", baseMapId);
      }
    }
  };

  window.changeTimeline = function (flag) {
    runInAction(() => {
      if (flag) {
        props.terria.timelineStack.defaultTimeVarying =
          new DefaultTimelineModel();
      } else {
        props.terria.timelineStack.defaultTimeVarying = undefined;
      }
    });
  };
  window.mapQuality = function (val) {
    runInAction(() => {
      props.terria.baseMaximumScreenSpaceError = val || 0;
    });
  };
  window.selectViewer = function (viewer) {
    runInAction(() => {
      const mainViewer = props.terria.mainViewer;
      if (viewer === "3d" || viewer === "3dsmooth") {
        mainViewer.viewerMode = "cesium";
        mainViewer.viewerOptions.useTerrain = viewer === "3d";
      } else if (viewer === "2d") {
        mainViewer.viewerMode = "leaflet";
      } else {
        console.error(
          `Trying to select ViewerMode ${viewer} that doesn't exist`
        );
      }
      // We store the user's chosen viewer mode for future use.
      props.terria.setLocalProperty("viewermode", viewer);
      props.terria.currentViewer.notifyRepaintRequired();
    });
  };
  return (
    <StandardUserInterface {...props} version={version}>
      <MenuLeft>
        {aboutButtonHrefUrl ? (
          <MenuItem
            caption="About"
            href={aboutButtonHrefUrl}
            key="about-link"
          />
        ) : null}
        {relatedMaps && relatedMaps.length > 0 ? (
          <RelatedMaps relatedMaps={relatedMaps} />
        ) : null}
      </MenuLeft>
      <ExperimentalMenu>
        {/* <If condition={isBrowserSupportedAV()}>
          <SplitPoint
            loadComponent={loadAugmentedVirtuality}
            viewState={props.viewState}
            terria={props.viewState.terria}
            experimentalWarning={true}
          />
        </If> */}
      </ExperimentalMenu>
    </StandardUserInterface>
  );
}

UserInterface.propTypes = {
  terria: PropTypes.object,
  viewState: PropTypes.object
};
