'use client'

import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import Supercluster from 'supercluster'
import 'mapbox-gl/dist/mapbox-gl.css'
import { EventPublicDTO } from '@/types'
import { formatEventDate } from '@/utils/format'

interface MapViewProps {
  events: EventPublicDTO[]
}

export default function MapView({ events }: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const [mapError, setMapError] = useState<string | null>(null)
  const markersRef = useRef<mapboxgl.Marker[]>([])

  useEffect(() => {
    if (!mapContainer.current) return
    if (map.current) return // Initialize map only once

    const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN

    if (!mapboxToken) {
      setMapError('Token Mapbox non configuré')
      return
    }

    mapboxgl.accessToken = mapboxToken

    try {
      // Initialize map
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [2.3522, 48.8566], // Paris by default
        zoom: 5,
      })

      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right')
      map.current.addControl(new mapboxgl.FullscreenControl(), 'top-right')

      map.current.on('load', () => {
        if (map.current) {
          updateMarkers()
        }
      })

      map.current.on('move', () => {
        updateMarkers()
      })

      map.current.on('zoom', () => {
        updateMarkers()
      })
    } catch (error) {
      console.error('Error initializing map:', error)
      setMapError('Erreur lors de l\'initialisation de la carte')
    }

    return () => {
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [])

  const updateMarkers = () => {
    if (!map.current) return

    // Filter events with coordinates
    const eventsWithCoords = events.filter((event) => event.lat && event.lng)

    if (eventsWithCoords.length === 0) return

    // Prepare GeoJSON features
    const points: GeoJSON.Feature<GeoJSON.Point>[] = eventsWithCoords.map((event) => ({
      type: 'Feature',
      properties: {
        cluster: false,
        eventId: event.id,
        title: event.title,
        slug: event.slug,
        startAt: event.startAt,
        city: event.city,
        venue: event.venue?.name,
        imageUrl: event.imageUrl,
      },
      geometry: {
        type: 'Point',
        coordinates: [event.lng!, event.lat!],
      },
    }))

    // Initialize supercluster
    const cluster = new Supercluster({
      radius: 60,
      maxZoom: 16,
    })

    cluster.load(points)

    const zoom = Math.round(map.current.getZoom())
    const bounds = map.current.getBounds()
    const bbox: [number, number, number, number] = [
      bounds.getWest(),
      bounds.getSouth(),
      bounds.getEast(),
      bounds.getNorth(),
    ]

    const clusters = cluster.getClusters(bbox, zoom)

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove())
    markersRef.current = []

    // Add new markers
    clusters.forEach((cluster) => {
      const [lng, lat] = cluster.geometry.coordinates
      const { cluster: isCluster, point_count } = cluster.properties as any

      if (isCluster) {
        // Cluster marker
        const el = document.createElement('div')
        el.className = 'cluster-marker'
        el.innerHTML = `<div class="cluster-content">${point_count}</div>`
        el.style.cssText = `
          width: ${30 + (point_count / points.length) * 20}px;
          height: ${30 + (point_count / points.length) * 20}px;
          background-color: #3b82f6;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: transform 0.2s;
        `
        el.querySelector('.cluster-content')!.setAttribute(
          'style',
          'color: white; font-weight: bold; font-size: 14px;'
        )

        el.addEventListener('mouseenter', () => {
          el.style.transform = 'scale(1.2)'
        })
        el.addEventListener('mouseleave', () => {
          el.style.transform = 'scale(1)'
        })

        const marker = new mapboxgl.Marker(el)
          .setLngLat([lng, lat])
          .addTo(map.current!)

        el.addEventListener('click', () => {
          if (map.current) {
            map.current.easeTo({
              center: [lng, lat],
              zoom: zoom + 2,
            })
          }
        })

        markersRef.current.push(marker)
      } else {
        // Individual event marker
        const event = cluster.properties as any
        const el = document.createElement('div')
        el.className = 'event-marker'
        el.innerHTML = '📍'
        el.style.cssText = `
          font-size: 24px;
          cursor: pointer;
          transition: transform 0.2s;
        `

        el.addEventListener('mouseenter', () => {
          el.style.transform = 'scale(1.3)'
        })
        el.addEventListener('mouseleave', () => {
          el.style.transform = 'scale(1)'
        })

        const marker = new mapboxgl.Marker(el)
          .setLngLat([lng, lat])
          .addTo(map.current!)

        // Create popup
        const popupContent = `
          <div class="mapbox-popup-content" style="min-width: 200px;">
            ${
              event.imageUrl
                ? `<img src="${event.imageUrl}" alt="${event.title}" style="width: 100%; height: 120px; object-fit: cover; border-radius: 8px 8px 0 0; margin: -10px -10px 10px -10px;" />`
                : ''
            }
            <h3 style="font-size: 16px; font-weight: 600; margin: 0 0 8px 0; color: #1f2937;">${
              event.title
            }</h3>
            <p style="font-size: 13px; color: #6b7280; margin: 4px 0;">
              📅 ${formatEventDate(event.startAt)}
            </p>
            ${
              event.venue
                ? `<p style="font-size: 13px; color: #6b7280; margin: 4px 0;">📍 ${event.venue}</p>`
                : ''
            }
            ${
              event.city
                ? `<p style="font-size: 13px; color: #6b7280; margin: 4px 0;">${event.city}</p>`
                : ''
            }
            <a href="/evenement/${
              event.slug
            }" style="display: inline-block; margin-top: 12px; padding: 8px 16px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 6px; font-size: 13px; font-weight: 600;">
              Voir l'événement
            </a>
          </div>
        `

        const popup = new mapboxgl.Popup({
          offset: 25,
          closeButton: true,
          closeOnClick: true,
          maxWidth: '300px',
        }).setHTML(popupContent)

        marker.setPopup(popup)

        markersRef.current.push(marker)
      }
    })

    // Fit map to show all events if first load
    if (markersRef.current.length > 0 && zoom === 5) {
      const bounds = new mapboxgl.LngLatBounds()
      eventsWithCoords.forEach((event) => {
        bounds.extend([event.lng!, event.lat!])
      })
      map.current.fitBounds(bounds, { padding: 50 })
    }
  }

  useEffect(() => {
    if (map.current && map.current.loaded()) {
      updateMarkers()
    }
  }, [events])

  if (mapError) {
    return (
      <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-8 text-center">
        <div className="mb-4">
          <svg
            className="w-16 h-16 mx-auto text-yellow-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Carte non disponible</h2>
        <p className="text-gray-700 mb-6">{mapError}</p>
        <div className="bg-white rounded-lg p-6 max-w-2xl mx-auto text-left">
          <p className="text-sm font-medium text-gray-900 mb-2">Configuration requise :</p>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
            <li>
              Créer un compte sur{' '}
              <a
                href="https://www.mapbox.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                mapbox.com
              </a>
            </li>
            <li>Créer un token avec les scopes : styles:read, fonts:read</li>
            <li>
              Ajouter <code className="bg-gray-100 px-2 py-1 rounded">NEXT_PUBLIC_MAPBOX_TOKEN</code>{' '}
              dans .env.local
            </li>
            <li>Redémarrer le serveur : npm run dev</li>
          </ol>
        </div>
        <a
          href="/"
          className="inline-block mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Voir la liste des événements
        </a>
      </div>
    )
  }

  return (
    <div className="relative">
      <div
        ref={mapContainer}
        className="w-full h-[600px] rounded-2xl overflow-hidden shadow-2xl"
        role="application"
        aria-label="Carte interactive des événements"
      />
      <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-800">
          <strong>💡 Astuce :</strong> Cliquez sur les groupes de marqueurs pour zoomer. Cliquez sur
          un marqueur individuel pour voir les détails de l&apos;événement.
        </p>
      </div>
    </div>
  )
}
