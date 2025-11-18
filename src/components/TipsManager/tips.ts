export interface Tip {
  title: string;
  text: string;
}
export interface Tips {
  panel: string;
  title: string;
  tips: Tip[];
}
export const tips: Tips[] = [
  {
    panel: "print",
    title: "Print Tips",
    tips: [
      {
        title: "Exports Tab",
        text: "All exports saved during your session will now appear in the exports tab.",
      },
      {
        title: "Map Only",
        text: "Use this option to export map, without the layout frame, for use in reports.  You can specifiy the pixel size of the resulting image.",
      },
    ],
  },
  {
    panel: "property-search",
    title: "Property Search Tips",
    tips: [
      {
        title: "Click and Hold to Select",
        text: "Click and hold on a property to select it from the map.",
      },
      {
        title: "Search Categories",
        text: "Select a search category to get more results as you type",
      },
      {
        title: "New Layout",
        text: "The property information is now displayed in an easier to read layout.  Deeds, photos and service have all been moved into a single display.",
      },
      {
        title: "Display Additional Columns",
        text: "In the new version, you can now display more columns on the property list. ",
      },
    ],
  },
  {
    panel: "basemaps",
    title: "Basemap Tips",
    tips: [
      {
        title: "Imagery Basemap",
        text: "The lastest years of imagery are available in the Imagery basemap under the base maps option.  We recommend using this base map for imagery, unless you need to access historic imagery.",
      },
      {
        title: "Esri Basemaps",
        text: "You now have access to all basemaps created by Esri by select the Esri Basemaps option from the dropdown.",
      },
      {
        title: "Property Color",
        text: "If you switch to a dark themed basemap or an imagery basemap, the property lines will change to white for better visibility.  They will change back to black when on a light themed basemap.",
      },
      {
        title: "Available Imagery",
        text: "If you go to an area outside of Raleigh, the list of available imagery will change to show you what is available in your area.  Also it will switch to the latest year available and warn you the the imagery has changed.",
      },
    ],
  },

  {
    panel: "layer-list",
    title: "Layer List Tips",
    tips: [
      {
        title: "Group Layers",
        text: "Layers in the layer list are now grouped based on category, making it easier to find layers.",
      },
    ],
  },
  {
    panel: "location-search",
    title: "Location Search Tips",
    tips: [
      {
        title: "Search By Place",
        text: "Search for places of interest such as schools and parks by typing the name of the school or park you are looking for.",
      },
    ],
  },
  {
    panel: "bookmarks",
    title: "Bookmarks Tips",
    tips: [
      {
        title: "Saving Bookmarks",
        text: "Bookmarks are automatically saved to your local storage in your browser.  Next time you open iMAPS in the same browser you will see the bookmarks from your last session.",
      },
    ],
  },
  {
    panel: "measure",
    title: "Measure Tips",
    tips: [
      {
        title: "Coordinate Search",
        text: "The coordinate search has been moved to the lower left corner of the map",
      },
    ],
  },
  {
    panel: "property-select",
    title: "Property Select Tips",
    tips: [
      {
        title: "Long Press to Select",
        text: "You can now select a property by long pressing on a property on the map.  This can be done at any time, even without having the property select tool active.",
      },
    ],
  },
  {
    panel: "sketch",
    title: "Sketch Tips",
    tips: [
      {
        title: "Custom Symbols",
        text: "You can now specify custom symbols in the sketch tool by changing the fill color, outline color, size, etc. of your graphics.",
      },
    ],
  },
];
