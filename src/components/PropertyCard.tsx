'use client'

import { MapPin, ExternalLink, IndianRupee } from 'lucide-react'
import Image from 'next/image'

export interface PropertyData {
  name: string
  location: string
  price_range: string
  type: string
  summary: string
  website?: string
  photo?: string
}

export function PropertyCard({ property }: { property: PropertyData }) {
  return (
    <div className="property-card w-72 flex-shrink-0 snap-start">
      {/* Photo */}
      <div className="relative h-36 bg-gradient-to-br from-vira-100 to-vira-200">
        {property.photo ? (
          <Image
            src={property.photo}
            alt={property.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-12 h-12 bg-vira-300/50 rounded-xl flex items-center justify-center mx-auto mb-2">
                <MapPin className="w-6 h-6 text-vira-700" />
              </div>
              <p className="text-xs text-vira-700/60">{property.type}</p>
            </div>
          </div>
        )}
      </div>

      {/* Details */}
      <div className="p-3">
        <h3 className="font-semibold text-sm text-gray-900 truncate">
          {property.name}
        </h3>

        <div className="flex items-center gap-1 mt-1">
          <MapPin className="w-3 h-3 text-gray-400 flex-shrink-0" />
          <p className="text-xs text-gray-500 truncate">{property.location}</p>
        </div>

        <div className="flex items-center gap-1 mt-1.5">
          <IndianRupee className="w-3 h-3 text-vira-600 flex-shrink-0" />
          <p className="text-sm font-medium text-vira-700">
            {property.price_range}
          </p>
        </div>

        <p className="text-xs text-gray-500 mt-2 line-clamp-2">
          {property.summary}
        </p>

        {property.website && (
          <a
            href={property.website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 mt-2 text-xs text-vira-600 hover:text-vira-700 font-medium"
          >
            View Details
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    </div>
  )
}

export function PropertyCardList({ properties }: { properties: PropertyData[] }) {
  return (
    <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 scrollbar-thin -mx-1 px-1">
      {properties.map((property, index) => (
        <PropertyCard key={index} property={property} />
      ))}
    </div>
  )
}
