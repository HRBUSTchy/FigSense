import { ALIGNMENT_VALUES, LAYOUT_MODES, NODE_TYPES } from './types.js'

type WeightByDimension = Record<string, number>

const GEOMETRY_DIMENSION_KEYS = [
  'geometry:x',
  'geometry:y',
  'geometry:width',
  'geometry:height',
  'geometry:aspect_ratio'
]

const LAYOUT_DIMENSION_KEYS = [
  ...LAYOUT_MODES.map((mode) => `layout_mode:${mode}`),
  ...ALIGNMENT_VALUES.map((alignment) => `layout_align:${alignment}`),
  'layout:item_spacing',
  'layout:child_horizontal_bias',
  'layout:child_horizontal_flag',
  'layout:child_vertical_flag'
]

const COLOR_DIMENSION_KEYS = [
  'color:has_visible_paint',
  'color:solid_count',
  'color:gradient_count',
  'color:image_count',
  'color:primary_luma',
  'color:primary_luma_area'
]

const STROKE_DIMENSION_KEYS = [
  'stroke:has_visible_paint',
  'stroke:solid_count',
  'stroke:gradient_count',
  'stroke:image_count',
  'stroke:primary_luma',
  'stroke:primary_luma_area'
]

const TEXT_DIMENSION_KEYS = [
  'text:length',
  'text:has_newline',
  'text:has_uppercase',
  'text:has_digit',
  'text:has_cjk',
  'text:word_count',
  'text:unicode_avg',
  'text:unicode_weighted_sum',
  'text:unicode_min',
  'text:unicode_max'
]

const NAME_DIMENSION_KEYS = [
  'name:length',
  'name:starts_with_uppercase',
  'name:has_separator',
  'name:hash'
]

const HIERARCHY_DIMENSION_KEYS = [
  'hierarchy:depth',
  'hierarchy:child_count',
  'hierarchy:visible_child_ratio'
]

const CHILD_SIGNATURE_DIMENSION_KEYS = [
  'child_sig:component_count',
  'child_sig:frame_count',
  'child_sig:instance_count',
  'child_sig:text_count',
  'child_sig:other_count',
  'child_sig:total_visible',
  'child_sig:type_diversity',
  'child_sig:positional_hash'
]

const SUBTREE_STATS_DIMENSION_KEYS = [
  'subtree:min_fill_luma',
  'subtree:max_fill_luma',
  'subtree:luma_range',
  'subtree:stroke_node_count',
  'subtree:non_full_opacity_count',
  'subtree:max_depth',
  'subtree:leaf_count',
  'subtree:visual_entropy'
]

const EFFECT_DIMENSION_KEYS = [
  'effects:shadow_count',
  'effects:blur_count'
]

const STYLE_DIMENSION_KEYS = [
  ...COLOR_DIMENSION_KEYS,
  ...STROKE_DIMENSION_KEYS,
  'stroke_weight',
  'corner_radius',
  ...EFFECT_DIMENSION_KEYS
]

export const EMBEDDING_DIMENSION_KEYS: string[] = [
  ...NODE_TYPES.map((nodeType) => `node_type:${nodeType}`),
  ...GEOMETRY_DIMENSION_KEYS,
  ...LAYOUT_DIMENSION_KEYS,
  ...COLOR_DIMENSION_KEYS,
  ...STROKE_DIMENSION_KEYS,
  'stroke_weight',
  'corner_radius',
  'opacity',
  'visible',
  'locked',
  ...TEXT_DIMENSION_KEYS,
  ...NAME_DIMENSION_KEYS,
  ...HIERARCHY_DIMENSION_KEYS,
  ...CHILD_SIGNATURE_DIMENSION_KEYS,
  ...SUBTREE_STATS_DIMENSION_KEYS,
  'rotation',
  'blend_mode',
  ...EFFECT_DIMENSION_KEYS
]

export const DEFAULT_WEIGHTED_MIN_PARENT_WEIGHT = 0.45
export const DEFAULT_ATTENTION_PARENT_WEIGHT = 0.3
export const DEFAULT_FEATURE_WEIGHT = 1

