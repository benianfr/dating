'use client'

import { useState } from 'react'

interface FilterPanelProps {
  isOpen: boolean
  onClose: () => void
  onApplyFilters: (filters: FilterState) => void
  currentFilters: FilterState
}

export interface FilterState {
  ageMin: number
  ageMax: number
  distance: number
  objective?: 'serious' | 'marriage'
  faithImportance?: 'very_important' | 'important' | 'moderate' | 'low'
  wantsChildren?: boolean
}

const defaultFilters: FilterState = {
  ageMin: 18,
  ageMax: 100,
  distance: 100,
  objective: undefined,
  faithImportance: undefined,
  wantsChildren: undefined
}

export default function FilterPanel({ isOpen, onClose, onApplyFilters, currentFilters }: FilterPanelProps) {
  const [filters, setFilters] = useState<FilterState>(currentFilters)

  const handleApply = () => {
    onApplyFilters(filters)
    onClose()
  }

  const handleReset = () => {
    setFilters(defaultFilters)
  }

  if (!isOpen) return null

  return (
    <div className="filter-panel-overlay" onClick={onClose}>
      <div className="filter-panel" onClick={(e) => e.stopPropagation()}>
        <div className="filter-panel-header">
          <h2>Filtres de recherche</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="filter-panel-content">
          <div className="filter-group">
            <label>Âge</label>
            <div className="age-range">
              <div className="age-input">
                <span>Min</span>
                <input
                  type="number"
                  min="18"
                  max="100"
                  value={filters.ageMin}
                  onChange={(e) => setFilters({ ...filters, ageMin: parseInt(e.target.value) || 18 })}
                />
              </div>
              <div className="age-input">
                <span>Max</span>
                <input
                  type="number"
                  min="18"
                  max="100"
                  value={filters.ageMax}
                  onChange={(e) => setFilters({ ...filters, ageMax: parseInt(e.target.value) || 100 })}
                />
              </div>
            </div>
          </div>

          <div className="filter-group">
            <label>Distance maximale (km)</label>
            <input
              type="range"
              min="1"
              max="100"
              value={filters.distance}
              onChange={(e) => setFilters({ ...filters, distance: parseInt(e.target.value) })}
              className="range-slider"
            />
            <span className="range-value">{filters.distance} km</span>
          </div>

          <div className="filter-group">
            <label>Objectif</label>
            <div className="radio-group">
              <label className="radio-label">
                <input
                  type="radio"
                  name="objective"
                  value="serious"
                  checked={filters.objective === 'serious'}
                  onChange={() => setFilters({ ...filters, objective: 'serious' })}
                />
                <span>Relation sérieuse</span>
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="objective"
                  value="marriage"
                  checked={filters.objective === 'marriage'}
                  onChange={() => setFilters({ ...filters, objective: 'marriage' })}
                />
                <span>Mariage</span>
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="objective"
                  value=""
                  checked={filters.objective === undefined}
                  onChange={() => setFilters({ ...filters, objective: undefined })}
                />
                <span>Tous</span>
              </label>
            </div>
          </div>

          <div className="filter-group">
            <label>Importance de la foi</label>
            <div className="radio-group">
              <label className="radio-label">
                <input
                  type="radio"
                  name="faith"
                  value="very_important"
                  checked={filters.faithImportance === 'very_important'}
                  onChange={() => setFilters({ ...filters, faithImportance: 'very_important' })}
                />
                <span>Très importante</span>
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="faith"
                  value="important"
                  checked={filters.faithImportance === 'important'}
                  onChange={() => setFilters({ ...filters, faithImportance: 'important' })}
                />
                <span>Importante</span>
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="faith"
                  value="moderate"
                  checked={filters.faithImportance === 'moderate'}
                  onChange={() => setFilters({ ...filters, faithImportance: 'moderate' })}
                />
                <span>Moyenne</span>
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="faith"
                  value=""
                  checked={filters.faithImportance === undefined}
                  onChange={() => setFilters({ ...filters, faithImportance: undefined })}
                />
                <span>Tous</span>
              </label>
            </div>
          </div>

          <div className="filter-group">
            <label>Enfants</label>
            <div className="radio-group">
              <label className="radio-label">
                <input
                  type="radio"
                  name="children"
                  value="yes"
                  checked={filters.wantsChildren === true}
                  onChange={() => setFilters({ ...filters, wantsChildren: true })}
                />
                <span>Veut des enfants</span>
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="children"
                  value="no"
                  checked={filters.wantsChildren === false}
                  onChange={() => setFilters({ ...filters, wantsChildren: false })}
                />
                <span>Ne veut pas d'enfants</span>
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="children"
                  value=""
                  checked={filters.wantsChildren === undefined}
                  onChange={() => setFilters({ ...filters, wantsChildren: undefined })}
                />
                <span>Tous</span>
              </label>
            </div>
          </div>
        </div>

        <div className="filter-panel-footer">
          <button className="btn-secondary" onClick={handleReset}>
            Réinitialiser
          </button>
          <button className="btn-primary" onClick={handleApply}>
            Appliquer les filtres
          </button>
        </div>
      </div>
    </div>
  )
}