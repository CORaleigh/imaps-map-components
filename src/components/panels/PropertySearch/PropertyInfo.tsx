// PropertyInfo.tsx

import "@arcgis/map-components/components/arcgis-feature";
import React, { useEffect, useRef, type RefObject } from "react";


import styles from "./PropertySearch.module.css";
import NextPropertyButton from "./NextPropertyButton";
import Services from "./Services";

import type Graphic from "@arcgis/core/Graphic";


interface PropertyInfoProps {
  feature: Graphic;
  condos: Graphic[];
  mapElement: RefObject<HTMLArcgisMapElement>;
  tableElement: RefObject<HTMLArcgisFeatureTableElement>;
  title: string;
  onNextProperty: (feature: Graphic) => void;
}

const PropertyInfo: React.FC<PropertyInfoProps> = ({
  feature,
  condos,
  mapElement,
  tableElement,
  title,
  onNextProperty,
}) => {
  const titleElement = useRef<HTMLHeadingElement>(null);

  // move focus to the property title when a new property is shown, so screen readers announce it
  // and keyboard users continue from the details (focus was otherwise lost to <body>)
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      if (titleElement.current?.checkVisibility()) {
        titleElement.current.focus();
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [feature, title]);

  return (
    <>
      <div className={styles.featureHeader}>
        {condos.length > 1 && (
          <NextPropertyButton
            mapElement={mapElement}
            tableElement={tableElement}
            icon="caret-left"
            text="Previous"
            onNextProperty={onNextProperty}
          ></NextPropertyButton>
        )}
        <h2 className={styles.featureTitle} ref={titleElement} tabIndex={-1}>{title}</h2>
        {condos.length > 1 && (
          <NextPropertyButton
            mapElement={mapElement}
            tableElement={tableElement}
            icon="caret-right"
            text="Next"
            onNextProperty={onNextProperty}
          ></NextPropertyButton>
        )}
      </div>

      {feature && (
        <arcgis-feature graphic={feature}></arcgis-feature>
      )}
      <div className={styles.featureSubTitle}>
        <h2 className={styles.featureTitle}>Services</h2>
      </div>
      <Services
        mapElement={mapElement.current}
        selectedCondo={feature}
      ></Services>
      <div className={styles.featureSubTitle}>
        <h2 className={styles.featureTitle}>Addresses</h2>
      </div>
    </>
  );
};

export default React.memo(
  PropertyInfo,
  (prev, next) => prev.feature === next.feature && prev.title === next.title
);
