/*
CM3070 Computer Science Final Project Track My Impact: Data Driven Waste Management
BSc Computer Science, Goldsmiths, University of London
CM3070 Final Project in Data Science (CM3050)
with Extended Features in Machine Learning and Neural Networks (CM3015) and Databases and Advanced Data Techniques (CM3010)
by
Zinhle Maurice-Mopp (210125870)
zm140@student.london.ac.uk

useTrackMyImpactData.tsx: Hook that hydrates client-side components with public JSON datasets.
*/
// React hook for accessing Track My Impact data via public/data JSON
import { useState, useEffect } from 'react'

export function useTrackMyImpactData() {
  const [data, setData] = useState({
    warmFactors: [] as any[],
    domesticMaterials: [] as any[],
    petcoLocations: [] as any[],
    equivalencyFactors: [] as any[],
    countryContext: [] as any[],
    isLoading: true,
    error: null as string | null,
  })

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const [warmRes, domRes, petcoRes, eqRes, ctxRes] = await Promise.all([
          fetch('/data/warm-factors.json'),
          fetch('/data/domestic-materials.json'),
          fetch('/data/petco-locations.json'),
          fetch('/data/equivalency-factors.json'),
          fetch('/data/country-context.json'),
        ])
        if (!warmRes.ok || !domRes.ok || !petcoRes.ok || !eqRes.ok || !ctxRes.ok) {
          throw new Error('Failed to load one or more data files')
        }
        const [warmFactors, domesticMaterials, petcoLocations, equivalencyFactors, countryContext] = await Promise.all([
          warmRes.json(),
          domRes.json(),
          petcoRes.json(),
          eqRes.json(),
          ctxRes.json(),
        ])
        if (!cancelled) {
          setData({
            warmFactors,
            domesticMaterials,
            petcoLocations,
            equivalencyFactors,
            countryContext,
            isLoading: false,
            error: null,
          })
        }
      } catch (error) {
        if (!cancelled) {
          setData((prev) => ({
            ...prev,
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to load data',
          }))
        }
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  return data
}

// Helper functions aligned to JSON keys
export function findWarmFactor(materialCategory: string, warmFactors: any[]): any | undefined {
  return warmFactors.find((row: any) => row.warm_category?.toLowerCase() === materialCategory.toLowerCase())
}

export function findDomesticMaterial(cnnClassName: string, domesticMaterials: any[]): any | undefined {
  return domesticMaterials.find((row: any) => row.cnn_class_name?.toLowerCase() === cnnClassName.toLowerCase())
}

export function getNearbyPetcoLocations(
  latitude: number,
  longitude: number,
  petcoLocations: any[],
  maxDistance: number = 10,
): any[] {
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLon = ((lon2 - lon1) * Math.PI) / 180
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  return petcoLocations
    .map((location) => ({
      ...location,
      distance: calculateDistance(latitude, longitude, (location as any).latitude, (location as any).longitude),
    }))
    .filter((location: any) => location.distance <= maxDistance)
    .sort((a: any, b: any) => a.distance - b.distance)
}
