// PropertySearch.tsx
import "@esri/calcite-components/components/calcite-panel";
import "@esri/calcite-components/components/calcite-tabs";
import "@esri/calcite-components/components/calcite-tab";
import "@esri/calcite-components/components/calcite-tab-nav";
import "@esri/calcite-components/components/calcite-tab-title";
import "@esri/calcite-components/components/calcite-popover";
import "@esri/calcite-components/components/calcite-tooltip";

import "@arcgis/map-components/components/arcgis-search";
import "@arcgis/map-components/components/arcgis-feature";
import "@arcgis/map-components/components/arcgis-feature-table";
import { usePropertySearch } from "./usePropertySearch";
import React from "react";
import Services from "./Services/Services";
import { getSearchHistory } from "./search";
import NextPropertyButton from "./NextPropertyButton/NextPropertyButton";

interface PropertySearchProps {
  mapElement: React.RefObject<HTMLArcgisMapElement>;
  closed: boolean;
  onPanelClose: () => void;
}

const PropertySearch: React.FC<PropertySearchProps> = ({
  mapElement,
  closed,
  onPanelClose,
}) => {
  const {
    tableElement,
    addressTableElement,
    searchElement,
    siteAddressRef,
    selectedTab,
    selectedCondo,
    webMapId,
    condos,
    handleSearchReady,
    handleSearchComplete,
    handleTableReady,
    handleTableCellClick,
    handleTabChange,
    handleAddressTableReady,
    handleAddressTableChange,
    handleAddressCellClick,
    handleClearClick,
    handleHistoryClick,
    handleExport,
    handleExportAddresses,
    handleSuggestStart,
    handleNextPropertySelected,
    handleTabClick
  } = usePropertySearch(mapElement);

  return (
    <>
    <calcite-panel
      heading="Property Search"
      closable
      oncalcitePanelClose={() => onPanelClose()}
      closed={closed}
      id="property-search"
    >
    
      <div slot="content-top" className="search-top">
        <arcgis-search
          ref={searchElement}
          referenceElement={mapElement.current}
          includeDefaultSourcesDisabled
          locationDisabled
          onarcgisReady={handleSearchReady}
          onarcgisSearchComplete={handleSearchComplete}
          onarcgisSuggestStart={handleSuggestStart}
          popupDisabled
          allPlaceholder="Address, owner, PIN or REID"
        ></arcgis-search>
        <calcite-action
          id="history-popover-button"
          icon="clock"
          text="History"
          scale="s"
        ></calcite-action>
        <calcite-tooltip closeOnClick referenceElement="history-popover-button">
          Search History
        </calcite-tooltip>
        <calcite-action
          id="search-clear-button"
          icon="trash"
          text="Clear"
          scale="s"
          onClick={handleClearClick}
        ></calcite-action>
        <calcite-tooltip closeOnClick referenceElement="search-clear-button">
          Clear search
        </calcite-tooltip>

        <calcite-popover
          heading="Search History"
          scale="s"
          label="Search History"
          referenceElement="history-popover-button"
          closable
        >
          <calcite-list label={"search history list"}>
            {getSearchHistory(webMapId.current).map((term, i) => (
              <calcite-list-item
                key={`history_${i}`}
                label={term}
                onClick={handleHistoryClick}
              >
                <calcite-action
                  slot="actions-end"
                  text="Search"
                  icon="search"
                  scale="s"
                ></calcite-action>
              </calcite-list-item>
            ))}
          </calcite-list>
        </calcite-popover>
      </div>

      <calcite-tabs
        position="bottom"
        scale="l"
        layout="center"
      >
        <calcite-tab-nav
          slot="title-group"
          oncalciteTabChange={handleTabChange}
     
          
        >
          <calcite-tab-title label="list" selected={selectedTab === "list"} onClick={handleTabClick}>
            List
          </calcite-tab-title>
          <calcite-tab-title
            disabled={!selectedCondo}
            label="info"
            selected={selectedTab === "info"}
          >
            Info
          </calcite-tab-title>
        </calcite-tab-nav>

        <calcite-tab selected={selectedTab === "list"}>
          <arcgis-feature-table
            ref={tableElement}
            referenceElement={mapElement.current}
            onarcgisReady={handleTableReady}
            hideMenuItemsRefreshData
            hideSelectionColumn
            onarcgisCellClick={handleTableCellClick}
            noDataMessage={"No properties selected"}
            menuConfig={{
              items: [
                {
                  label: "Export CSV",
                  icon: "export",
                  clickFunction: handleExport,
                },
              ],
            }}
          ></arcgis-feature-table>
        </calcite-tab>

        <calcite-tab selected={selectedTab === "info"}>
          
          {selectedCondo && (
            <>
            
              <div className="feature-header">
                {condos.length > 1 && (
                  <NextPropertyButton
                    mapElement={mapElement}
                    tableElement={tableElement}
                    icon="caret-left"
                    text="Previous"
                    onNextProperty={handleNextPropertySelected}
                  ></NextPropertyButton>
                )}
                <h2 className="feature-title">
                  {siteAddressRef.current}
                </h2>
                {condos.length > 1 && (
                  <NextPropertyButton
                    mapElement={mapElement}
                    tableElement={tableElement}
                    icon="caret-right"
                    text="Next"
                    onNextProperty={handleNextPropertySelected}
                  ></NextPropertyButton>
                )}
              </div>

              <arcgis-feature graphic={selectedCondo}></arcgis-feature>
              <div className="feature-sub-title">
                <h2 className="feature-title">Services</h2>
              </div>
              <Services
                mapElement={mapElement.current}
                selectedCondo={selectedCondo}
              ></Services>
              <div className="feature-sub-title">
                <h2 className="feature-title">Addresses</h2>
              </div>

              <arcgis-feature-table
                ref={addressTableElement}
                filterGeometry={selectedCondo.geometry}
                referenceElement={mapElement.current}
                onarcgisReady={handleAddressTableReady}
                onarcgisPropertyChange={handleAddressTableChange}
                hideSelectionColumn
                onarcgisCellClick={handleAddressCellClick}
                noDataMessage={"No addresses found"}
                hideMenuItemsRefreshData
                hideMenuItemsToggleColumns
                style={{ marginBottom: "1em" }}
                menuConfig={{
                  items: [
                    {
                      label: "Export CSV",
                      icon: "export",
                      clickFunction: handleExportAddresses,
                    },
                  ],
                }}
              ></arcgis-feature-table>
            </>
          )}
        </calcite-tab>
      </calcite-tabs>
    </calcite-panel></>
  );
};

export default React.memo(
  PropertySearch,
  (prev, next) => 
    prev.mapElement === next.mapElement && 
    prev.closed === next.closed &&
    prev.onPanelClose === next.onPanelClose
);
