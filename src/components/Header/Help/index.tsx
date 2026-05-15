/* eslint-disable @typescript-eslint/no-explicit-any */
import "@esri/calcite-components/components/calcite-dialog";
import "@esri/calcite-components/components/calcite-label";
import "@esri/calcite-components/components/calcite-list";
import "@esri/calcite-components/components/calcite-list-item";
import "@esri/calcite-components/components/calcite-link";
import "@esri/calcite-components/components/calcite-tree";
import "@esri/calcite-components/components/calcite-tree-item";
import "@esri/calcite-components/components/calcite-shell";
import "@esri/calcite-components/components/calcite-shell-panel";
import "@esri/calcite-components/components/calcite-fab";
import "@esri/calcite-components/components/calcite-icon";
import "@esri/calcite-components/components/calcite-notice";
import styles from "./Help.module.css";

import { useEffect, useState } from "react";

interface HelpSection {
  id: string;
  title: string;
  sections?: HelpSection[];
  icon?: any;
}
interface HelpProps {
  open: boolean;
  onClose: () => void;
}

export default function Help({ open, onClose }: HelpProps) {
  function useMediaQuery(query: string) {
    const [matches, setMatches] = useState(
      () => window.matchMedia(query).matches,
    );

    useEffect(() => {
      const media = window.matchMedia(query);
      const listener = () => setMatches(media.matches);

      media.addEventListener("change", listener);
      return () => media.removeEventListener("change", listener);
    }, [query]);

    return matches;
  }

  const isSmall = useMediaQuery("(max-width: 768px)");
  const [showToc, setShowToc] = useState<boolean>(!isSmall);

  const sections: HelpSection[] = [
    {
      id: "using-map",
      title: "Using Map",
      sections: [
        {
          id: "navigating-map",
          title: "Navigating Map",
          sections: [],
        },
        { id: "longpress-map", title: "Long Press to Select Property" },
        {
          id: "map-tools",
          title: "Map Tools",
          sections: [
            { id: "zoom-tools", title: "Zoom Tools" },
            { id: "home-tool", title: "Home Tool", icon: "home" },
            {
              id: "compass-tool",
              title: "Compass Tool",
              icon: "compass-needle",
            },
            { id: "location-tool", title: "Location Tool", icon: "compass-north-circle" },
            { id: "identify-tool", title: "Identify Tool", icon: "information" },
            { id: "streetview-tool", title: "Streetview Tool", icon: "360-view"  },
            { id: "overview-map", title: "Overview Map" },
            { id: "coordinates-tool", title: "Coordinates Tool",  icon: "crosshair"   },
          ],
        },
      ],
    },
    {
      id: "panels",
      title: "Panels",
      sections: [
        {
          id: "property-search",
          title: "Property Search",
          icon: "search",
          sections: [
            {
              id: "property-searching",
              title: "Searching for a Property",
              sections: [
                { id: "filtering-desc", title: "Filtering by Description" },
              ],
            },
            {
              id: "property-details",
              title: "Property Details",
              sections: [
                {
                  id: "property-links",
                  title: "Property Links",
                  sections: [
                    { id: "google-link", title: "Google Maps" },
                    { id: "tax-link", title: "Tax Page" },
                    { id: "septic-link", title: "Septic Permits" },
                    { id: "well-link", title: "Well Permits" },
                    { id: "county-link", title: "Other Counties" },
                  ],
                },
                { id: "deed-links", title: "Deed and Plat Links" },
                { id: "photos", title: "Photos" },
                { id: "services", title: "Services" },
                { id: "addresses", title: "Addresses" },
              ],
            },
            {
              id: "property-list",
              title: "Property List",
              sections: [
                { id: "list-select", title: "Selecting Property" },
                { id: "export-csv", title: "Export to CSV" },
                { id: "list-columns", title: "Columns" },
              ],
            },
          ],
        },
        {
          id: "layer-list",
          title: "Layer List",
          icon: "layers",
          sections: [
            { id: "group-layers", title: "Group Layers" },
            { id: "search-layers", title: "Searching Layers" },
            {
              id: "layer-options",
              title: "Layer Options",
              sections: [
                {
                  id: "layer-legend",
                  title: "Legend",
                },
                {
                  id: "layer-transparency",
                  title: "Layer Transparency",
                },
              ],
            },
            { id: "property-labels", title: "Property Labels" },
            { id: "layer-reset", title: "Resetting Layer Visibility" },
          ],
        },
        { id: "legend", title: "Legend", icon: "legend" },
        {
          id: "basemaps",
          title: "Basemaps",
          icon: "basemap",
          sections: [
            { id: "maps-basemaps", title: "Maps" },
            {
              id: "image-basemaps",
              title: "Images",
              sections: [
                { id: "basemaps-blend", title: "Blend" },
                { id: "basemaps-availability", title: "Basemap Availability" },
              ],
            },
            { id: "esri-basemaps", title: "Esri" },
          ],
        },
        { id: "bookmarks", title: "Bookmarks", icon: "bookmark" },
      ],
    },
    {
      id: "tools",
      title: "Tools",
      sections: [
        {
          id: "property-select",
          title: "Property Select",
          icon: "select",
          sections: [
            { id: "select-draw", title: "Drawing a Shape" },
            { id: "select-buffer", title: "Specifying a Buffer" },
          ],
        },
        {
          id: "location-search",
          title: "Location Search",
           icon: "pin",
          sections: [
            { id: "place-search", title: "Place Search" },
            { id: "intersection-search", title: "Intersection Search" },
          ],
        },
        { id: "measure", title: "Measure", icon: "measure-line" },
        {
          id: "sketch",
          title: "Sketch",
          icon: "pencil",
          sections: [
            { id: "sketch-draw", title: "Sketching on Map" },
            { id: "sketch-delete", title: "Deleting a Sketch" },
            { id: "sketch-clear", title: "Clearing all sketches" },
          ],
        },
        {
          id: "print",
          title: "Print",
          icon: "print",
          sections: [
            {
              id: "print-layout",
              title: "Layout Tab",
              sections: [
                {
                  id: "print-scale",
                  title: "Print Scale",
                },
                {
                  id: "print-attributes",
                  title: "Print Attributes",
                },
                {
                  id: "print-legend",
                  title: "Print Legend",
                },
                {
                  id: "print-area",
                  title: "Print Area",
                },
              ],
            },
            { id: "print-exports", title: "Exports Tab" },
          ],
        },
      ],
    },
  ];
  // const [faqSections, setFaqSections] = useState<FaqSection[]>([]);

  //   useEffect(() => {
  //     fetch("./faq.json")
  //       .then((res) => res.json())
  //       .then((data: FaqData) => setFaqSections(data.sections));
  //   }, []);
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <calcite-dialog
      open={open}
      modal
      heading="User Guide"
      oncalciteDialogClose={onClose}
      placement="cover"
    >
      <calcite-shell contentBehind={isSmall}>
        <calcite-shell-panel slot="panel-start" width="m" collapsed={!showToc}>
          <calcite-panel>
            <calcite-tree
              oncalciteTreeSelect={(
                event: HTMLCalciteTreeElement["calciteTreeSelect"],
              ) => {
                const item = event.target
                  .selectedItems[0] as HTMLCalciteTreeItemElement;
                if (item) {
                  scrollToSection(item.getAttribute("data-id") || "");
                  item.selected = false;
                }
              }}
            >
              {sections.map((section) => (
                <calcite-tree-item
                  key={section.id}
                  data-id={section.id}
                  expanded
                  onClick={(event) => {
                    (event.target as HTMLCalciteTreeItemElement).expanded =
                      true;
                    scrollToSection(section.id);
                  }}
                  iconStart={section.icon}
                >
                  {section.sections && (
                    <calcite-tree slot="children">
                      {section.sections.map((subSection) => (
                        <calcite-tree-item
                          key={subSection.id}
                          data-id={subSection.id}
                          expanded
                          iconStart={subSection.icon}
                        >
                          {subSection.title}
                          {subSection.sections && (
                            <calcite-tree slot="children">
                              {subSection.sections.map((subSection1) => (
                                <calcite-tree-item
                                  key={subSection1.id}
                                  data-id={subSection1.id}
                                  expanded
                                  iconStart={subSection1.icon}
                                >
                                  {subSection1.title}
                                  {subSection1.sections && (
                                    <calcite-tree slot="children">
                                      {subSection1.sections.map(
                                        (subSection2) => (
                                          <calcite-tree-item
                                            key={subSection2.id}
                                            data-id={subSection2.id}
                                            expanded
                                          >
                                            {subSection2.title}
                                          </calcite-tree-item>
                                        ),
                                      )}
                                    </calcite-tree>
                                  )}
                                </calcite-tree-item>
                              ))}
                            </calcite-tree>
                          )}
                        </calcite-tree-item>
                      ))}
                    </calcite-tree>
                  )}

                  {section.title}
                </calcite-tree-item>
              ))}
            </calcite-tree>
            <calcite-fab
              slot="fab"
              scale="l"
              style={{ position: "fixed", left: "10px", bottom: "10px" }}
              icon="sub-fields"
              onClick={() => setShowToc((prev) => !prev)}
            ></calcite-fab>
          </calcite-panel>
        </calcite-shell-panel>

        <calcite-panel>
          <calcite-fab
            slot="fab"
            scale="l"
            style={{ position: "fixed", left: "10px", bottom: "10px" }}
            icon={showToc ? "x" : "sub-fields"}
            onClick={() => setShowToc((prev) => !prev)}
          ></calcite-fab>
          <div
            onClick={() => {
              if (isSmall) {
                setShowToc(false);
              }
            }}
          >
            <h1 className={styles.header} id="using-map">Using Map</h1>

            <h2 className={styles.header} id="navigating-map">Navigating Map</h2>
            <ul>
              <li>
                To <strong>zoom</strong> the map with a mouse, scroll the wheel
                forward to <strong>zoom in</strong>, to
                <strong> zoom out </strong> scroll the wheel backward.
              </li>
              <li>
                To <strong>zoom</strong> the map with a touch device, pinch and
                bring your fingers together to <strong>zoom in</strong>, pinch
                and expand your fingers to zoom out.
              </li>
              <li>
                To <strong>pan</strong> the map with a mouse, hold the left
                button down and drag your mouse.
              </li>
              <li>
                To <strong>pan</strong> the map with a touch device, press and
                hold your finger on the map and move it in the direction you
                want to pan.
              </li>
              <li>
                To <strong>rotate</strong> the map with a mouse, press and hold
                the right mounse button and move the mouse to the left or the
                right.
              </li>
              <li>
                To <strong>rotate</strong> the map with a touch, press and hold
                with two fingers and twist to rotate.
              </li>
            </ul>
            <h2 className={styles.header} id="longpress-map">Long Press to Select Property</h2>
            <p>
              Long pressing on a property on the map will select that property.
            </p>
            <h2 className={styles.header} id="map-tools">Map Tools</h2>
            <p>
              Map tools appear in the top left, bottom left and bottom right
              corners of the map.
            </p>

            <h3  className={styles.header} id="zoom-tools">
              Zoom Tools <calcite-icon icon="plus"></calcite-icon>
              <calcite-icon icon="minus"></calcite-icon>
            </h3>
            <p>
              In the top left corner of the map are the zoom tools, press + to
              zoom in a level and - to zoom out a level.
            </p>

            <h3  className={styles.header} id="home-tool">
              Home Tool <calcite-icon icon="home"></calcite-icon>
            </h3>
            <p>
              The home button will set the map to the full extent of Wake
              County.
            </p>

            <h3  className={styles.header} id="compass-tool">
              Compass Tool <calcite-icon icon="compass-needle"></calcite-icon>
            </h3>
            <p>
              The compass tool indicates if the map has been rotated. Press to
              return to true north.
            </p>

            <h3  className={styles.header} id="location-tool">
              Location Tool
              <calcite-icon icon="compass-north-circle"></calcite-icon>
            </h3>
            <p>
              The location tool will zoom the map to your device's current
              location. Note that you will need to give iMAPS permission to use
              your device's location.
            </p>

            <h3  className={styles.header} id="identify-tool">
              Identify Tool <calcite-icon icon="information"></calcite-icon>
            </h3>
            <p>
              The identify tool allows you to press on a feature on the map to
              view a popup with details about the feature.
            </p>

              Identify Tool <calcite-icon icon={"360-view" as any}></calcite-icon>
            <h3  className={styles.header} id="streetview-tool">Streetview Tool  </h3>
            <p>
              The street view tool allows you to press on the map to view that
              location in Google Streetview in a new browser tab.
            </p>

            <h3  className={styles.header} id="overview-map">
              Overview Map <calcite-icon icon="arrow-up-left"></calcite-icon>
            </h3>
            <p>
              In the bottom right corner of the map is a button to display an
              overview map. When you pan on the main map, the map extent will
              appear in the overview map.
            </p>

            <h3  className={styles.header} id="coordinates-tool">
              Coordinates Tool <calcite-icon icon="crosshair"></calcite-icon>
            </h3>
            <p>
              The coordinates tool displays the coordinates for the location of
              your mouse cursor. Refer to the section under Tools for additional
              features.
            </p>

            <h1 className={styles.header} id="panels">Panels</h1>
            <p>
              Panels appear on the right side of the map. To change panels,
              press on the button in the top half of the action bar on the
              right.
            </p>

            <h2 className={styles.header} id="property-search">
              Property Search <calcite-icon icon="search"></calcite-icon>
            </h2>
            <p>
              The property search panel is how you can search for a property by
              the following attributes:
            </p>
            <ul>
              <li>Address</li>
              <li>Owner</li>
              <li>Parcel Identification Number (PIN)</li>
              <li>Real Estate ID (REID)</li>
              <li>Street Name</li>
            </ul>
            <h3  className={styles.header} id="property-searching">Searching for a Property</h3>
            <p>
              To search, start typing in the input box. As you type, suggestions
              will appear in a list below, once you see the suggestion you want,
              press on it.
            </p>
            <p>
              If you press the enter key while typing, all properties containing
              what you have typed will be searched for.
            </p>
            <p>
              To only show suggestions for a specific attribute, press the
              dropdown button to the left of the text input and select the
              attribute you are interested in. Select All to search by all
              attributes.
            </p>
            <p>
              To view your last ten searches, press the clock button{" "}
              <calcite-icon icon="clock"></calcite-icon>. Press on a search term
              to search for that property again.
            </p>
            <p>
              The clear button <calcite-icon icon="trash"></calcite-icon> will
              clear the input box and unselect the property.
            </p>
            <h3  className={styles.header} id="property-details">Property Details</h3>
            <p>
              After you have selected a property. Details about that property
              are displayed including:
            </p>
            <ul>Site Address</ul>
            <ul>Links to Other Sites</ul>
            <ul>General Details</ul>
            <ul>Ownership</ul>
            <ul>Property Values</ul>
            <ul>Last Sale Details</ul>
            <ul>Deeds</ul>
            <ul>Building Details</ul>
            <ul>Services</ul>
            <ul>Addresses</ul>

            <h4 className={styles.header} id="property-links">Property Links</h4>
            <h5 className={styles.header} id="google-link">Google Maps</h5>
            <p>
              Press the Google Maps button to open Google Maps at the location
              of the selected property.
            </p>
            <h5 className={styles.header} id="tax-link">Tax Page</h5>
            <p>
              Press the tax page button to view additional details about the
              property.
            </p>
            <h5 className={styles.header} id="septic-link">Septic Permits</h5>
            <p>
              If there is a septic permit associated with the property, a button
              will appear. Press to view the permit in a new browser tab.
            </p>

            <h5 className={styles.header} id="well-link">Well Results</h5>
            <p>
              If there is are well testing results associated with the property,
              a button will appear. Press to view the well testing details in a
              new browser tab.
            </p>
            <h5 className={styles.header} id="county-link">Other Counties</h5>
            <p>
              If the property is outside of Wake County, a button will appear
              with the county name as the label. Pressing the button will open
              that county's property research application. Press to view the
              well testing details in a new browser tab.
            </p>
            <h4 className={styles.header} id="deed-links">Deed and Plat Links</h4>
            <p>
              Under the deeds section, if a deed or book of maps is available
              for the property a Deeds or Book of Maps button will display.
              Pressing the buttons will open the document in a new browser tab.
            </p>
            <h4 className={styles.header} id="photos">Photos</h4>
            <p>
              If there are building photos available for the property, photos
              are displayed under the buildings section. If there are multiple
              photos available, press the arrow buttons below the photo.
            </p>
            <h4 className={styles.header} id="services">Services</h4>
            <p>
              Under the services section an accordion is displayed with a list
              of different categories. Pressing a category displays details
              about that category for the selected property.
            </p>
            <h4 className={styles.header} id="addresses">Addresses</h4>
            <p>
              A list of addresses located on the selected property are listed in
              a table. Pressing on an address in the table will zoom to that
              address point and display a pin on the map.
            </p>
            <p>
              The address list can be exported to a CSV file by pressing the{" "}
              <calcite-icon icon="ellipsis"></calcite-icon> button and selecting
              Export to CSV.
            </p>
            <h3  className={styles.header} id="property-list">Property List</h3>
            <p>
              If there are multiple properties that match your search, they will
              be listed in the List tab. Pressing on a row in the table will
              select that property and switch to the Info tab.
            </p>
            <h4 className={styles.header} id="export-csv">Export to CSV</h4>
            <p>
              To export the list of selected properties to a CSV file, press the{" "}
              <calcite-icon icon="ellipsis"></calcite-icon> button and select
              Export to CSV. All attributes available (not just those displayed)
              will be included in the CSV file.
            </p>
            <h4 className={styles.header} id="list-columns">Columns</h4>
            <p>
              By default only Address, Owner, REID, and PIN are displayed in the
              table. To view additional columns, press the columns button{" "}
              <calcite-icon icon="show-column"></calcite-icon> and select the
              columns you would like to view. These columns will be visible next
              time you visit iMAPS.
            </p>
            <p>
              To sort the table by a column, press the column header to sort in
              ascending order, press again to sort in descending order, press
              again to return to the original order.
            </p>
            <h2 className={styles.header} id="layer-list">
              Layer List <calcite-icon icon="layers"></calcite-icon>
            </h2>

            <h3  className={styles.header} id="group-layers">Group Layers</h3>
            <p>
              Layers are displayed in groups based on theme. To view the layers
              in a group. Press the right chevron
              <calcite-icon icon="chevron-right"></calcite-icon>
              to the left of the layer name to expand the group. Press the left
              chevron
              <calcite-icon icon="chevron-left"></calcite-icon> button to
              collapse the group.
            </p>
            <h3  className={styles.header} id="search-layers">Layers</h3>
            <p>
              To make a layer visible, press the check box to the left of the
              layer name. Press again to hide the layer from the map.
            </p>
            <p>
              If the layer name appears to be grayed out, that layer can not be
              displayed at the current map scale. The layer will appear once you
              zoom into is minimum zoom scale.
            </p>
            <h3  className={styles.header} id="search-layers">Searching Layers</h3>
            <p>
              There are a large number of layers available in the map. To easily
              find a layer, start typing the layer name in the search box above
              the map. Layers with names matching what you have entered will be
              filtered from the list.
            </p>
            <h3  className={styles.header} id="layer-options">Layer Options</h3>
            <p>
              When a layer is visible, the options button{" "}
              <calcite-icon icon="legend"></calcite-icon> appears to the right
              side of the layer name. Pressing this button will display a legend
              for that layer and a transparency slider to adjust the
              transparency of the layer. Slide to the left to make more
              transparent, slide to the right to make more opaque.
            </p>

            <h4 className={styles.header} id="layer-transparency">Layer Transparency</h4>
            <p>
              Slide to the left to make more transparent, slide to the right to
              make more opaque.
            </p>
            <h3  className={styles.header} id="property-labels">Property Labels</h3>
            <p>
              An additional button <calcite-icon icon="ellipsis"></calcite-icon>{" "}
              appears for the property layer. Press this button to see a list of
              labels that can be displayed on the map. Press on each type of
              label you would like to display. Press again to hide the label.
            </p>
            <h3  className={styles.header} id="layer-reset">Resetting Layer Visibility</h3>
            <p>
              To reset that layer list to its original state. Press the reset
              button <calcite-icon icon="reset"></calcite-icon> in the panel
              header.
            </p>
            <h2 className={styles.header} id="legend">
              Legend <calcite-icon icon="legend"></calcite-icon>
            </h2>
            <p>Displays the symbols for each layer visible on the map.</p>
            <h2 className={styles.header} id="basemaps">
              Basemaps <calcite-icon icon="basemap"></calcite-icon>
            </h2>
            <p>
              The map that is displayed behind the operational layers is the
              base map. There are three categories of basemaps available, press
              the tabs at the bottom of the panel to toggle between a the
              different base map types.
            </p>
            <h3  className={styles.header} id="maps-basemaps">
              Maps <calcite-icon icon="basemap"></calcite-icon>
            </h3>
            <p>
              These are base maps that are managed by the City of Raleigh and
              Wake County. These maps display data managed by the city and
              county.
            </p>
            <h3  className={styles.header} id="image-basemaps">
              Images <calcite-icon icon="image-layer"></calcite-icon>
            </h3>
            <p>
              These are aerial photography base maps available for the current
              year and previous years.
            </p>
            <h4 className={styles.header} id="basemaps-blend">Blend</h4>
            <p>
              Once an image base map is made avaiable, the option to blend the
              aerial photography with the default base map. Toggling the blend
              switch displays are slider.
            </p>
            <p>
              Slide the slider to the left to make the default base map more
              transparent and to the right to make it less transparent.
            </p>
            <p>To disable the blending, uncheck the blend switch.</p>

            <calcite-notice open>
              <div slot="message">
                <strong>Note: </strong> when the selected base map changes, the
                blend option is disabled.
              </div>
            </calcite-notice>

            <h4 className={styles.header} id="basemaps-availability">Image Basemap Availability</h4>
            <p>
              Not all imagery is made available county wide, some are only
              available for the City of Raleigh jurisdiction. When the map
              extent contains the City of Raleigh jurisdiction, all years are
              listed. When the map extent does not contain the City of Raleigh
              jurisdiction, only those available countywide are listed.
            </p>
            <p>
              If an image basemap is selected that is only available in the
              Raleigh jurisdiction and the map extent moves outside of Raleigh,
              the basemap will automatically change to the latest year available
              countywide. A warning will appear when the basemap changes.
            </p>
            <h3  className={styles.header} id="esri-basemaps">
              Esri <calcite-icon icon="arcgis-online"></calcite-icon>
            </h3>
            <p>
              Basemaps from our GIS vendor, Esri, on ArcGIS Online are also
              available to view. The data displayed on these base maps are not
              managed by the county.
            </p>
            <h2 className={styles.header} id="bookmarks">
              Bookmarks <calcite-icon icon="bookmark"></calcite-icon>
            </h2>
            <p>
              A list of default bookmark locations are listed in the bookmarks
              tool. Selecting a bookmark will zoom the map to that bookmark's
              extent.
            </p>
            <p>
              A bookmark in the list can be deleted or have it's title or extent
              modified by pressing the edit button on the right side of the
              bookmark. From there you can change the title of the book and
              position your map to the desired extent. Then press the Save
              button at the bottom to save it. The delete button will remove the
              bookmark from the list.
            </p>
            <p>
              You can also add your own bookmarks by pressing the Add Bookmark
              button at the bottom of the list. Then enter a title for your
              bookmark and adjust the map extent and press save.
            </p>
            <p>
              The bookmarks can also be reordered by pressing and holding the
              drag button <calcite-icon icon="drag"></calcite-icon>, dragging
              the bookmark to a new position and releasing.
            </p>
            <p>
              These bookmarks will be displayed the next time your visit iMAPS.
            </p>
            <calcite-notice open>
              <div slot="message">
                <strong>Note: </strong> clearing your browser cache will remove
                any bookmarks you have added or modified.
              </div>
            </calcite-notice>
            <h1 className={styles.header} id="tools">Tools</h1>
            <p>
              Tools appear in the top right corner of the map. To change tools,
              press on the button in the bottom half of the action bar on the
              right.
            </p>
            <p>
              If the tool gets in the way of the map, it can be collapsed by
              pressing the chevron button{" "}
              <calcite-icon icon="chevron-up"></calcite-icon> and then expanded
              by clicking it again{" "}
              <calcite-icon icon="chevron-down"></calcite-icon>.
            </p>
            <h2 className={styles.header} id="property-select">
              Property Select <calcite-icon icon="select"></calcite-icon>
            </h2>
            <p>
              Properties can also be selected on the map by drawing a shape on
              the map.
            </p>
            <h3  className={styles.header} id="select-draw">Drawing a Shape</h3>
            <p>Select from the following shape types:</p>
            <ul>
              <li>
                Point <calcite-icon icon="pin"></calcite-icon>
                <ul>
                  <li>Single press a property on the map.</li>
                </ul>
              </li>
              <li>
                Line <calcite-icon icon="line"></calcite-icon>
              </li>
              <ul>
                <li>
                  Single press at each vertex of a line, double tap to complete.
                </li>
              </ul>

              <li>
                Polygon <calcite-icon icon="polygon"></calcite-icon>
              </li>
              <ul>
                <li>
                  Single press at each vertex of the polygon, double tap to
                  complete.
                </li>
              </ul>
              <li>
                Rectangle <calcite-icon icon="rectangle"></calcite-icon>
              </li>
              <ul>
                <li>
                  Press and hold on the map and drag, release to complete.
                </li>
              </ul>
              <li>
                Circle <calcite-icon icon="circle"></calcite-icon>
              </li>
              <ul>
                <li>
                  Press and hold on the map and drag, release to complete.
                </li>
              </ul>
              <li>
                Multi-Point <calcite-icon icon="pins"></calcite-icon>
              </li>
              <ul>
                <li>
                  Single press on multiple properties, double tap to complete.
                </li>
              </ul>
            </ul>
            <h3  className={styles.header} id="select-buffer">Specifying a Buffer</h3>
            <p>
              To apply a buffer distance to the shape, enter a distance in feet
              in the input box, then draw the shape on the map.
            </p>
            <h3  className={styles.header} id="select-buffer">Buffer Selected Property</h3>
            <p>
              If a single property is selected a Buffer Property button will
              display. Specify a buffer distance and press the button.
              Properties within that distance of the property boundary will be
              selected.
            </p>

            <h2 className={styles.header} id="location-search">
              Location Search <calcite-icon icon="pin"></calcite-icon>
            </h2>
            <p>
              The location search tool displays in the top right corner of the
              map. It allows for you to search by an addresses, place name
              (park, subdivision, school or library), or by an intersection.
            </p>
            <p>
              Start typing in the input box, suggestions will appear as you
              type. Once you see the suggestion you are looking for, press the
              suggestion. The map will then zoom to the selected feature on the
              map.
            </p>
            <calcite-notice open>
              <div slot="message">
                <strong>Note: </strong> this does not select a property, use the
                Property Search panel to do so.
              </div>
            </calcite-notice>
            <p />
            <calcite-notice open>
              <div slot="message">
                <strong>Note: </strong> this tool was previously displayed in
                the panel on the right side of iMAPS. To conserve space, it has
                been moved to the tool section.
              </div>
            </calcite-notice>

            <h3  className={styles.header} id="intersection-search">Intersection Search</h3>
            <p>
              To search for an intersection, select a street name from the
              Intersection category. Once selected, all streets that intersect
              the selected street name will appear in a dropdown list. Selecting
              from the dropdown list will zoom the map to that intersection.
            </p>

            <h2 className={styles.header} id="measure">
              Measure <calcite-icon icon="measure-line"></calcite-icon>
            </h2>
            <p>
              Use the measure tool to measure distances or areas on the map.
            </p>
            <ul>
              <li>
                Distance <calcite-icon icon="measure-line"></calcite-icon>
              </li>
              <ul>
                <li>Start measuring by single pressing on the map. </li>
                <li>
                  As the cursor moves on the map, the distance will change.
                </li>
                <li>Tap on the map against to add a vertex to the line.</li>
                <li>Double tap to complete the measement.</li>
                <li>Press the New Measurement button to measure again.</li>
                <li>
                  Units can be changed in the unit dropdown list. The default is
                  imperial.
                </li>
              </ul>
              <li>
                Area <calcite-icon icon="measure-area"></calcite-icon>
              </li>
              <ul>
                <li>Start measuring by single pressing on the map. </li>
                <li>As the cursor moves on the map, the area will change.</li>
                <li>Tap on the map against to add a vertex to the polygon.</li>
                <li>Double tap to complete the measement.</li>
                <li>Press the New Measurement button to measure again.</li>
                <li>
                  Units can be changed in the unit dropdown list. The default is
                  imperial.
                </li>
              </ul>
              <li>
                Clear <calcite-icon icon="trash"></calcite-icon>
              </li>
              <ul>
                Press the clear button to stop measuring and remove the
                measurement from the map.
              </ul>
            </ul>
            <h2 className={styles.header} id="sketch">
              Sketch <calcite-icon icon="pencil"></calcite-icon>
            </h2>

            <h3  className={styles.header} id="sketch-draw">Sketching on Map</h3>

            <h3  className={styles.header} id="sketch-delete">Deleting a Sketch</h3>

            <h3  className={styles.header} id="sketch-clear">Clearing all sketches</h3>

            <h2 className={styles.header} id="print">
              Print <calcite-icon icon="print"></calcite-icon>
            </h2>
            <p>The map can be exported as a PDF or another image format.</p>
            <h3  className={styles.header} id="print-layout">Layout Tab</h3>
            <p>
              The layout tab is where you can define layout of the outputted
              file. Enter a title to include a title on the exported map, choose
              from different layouts and specify the file type.
            </p>
            <h4 className={styles.header} id="print-scale">Print Scale</h4>
            <p>
              By default, the current scale of the map is used. A custom scale
              can be selected by selecting the Custom Scale radio button. A list
              of standard scales are listed in a drop down. Select the user
              defined option to enter a scale in an input box in 1 inch equals
              feet format.
            </p>
            <h4 className={styles.header} id="print-attributes">Show Attributes</h4>
            <p>
              If a single property is selected, an option to show attributes is
              displayed. Enabling this will display the attributes for the
              selected property next to the map.
            </p>

            <h4 className={styles.header} id="print-legend">Show Legend</h4>
            <p>
              A legend can be included on the exported map by enabling the Show
              Legend option.
            </p>
            <calcite-notice open>
              <div slot="message">
                <strong>Note: </strong>
                not all visible layers may appear in the legend due to space
                constraints.
              </div>
            </calcite-notice>
            <h4 className={styles.header} id="print-area">Show Print Area</h4>
            <p>
              Displays the viewport of the export on the map. The viewport
              adjusted based on the scale and layout selected.
            </p>
            <calcite-notice open>
              <div slot="message">
                <strong>Note: </strong> this works best when a custom scale is
                specified, as the viewport may exceed the current map extent.
              </div>
            </calcite-notice>
            <h3  className={styles.header} id="print-exports">Exports Tab</h3>
            <p>
              After you press the Export Map button, you will be taken to the
              Exports tab. Here you can see the status of the print job and also
              view a list of your previous print jobs.
            </p>
            <calcite-notice open>
              <div slot="message">
                <strong>Note: </strong> only print jobs from your current
                session will be listed. The print jobs will be available to
                redownload for a limited amount of time.
              </div>
            </calcite-notice>
          </div>
        </calcite-panel>
      </calcite-shell>
    </calcite-dialog>
  );
}
