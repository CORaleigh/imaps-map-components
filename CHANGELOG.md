# iMAPS Change Log

  Version 5.0
  released 6/1/2026

## 
  @arcgis-map-components: 5.0.19
  @esri/calcite-components: 5.0.2


## Migrated from ArcGIS JS SDK Widgets to Components
- with widgets being decrecated at version 5.0 of the ArcGIS JavaScript SDK all widgets have been migreated to components.

## Polygon labeling enhanced
- at version 5.0 of the ArcGIS JS SDK, polygon labels now adjust to the map extent, previously labels were placed at the center of the feature and only appeared when the center was in the map extent.

## Built in User Guide
- the user guide has been built into iMAPS in place of PDF
- animated GIFs added to show how to use tools
- table of contents to easily navigate
- added help action to the header of all panels and tools which opens the help to that section

## Location search moved to tools
- Previously the location search appeared as the second option in the panels section.  Since there was excessive white space, it has been moved to the tools section and appears in the upper right corner of the map.

## Coordinate widget
- layout has been changed slightly
- added copy to clipboard action

## Sketch widget
- redeveloped to handle bugs

## Changes to layer persistence
- previous version stored entire web map JSON, this version stores properties for the visible layers which is used to control which layers are visible on load.