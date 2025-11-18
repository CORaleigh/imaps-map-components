import React, { useEffect, useRef } from "react";
import "@esri/calcite-components/components/calcite-panel";
import "@arcgis/map-components/components/arcgis-bookmarks";
import * as reactiveUtils from "@arcgis/core/core/reactiveUtils.js";
import { useMap } from "../../../context/useMap";
import styles from "./Bookmarks.module.css";
import TipManager from "../../TipsManager";

interface BookmarksProps {
  mapElement: React.RefObject<HTMLArcgisMapElement>;
  closed: boolean;
  onPanelClose: () => void;
}

const Bookmarks: React.FC<BookmarksProps> = ({
  mapElement,
  closed,
  onPanelClose,
}) => {
  const initializedRef = useRef(false);
  const { webMapId } = useMap();
  useEffect(() => {
    if (!mapElement.current || initializedRef.current) return;
    initializedRef.current = true;
  }, [mapElement]);

  return (
    <calcite-panel
      heading="Bookmarks"
      closable
      oncalcitePanelClose={() => onPanelClose()}
      closed={closed}
      className={styles.bookmarksPanel}
    >
      <TipManager name="bookmarks"></TipManager>

      <arcgis-bookmarks
        referenceElement={mapElement.current}
        showAddBookmarkButton
        showEditBookmarkButton
        dragEnabled
        defaultEditOptions={{ takeScreenshot: false }}
        onarcgisReady={(event) => {
          const bookmarks = event.target;
          if (!bookmarks) return;
          const flow = event.target.shadowRoot?.querySelector("calcite-flow");
          if (flow) {
            flow.style.height = "calc(100vh - 32px - 50px - 41px)";
          }
          reactiveUtils.watch(
            () =>
              bookmarks.bookmarks.toArray().map((b: __esri.Bookmark) => b.name), // or id
            () => {
              localStorage.setItem(
                `imaps_${webMapId.current}_bookmarks`,
                JSON.stringify(bookmarks.bookmarks.toArray() ?? [])
              );
            }
          );
        }}
      ></arcgis-bookmarks>
    </calcite-panel>
  );
};

export default Bookmarks;