const WEIGHTED_MIN_PARENT_OVERRIDES: WeightByDimension = {
  'layout_mode:NONE': 0.58,
  'layout_mode:HORIZONTAL': 0.78,
  'layout_mode:VERTICAL': 0.45,
  'layout_mode:GRID': 0.58,
  'layout_align:MIN': 0.42,
  'layout_align:CENTER': 0.5,
  'layout_align:MAX': 0.5,
  'layout_align:SPACE_BETWEEN': 0.56,
  'layout:item_spacing': 0.52,
  'layout:child_horizontal_bias': 0.78,
  'layout:child_horizontal_flag': 0.78,
  'layout:child_vertical_flag': 0.4,
  'geometry:width': 0.3,
  'geometry:height': 0.3,
  'geometry:aspect_ratio': 0.3,
  'hierarchy:child_count': 0.15,
  ...Object.fromEntries(STYLE_DIMENSION_KEYS.map((key) => [key, 0.18])),
  ...Object.fromEntries(CHILD_SIGNATURE_DIMENSION_KEYS.map((key) => [key, 0.1])),
  ...Object.fromEntries(SUBTREE_STATS_DIMENSION_KEYS.map((key) => [key, 0.12]))
}

const ATTENTION_PARENT_OVERRIDES: WeightByDimension = {
  'layout_mode:NONE': 0.5,
  'layout_mode:HORIZONTAL': 0.6,
  'layout_mode:VERTICAL': 0.6,
  'layout_mode:GRID': 0.5,
  'layout:item_spacing': 0.46,
  'layout:child_horizontal_bias': 0.6,
  'layout:child_horizontal_flag': 0.6,
  'layout:child_vertical_flag': 0.56,
  'layout_align:MIN': 0.5,
  'layout_align:CENTER': 0.46,
  'layout_align:MAX': 0.46,
  'layout_align:SPACE_BETWEEN': 0.5
}

const FEATURE_WEIGHT_OVERRIDES: WeightByDimension = {
  ...Object.fromEntries(LAYOUT_DIMENSION_KEYS.map((key) => [key, 0.3])),
  'layout_mode:NONE': 0.2,
  'layout_mode:HORIZONTAL': 0.4,
  'layout_mode:VERTICAL': 0.3,
  'layout_mode:GRID': 0.2,
  'layout_align:MIN': 0.3,
  'layout_align:CENTER': 0.3,
  'layout_align:MAX': 0.3,
  'layout_align:SPACE_BETWEEN': 0.5,
  'layout:item_spacing': 0.3,
  'layout:child_horizontal_bias': 0.2,
  'layout:child_horizontal_flag': 0.2,
  'layout:child_vertical_flag': 0.2,
  'node_type:COMPONENT': 0.3,
  'node_type:INSTANCE': 0.3,
  'geometry:x': 0.01,
  'geometry:y': 0.01,
  'geometry:width': 0.2,
  'geometry:height': 0.2,
  'geometry:aspect_ratio': 0.2,
  'hierarchy:child_count': 1.0,
  'hierarchy:visible_child_ratio': 1.0,
  ...Object.fromEntries(CHILD_SIGNATURE_DIMENSION_KEYS.map((key) => [key, 3.0])),
  ...Object.fromEntries(SUBTREE_STATS_DIMENSION_KEYS.map((key) => [key, 25.0])),
  opacity: 0.3,
  visible: 0.05,
  ...Object.fromEntries(STYLE_DIMENSION_KEYS.map((key) => [key, 0.5])),
  'color:primary_luma': 20.0,
  'color:primary_luma_area': 10.0,
  'stroke:primary_luma': 15.0,
  'stroke:primary_luma_area': 8.0,
  'effects:shadow_count': 1.5,
  'effects:blur_count': 1.5
}

function createWeightByDimension(
  baseWeight: number,
  overrides: WeightByDimension
): WeightByDimension {
  const result: WeightByDimension = {}
  for (const key of EMBEDDING_DIMENSION_KEYS) {
    result[key] = overrides[key] ?? baseWeight
  }
  return result
}

export const WEIGHTED_MIN_PARENT_WEIGHT_BY_DIMENSION = createWeightByDimension(
  DEFAULT_WEIGHTED_MIN_PARENT_WEIGHT,
  WEIGHTED_MIN_PARENT_OVERRIDES
)

export const ATTENTION_PARENT_WEIGHT_BY_DIMENSION = createWeightByDimension(
  DEFAULT_ATTENTION_PARENT_WEIGHT,
  ATTENTION_PARENT_OVERRIDES
)

export const FEATURE_WEIGHT_BY_DIMENSION = createWeightByDimension(
  DEFAULT_FEATURE_WEIGHT,
  FEATURE_WEIGHT_OVERRIDES
)

export const FEATURE_WEIGHTS_IN_ORDER = EMBEDDING_DIMENSION_KEYS.map(
  (key) => FEATURE_WEIGHT_BY_DIMENSION[key] ?? DEFAULT_FEATURE_WEIGHT
)
