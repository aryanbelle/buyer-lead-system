"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface Buyer {
  id: string
  fullName: string
  email?: string | null
  phone: string
  city: string
  propertyType: string
  bhk?: string | null
  purpose: string
  budgetMin?: number | null
  budgetMax?: number | null
  timeline: string
  source: string
  status: string
  notes?: string | null
  tags: string[]
  ownerId: string
  updatedAt: Date
}

interface Props {
  buyers: Buyer[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  currentFilters: {
    search?: string
    city?: string
    status?: string
  }
}

export function SimpleBuyersList({ buyers, pagination, currentFilters }: Props) {
  const router = useRouter()
  const [search, setSearch] = useState(currentFilters.search || "")
  const [city, setCity] = useState(currentFilters.city || "")
  const [status, setStatus] = useState(currentFilters.status || "")

  const handleFilter = () => {
    const params = new URLSearchParams()
    if (search) params.set("search", search)
    if (city) params.set("city", city)
    if (status) params.set("status", status)
    params.set("page", "1")
    
    const url = params.toString() ? `/buyers?${params.toString()}` : "/buyers"
    router.push(url)
  }

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams()
    if (currentFilters.search) params.set("search", currentFilters.search)
    if (currentFilters.city) params.set("city", currentFilters.city)
    if (currentFilters.status) params.set("status", currentFilters.status)
    params.set("page", newPage.toString())
    
    router.push(`/buyers?${params.toString()}`)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Buyer Leads ({pagination.total})</h2>
        <Link 
          href="/buyers/new"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add New Buyer
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Search</label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Name, email, or phone"
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">City</label>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
            >
              <option value="">All Cities</option>
              <option value="Chandigarh">Chandigarh</option>
              <option value="Mohali">Mohali</option>
              <option value="Zirakpur">Zirakpur</option>
              <option value="Panchkula">Panchkula</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
            >
              <option value="">All Status</option>
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="Qualified">Qualified</option>
              <option value="Visited">Visited</option>
              <option value="Negotiation">Negotiation</option>
              <option value="Converted">Converted</option>
              <option value="Dropped">Dropped</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={handleFilter}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Filter
            </button>
            <button
              onClick={() => router.push("/buyers")}
              className="ml-2 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      {buyers.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No buyers found</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Property</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Budget</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {buyers.map((buyer) => (
                <tr key={buyer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium">{buyer.fullName}</div>
                      <div className="text-sm text-gray-500">{buyer.city}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm">{buyer.phone}</div>
                      {buyer.email && <div className="text-sm text-gray-500">{buyer.email}</div>}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm">{buyer.propertyType}</div>
                      <div className="text-sm text-gray-500">
                        {buyer.bhk ? `${buyer.bhk} BHK` : "N/A"} • {buyer.purpose}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      {buyer.budgetMin && buyer.budgetMax 
                        ? `${formatCurrency(buyer.budgetMin)} - ${formatCurrency(buyer.budgetMax)}`
                        : buyer.budgetMin 
                          ? `${formatCurrency(buyer.budgetMin)}+`
                          : buyer.budgetMax
                            ? `Up to ${formatCurrency(buyer.budgetMax)}`
                            : "Not specified"
                      }
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      buyer.status === 'New' ? 'bg-blue-100 text-blue-800' :
                      buyer.status === 'Contacted' ? 'bg-yellow-100 text-yellow-800' :
                      buyer.status === 'Qualified' ? 'bg-green-100 text-green-800' :
                      buyer.status === 'Converted' ? 'bg-purple-100 text-purple-800' :
                      buyer.status === 'Dropped' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {buyer.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <Link 
                      href={`/buyers/${buyer.id}`}
                      className="text-blue-500 hover:text-blue-700 text-sm"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-700">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
              const pageNum = i + 1
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`px-3 py-1 border rounded ${
                    pageNum === pagination.page 
                      ? 'bg-blue-500 text-white' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  {pageNum}
                </button>
              )
            })}
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
