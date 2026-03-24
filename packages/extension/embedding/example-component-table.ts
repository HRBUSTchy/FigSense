import type { ComponentTable } from './component-table.js'

import { createStructureEmbedding } from './structure-embedding'

export const exampleComponentTable: ComponentTable = {
  metadata: {
    name: 'UI Components Library',
    description: 'A collection of common UI components for design system',
    version: '1.0.0',
    createdAt: Date.now()
  },
  components: [
    {
      componentId: 'primary-button',
      name: 'PrimaryButton',
      type: 'FRAME',
      properties: {
        width: 200,
        height: 48,
        fills: [{
          type: 'SOLID',
          color: { r: 0, g: 0.5, b: 1, a: 1 },
          opacity: 1,
          visible: true
        }],
        cornerRadius: 8,
        layoutMode: 'HORIZONTAL',
        primaryAxisAlignItems: 'CENTER',
        itemSpacing: 8,
        visible: true,
        locked: false
      },
      children: [
        {
          componentId: 'button-text',
          name: 'ButtonText',
          type: 'TEXT',
          properties: {
            characters: 'Click Me',
            fontSize: 16,
            fills: [{
              type: 'SOLID',
              color: { r: 1, g: 1, b: 1, a: 1 },
              opacity: 1,
              visible: true
            }],
            visible: true
          },
          depth: 1
        }
      ],
      depth: 0,
      tags: ['button', 'primary', 'interactive'],
      source: 'design-system'
    },
    {
      componentId: 'secondary-button',
      name: 'SecondaryButton',
      type: 'FRAME',
      properties: {
        width: 200,
        height: 48,
        fills: [{
          type: 'SOLID',
          color: { r: 0.9, g: 0.9, b: 0.9, a: 1 },
          opacity: 1,
          visible: true
        }],
        cornerRadius: 8,
        layoutMode: 'HORIZONTAL',
        primaryAxisAlignItems: 'CENTER',
        itemSpacing: 8,
        visible: true,
        locked: false
      },
      children: [
        {
          componentId: 'secondary-button-text',
          name: 'ButtonText',
          type: 'TEXT',
          properties: {
            characters: 'Cancel',
            fontSize: 16,
            fills: [{
              type: 'SOLID',
              color: { r: 0.2, g: 0.2, b: 0.2, a: 1 },
              opacity: 1,
              visible: true
            }],
            visible: true
          },
          depth: 1
        }
      ],
      depth: 0,
      tags: ['button', 'secondary', 'interactive'],
      source: 'design-system'
    },
    {
      componentId: 'input-field',
      name: 'InputField',
      type: 'FRAME',
      properties: {
        width: 320,
        height: 48,
        fills: [{
          type: 'SOLID',
          color: { r: 1, g: 1, b: 1, a: 1 },
          opacity: 1,
          visible: true
        }],
        strokes: [{
          type: 'SOLID',
          color: { r: 0.8, g: 0.8, b: 0.8, a: 1 },
          opacity: 1,
          visible: true
        }],
        strokeWeight: 1,
        cornerRadius: 4,
        layoutMode: 'HORIZONTAL',
        primaryAxisAlignItems: 'MIN',
        itemSpacing: 12,
        visible: true,
        locked: false
      },
      children: [
        {
          componentId: 'input-placeholder',
          name: 'Placeholder',
          type: 'TEXT',
          properties: {
            characters: 'Enter your text...',
            fontSize: 14,
            fills: [{
              type: 'SOLID',
              color: { r: 0.6, g: 0.6, b: 0.6, a: 1 },
              opacity: 1,
              visible: true
            }],
            visible: true
          },
          depth: 1
        }
      ],
      depth: 0,
      tags: ['input', 'form', 'text'],
      source: 'design-system'
    },
    {
      componentId: 'card',
      name: 'Card',
      type: 'FRAME',
      properties: {
        width: 400,
        height: 300,
        fills: [{
          type: 'SOLID',
          color: { r: 1, g: 1, b: 1, a: 1 },
          opacity: 1,
          visible: true
        }],
        strokes: [{
          type: 'SOLID',
          color: { r: 0.9, g: 0.9, b: 0.9, a: 1 },
          opacity: 1,
          visible: true
        }],
        strokeWeight: 1,
        cornerRadius: 12,
        layoutMode: 'VERTICAL',
        primaryAxisAlignItems: 'MIN',
        itemSpacing: 16,
        visible: true,
        locked: false,
        effects: [
          {
            type: 'DROP_SHADOW',
            visible: true
          }
        ]
      },
      children: [
        {
          componentId: 'card-image',
          name: 'CardImage',
          type: 'RECTANGLE',
          properties: {
            width: 400,
            height: 180,
            fills: [{
              type: 'SOLID',
              color: { r: 0.95, g: 0.95, b: 0.95, a: 1 },
              opacity: 1,
              visible: true
            }],
            cornerRadius: 12,
            visible: true
          },
          depth: 1
        },
        {
          componentId: 'card-title',
          name: 'CardTitle',
          type: 'TEXT',
          properties: {
            characters: 'Card Title',
            fontSize: 18,
            fills: [{
              type: 'SOLID',
              color: { r: 0.1, g: 0.1, b: 0.1, a: 1 },
              opacity: 1,
              visible: true
            }],
            visible: true
          },
          depth: 1
        },
        {
          componentId: 'card-description',
          name: 'CardDescription',
          type: 'TEXT',
          properties: {
            characters: 'This is a card component with image, title, and description.',
            fontSize: 14,
            fills: [{
              type: 'SOLID',
              color: { r: 0.4, g: 0.4, b: 0.4, a: 1 },
              opacity: 1,
              visible: true
            }],
            visible: true
          },
          depth: 1
        }
      ],
      depth: 0,
      tags: ['card', 'container', 'content'],
      source: 'design-system'
    },
    {
      componentId: 'navigation-bar',
      name: 'NavigationBar',
      type: 'FRAME',
      properties: {
        width: 1200,
        height: 64,
        fills: [{
          type: 'SOLID',
          color: { r: 1, g: 1, b: 1, a: 1 },
          opacity: 1,
          visible: true
        }],
        strokes: [{
          type: 'SOLID',
          color: { r: 0.9, g: 0.9, b: 0.9, a: 1 },
          opacity: 1,
          visible: true
        }],
        strokeWeight: 1,
        layoutMode: 'HORIZONTAL',
        primaryAxisAlignItems: 'SPACE_BETWEEN',
        itemSpacing: 24,
        visible: true,
        locked: false
      },
      children: [
        {
          componentId: 'nav-logo',
          name: 'Logo',
          type: 'TEXT',
          properties: {
            characters: 'Brand',
            fontSize: 20,
            fills: [{
              type: 'SOLID',
              color: { r: 0, g: 0.5, b: 1, a: 1 },
              opacity: 1,
              visible: true
            }],
            visible: true
          },
          depth: 1
        },
        {
          componentId: 'nav-links',
          name: 'NavLinks',
          type: 'FRAME',
          properties: {
            layoutMode: 'HORIZONTAL',
            primaryAxisAlignItems: 'CENTER',
            itemSpacing: 32,
            visible: true
          },
          children: [
            {
              componentId: 'nav-link-1',
              name: 'NavLink',
              type: 'TEXT',
              properties: {
                characters: 'Home',
                fontSize: 14,
                fills: [{
                  type: 'SOLID',
                  color: { r: 0.3, g: 0.3, b: 0.3, a: 1 },
                  opacity: 1,
                  visible: true
                }],
                visible: true
              },
              depth: 2
            },
            {
              componentId: 'nav-link-2',
              name: 'NavLink',
              type: 'TEXT',
              properties: {
                characters: 'Products',
                fontSize: 14,
                fills: [{
                  type: 'SOLID',
                  color: { r: 0.3, g: 0.3, b: 0.3, a: 1 },
                  opacity: 1,
                  visible: true
                }],
                visible: true
              },
              depth: 2
            },
            {
              componentId: 'nav-link-3',
              name: 'NavLink',
              type: 'TEXT',
              properties: {
                characters: 'About',
                fontSize: 14,
                fills: [{
                  type: 'SOLID',
                  color: { r: 0.3, g: 0.3, b: 0.3, a: 1 },
                  opacity: 1,
                  visible: true
                }],
                visible: true
              },
              depth: 2
            }
          ],
          depth: 1
        },
        {
          componentId: 'nav-cta',
          name: 'CTAButton',
          type: 'FRAME',
          properties: {
            width: 120,
            height: 36,
            fills: [{
              type: 'SOLID',
              color: { r: 0, g: 0.5, b: 1, a: 1 },
              opacity: 1,
              visible: true
            }],
            cornerRadius: 6,
            layoutMode: 'HORIZONTAL',
            primaryAxisAlignItems: 'CENTER',
            visible: true
          },
          children: [
            {
              componentId: 'nav-cta-text',
              name: 'CTAText',
              type: 'TEXT',
              properties: {
                characters: 'Get Started',
                fontSize: 14,
                fills: [{
                  type: 'SOLID',
                  color: { r: 1, g: 1, b: 1, a: 1 },
                  opacity: 1,
                  visible: true
                }],
                visible: true
              },
              depth: 2
            }
          ],
          depth: 1
        }
      ],
      depth: 0,
      tags: ['navigation', 'header', 'layout'],
      source: 'design-system'
    }
  ]
}

const testEmbedding = createStructureEmbedding(exampleComponentTable.components[0], true)
console.log('Test embedding dimension:', testEmbedding.length)
