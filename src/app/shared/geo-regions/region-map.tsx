'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { useTranslation } from 'react-i18next';
import { PiArrowCounterClockwiseBold, PiTrashBold } from 'react-icons/pi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Spinner from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';
import type { GeoPoint } from '@/types/geo-regions';
import { REQUIRED_POINTS } from './geometry';

interface RegionMapProps {
  points: GeoPoint[];
  onChange: (points: GeoPoint[]) => void;
  /** Used to centre the map when no points are drawn yet. */
  countryName?: string | null;
  /** Other active regions in the same country, drawn faded and inert. */
  otherRegions?: GeoPoint[][];
  hasError?: boolean;
  disabled?: boolean;
}

const DEFAULT_CENTER = { lat: 24.7136, lng: 46.6753 };

// Same options as the other map components: @googlemaps/js-api-loader throws
// when the same page loads the API with different options.
const getLoader = () =>
  new Loader({
    apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY as string,
    version: 'weekly',
    libraries: ['places'],
  });

const ACTIVE_COLOR = '#2563eb';
const ERROR_COLOR = '#dc2626';
const OTHER_COLOR = '#94a3b8';

export default function RegionMap({
  points,
  onChange,
  countryName,
  otherRegions = [],
  hasError = false,
  disabled = false,
}: RegionMapProps) {
  const { t } = useTranslation();
  const mapDivRef = useRef<HTMLDivElement | null>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const shapeRef = useRef<google.maps.Polygon | google.maps.Polyline | null>(
    null
  );
  const othersRef = useRef<google.maps.Polygon[]>([]);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);
  const fittedInitialRef = useRef(false);
  const lastCountryRef = useRef<string | null>(null);

  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState(false);

  // Latest props for the long-lived map listeners.
  const pointsRef = useRef(points);
  const onChangeRef = useRef(onChange);
  const disabledRef = useRef(disabled);
  pointsRef.current = points;
  onChangeRef.current = onChange;
  disabledRef.current = disabled;

  // Create the map once.
  useEffect(() => {
    let cancelled = false;
    const loader = getLoader();

    Promise.all([
      loader.importLibrary('maps'),
      loader.importLibrary('places'),
      loader.importLibrary('geocoding'),
    ])
      .then(() => {
        if (cancelled || !mapDivRef.current) return;

        const map = new google.maps.Map(mapDivRef.current, {
          center: DEFAULT_CENTER,
          zoom: 11,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
          clickableIcons: false,
          gestureHandling: 'greedy',
        });
        mapRef.current = map;
        geocoderRef.current = new google.maps.Geocoder();

        map.addListener('click', (e: google.maps.MapMouseEvent) => {
          if (disabledRef.current || !e.latLng) return;
          // The 4th point closes the shape; further clicks are ignored.
          if (pointsRef.current.length >= REQUIRED_POINTS) return;
          onChangeRef.current([
            ...pointsRef.current,
            { lat: e.latLng.lat(), lng: e.latLng.lng() },
          ]);
        });

        if (searchRef.current) {
          const autocomplete = new google.maps.places.Autocomplete(
            searchRef.current,
            { fields: ['geometry'] }
          );
          autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace();
            const viewport = place?.geometry?.viewport;
            if (viewport) map.fitBounds(viewport);
            else if (place?.geometry?.location) {
              map.setCenter(place.geometry.location);
              map.setZoom(15);
            }
          });
        }

        setReady(true);
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      });

    return () => {
      cancelled = true;
      markersRef.current.forEach((m) => m.setMap(null));
      markersRef.current = [];
      shapeRef.current?.setMap(null);
      othersRef.current.forEach((p) => p.setMap(null));
      othersRef.current = [];
      mapRef.current = null;
    };
  }, []);

  // Keep markers + shape in sync with `points`.
  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map) return;

    const color = hasError ? ERROR_COLOR : ACTIVE_COLOR;
    const markers = markersRef.current;

    // Drop surplus markers (undo / clear).
    while (markers.length > points.length) {
      markers.pop()!.setMap(null);
    }

    points.forEach((p, i) => {
      const position = { lat: p.lat, lng: p.lng };
      let marker = markers[i];
      if (!marker) {
        marker = new google.maps.Marker({
          map,
          position,
          label: { text: String(i + 1), color: '#ffffff', fontWeight: '600' },
          draggable: !disabled,
        });
        marker.addListener('drag', (e: google.maps.MapMouseEvent) => {
          if (!e.latLng) return;
          const next = pointsRef.current.map((pt, idx) =>
            idx === i ? { lat: e.latLng!.lat(), lng: e.latLng!.lng() } : pt
          );
          onChangeRef.current(next);
        });
        markers[i] = marker;
      } else {
        const current = marker.getPosition();
        if (
          !current ||
          current.lat() !== position.lat ||
          current.lng() !== position.lng
        ) {
          marker.setPosition(position);
        }
        marker.setDraggable(!disabled);
      }
    });

    shapeRef.current?.setMap(null);
    shapeRef.current = null;
    if (points.length >= 3) {
      shapeRef.current = new google.maps.Polygon({
        map,
        paths: points,
        strokeColor: color,
        strokeOpacity: 0.95,
        strokeWeight: 2,
        fillColor: color,
        fillOpacity: 0.18,
        clickable: false,
      });
    } else if (points.length === 2) {
      shapeRef.current = new google.maps.Polyline({
        map,
        path: points,
        strokeColor: color,
        strokeWeight: 2,
        clickable: false,
      });
    }
  }, [points, ready, hasError, disabled]);

  // Faded neighbours (read-only context for overlaps).
  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map) return;
    othersRef.current.forEach((p) => p.setMap(null));
    othersRef.current = otherRegions
      .filter((path) => path.length >= 3)
      .map(
        (path) =>
          new google.maps.Polygon({
            map,
            paths: path,
            strokeColor: OTHER_COLOR,
            strokeOpacity: 0.6,
            strokeWeight: 1,
            fillColor: OTHER_COLOR,
            fillOpacity: 0.12,
            clickable: false,
            zIndex: 0,
          })
      );
  }, [otherRegions, ready]);

  // Initial fit: existing points (edit) or the selected country (create).
  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map) return;

    if (points.length > 0 && !fittedInitialRef.current) {
      fittedInitialRef.current = true;
      const bounds = new google.maps.LatLngBounds();
      points.forEach((p) => bounds.extend(p));
      map.fitBounds(bounds, 60);
      return;
    }
    fittedInitialRef.current = true;

    if (countryName && lastCountryRef.current !== countryName) {
      lastCountryRef.current = countryName;
      geocoderRef.current?.geocode(
        { address: countryName },
        (results, status) => {
          if (status !== 'OK' || !results?.[0]) return;
          const { viewport, location } = results[0].geometry;
          if (viewport) map.fitBounds(viewport);
          else map.setCenter(location);
        }
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, countryName]);

  const isComplete = points.length === REQUIRED_POINTS;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="min-w-[220px] flex-1">
          <Input
            ref={searchRef}
            type="text"
            placeholder={t('geo_map_search', 'Search for a place or district')}
            disabled={!ready}
          />
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled || points.length === 0}
          onClick={() => onChange(points.slice(0, -1))}
        >
          <PiArrowCounterClockwiseBold className="me-1.5 h-4 w-4" />
          {t('geo_map_undo', 'Undo')}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled || points.length === 0}
          onClick={() => onChange([])}
        >
          <PiTrashBold className="me-1.5 h-4 w-4" />
          {t('geo_map_clear', 'Clear')}
        </Button>
      </div>

      <div
        className={`relative h-[460px] w-full overflow-hidden rounded-lg border bg-gray-50 ${
          hasError ? 'border-red-400' : 'border-gray-200'
        }`}
      >
        <div ref={mapDivRef} className="h-full w-full" dir="ltr" />
        {!ready && !loadError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50/80">
            <Spinner size="lg" />
          </div>
        )}
        {loadError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 p-6 text-center">
            <Text className="text-sm text-red-600">
              {t('geo_map_load_error', 'Could not load Google Maps.')}
            </Text>
          </div>
        )}
      </div>

      <Text className="text-xs text-gray-500">
        {isComplete
          ? t(
              'geo_map_complete_hint',
              'Drag the numbered markers to adjust the region.'
            )
          : t('geo_map_points_hint', {
              defaultValue:
                'Click the map to place point {{next}} of {{total}}. Place the points in order while walking around the area.',
              next: points.length + 1,
              total: REQUIRED_POINTS,
            })}
      </Text>
    </div>
  );
}
