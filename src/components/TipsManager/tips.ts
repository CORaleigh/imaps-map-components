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
        title: "Property Attributes",
        text: "If a property is currently selected, you will see the option to show attributes of the selected property on the export.",
      },
      {
        title: "Exports Tab",
        text: "All exports saved during your session will appear in the exports tab.",
      },
      {
        title: "View Print Area",
        text: "View the extent of your export using the Print Area option.  This works best when selecting a custom scale rather than using the current map scale option.",
      },
    ],
  },
  {
    panel: "property-search",
    title: "Property Search Tips",
    tips: [
      { title: "Display Additional Columns",
        text: "Display addressional columns in the table on the list tab.  These columns will remain next time iMAPS loads."
      },
      { title: "Search History",
        text: "View recent searches by clicking on the clock icon next to the search input.  Clicking on a recent search will select that property."
      },      
      {
        title: "Click and Hold to Select",
        text: "Click and hold on a property to select it from the map.",
      },
      {
        title: "Search Panel Resizable",
        text: "When viewing the list of properties on the list tab, you can expand the width on larger devices.",
      },
      {
        title: "Septic and Wells",
        text: "If there is a septic system or well on a property, you will see a button linking to septic permits or well sampling results.",
      },      
    ],
  },
  {
    panel: "basemaps",
    title: "Basemap Tips",
    tips: [
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
        text: "Layers are groups by categories in the layer list, opening these groups will show layers in that category.",
      },
      {
        title: "Layer Filter",
        text: "Use the search box above the layer list to filter the layers by title.",
      },      
      {
        title: "Reset Layers",
        text: "The reset button the header will set all layers to not visible, except for the property layer.",
      },          
      {
        title: "Property Labels",
        text: "Clicking on the ... button next to the property layer will allow for labels to be shown on the map for site address, PIN number, owner and sale information.  Multiple can be selected to show stacked labels.",
      },  
      {
        title: "Layer Visiblity Stored",
        text: "Layer visibility is automatically stored so the next time you visit iMAPS, those layers will be visible (unless browser cache is cleared).",
      },              
      {
        title: "Changing Transparency",
        text: "The transparency for layer can be adjusted by clicking the icon to the right of the layer name.  This will persist during your next session.",
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
      {
        title: "Intersection Search",
        text: "Searching by street name and selecting a street name under the intersections category will display a list of all intersecting streets.  Selecting an intersecting street will zoom to that location on the map.",
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
        text: "Long pressing on a property will select that property without the property select tool being opened.",
      },
    ],
  },
  {
    panel: "sketch",
    title: "Sketch Tips",
    tips: [
      {
        title: "Custom Symbols",
        text: "You can specify custom symbols in the sketch tool by changing the fill color, outline color, size, etc. of your graphics.",
      },
      {
        title: "Adjust Existing Sketches",
        text: "By clicking the sketch select tool (arrow) and selecting a sketch on the map, you can adjust its symbol, adjust the content of a text sketch or delete the sketch.",
      },      
    ],
  },
];
