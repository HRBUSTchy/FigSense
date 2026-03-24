export interface ComponentTable {
  components: ComponentTableRow[]
  metadata?: {
    name?: string
    description?: string
    version?: string
    createdAt?: number
  }
}

export interface ComponentTableRow {
  componentId: string
  name: string
  type: string
  properties: {
    x?: number
    y?: number
    width?: number
    height?: number
    fills?: Array<{ type: string; color?: { r: number; g: number; b: number; a: number }; opacity?: number; visible?: boolean }>
    strokes?: Array<{ type: string; color?: { r: number; g: number; b: number; a: number }; opacity?: number; visible?: boolean }>
    strokeWeight?: number
    cornerRadius?: number
    opacity?: number
    visible?: boolean
    locked?: boolean
    characters?: string
    fontSize?: number
    rotation?: number
    blendMode?: string
    effects?: Array<{ type: string; visible?: boolean }>
    layoutMode?: string
    primaryAxisAlignItems?: string
    itemSpacing?: number
  }
  children?: ComponentTableRow[]
  depth?: number
  tags?: string[]
  source?: string
}
