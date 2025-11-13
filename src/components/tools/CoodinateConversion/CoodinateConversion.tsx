import React from "react";
import "@esri/calcite-components/components/calcite-block";
import "@esri/calcite-components/components/calcite-input-text";
import "@esri/calcite-components/components/calcite-action";
import "@esri/calcite-components/components/calcite-select";
import "@esri/calcite-components/components/calcite-option";
import "@esri/calcite-components/components/calcite-tooltip";

import { useCoordinateConversion } from "./useCoordinateConversion";
interface CoodinateConversionProps {
  mapElement: React.RefObject<HTMLArcgisMapElement>;
  isOpen: boolean;
}

const CoodinateConversion: React.FC<CoodinateConversionProps> = ({
  mapElement,
  isOpen,
}) => {
  const {
    display,
    expanded,
    showSearch,
    showSettings,
    mode,
    formats,
    selectedFormat,
    validity,
    inputRef,
    handleShowSearch,
    handleChangeMode,
    handleShowSettings,
    handleFormatChange,
    handleSearchInput,
    handleSearchClick,
    handleCopyToClipboard,
  } = useCoordinateConversion(mapElement, isOpen);
  return (
    <>
      <calcite-block
        id="coord-conversion"
        heading={display}
        collapsible
        expanded={expanded}
        oncalciteBlockBeforeOpen={(event) => {
          event.stopImmediatePropagation();
          event.stopPropagation();
        }}
      >
        <calcite-action
          id="coordinate-search-action"
          slot="control"
          text="search"
          icon="search"
          onClick={handleShowSearch}
          active={showSearch}
          scale="s"
        ></calcite-action>

        <calcite-action
          id="coordinate-settings-action"
          slot="control"
          text="settings"
          icon="gear"
          active={showSettings}
          onClick={handleShowSettings}
          scale="s"
        ></calcite-action>
        <calcite-action
          id="coordinate-mode-action"
          slot="control"
          text="click"
          icon="pin"
          onClick={handleChangeMode}
          scale="s"
          active={mode === "click"}
        ></calcite-action>
        <calcite-action
          id="coordinate-copy-action"
          slot="control"
          text="copy to clipboard"
          icon="copy-to-clipboard"
          onClick={handleCopyToClipboard}
          scale="s"
        ></calcite-action>

        {showSearch && (
          <div>
            <calcite-label>
              <calcite-input-text
                key={selectedFormat.id}
                ref={inputRef}
                label="search input"
                placeholder={selectedFormat.placeholder}
                pattern={selectedFormat.regex}
                validation-message={validity?.message}
                validation-icon="exclamation-mark-triangle"
                oncalciteInputTextInput={handleSearchInput}
                status={validity?.valid ? "valid" : "invalid"}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    handleSearchClick();
                  }
                }}
              >
                <calcite-action
                  text="search"
                  label="search"
                  icon="search"
                  slot="action"
                  disabled={!validity?.valid}
                  onClick={handleSearchClick}
                ></calcite-action>
              </calcite-input-text>
            </calcite-label>
          </div>
        )}

        {showSettings && (
          <div>
            <calcite-label scale="s">
              Coordinate System
              <calcite-select
                label="coordinate system"
                oncalciteSelectChange={handleFormatChange}
              >
                {formats.map((format) => (
                  <calcite-option key={format.id} value={format}>
                    {format.label}
                  </calcite-option>
                ))}
              </calcite-select>
            </calcite-label>
          </div>
        )}
      </calcite-block>
      <calcite-tooltip referenceElement="coordinate-search-action">
        Search Coordinate
      </calcite-tooltip>
      <calcite-tooltip referenceElement="coordinate-settings-action">
        Settings
      </calcite-tooltip>
      <calcite-tooltip referenceElement="coordinate-mode-action">
        Change Input Mode
      </calcite-tooltip>
      <calcite-tooltip referenceElement="coordinate-copy-action">
        Copy to Clipboard
      </calcite-tooltip>
    </>
  );
};

export default CoodinateConversion;
