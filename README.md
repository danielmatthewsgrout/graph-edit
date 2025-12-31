<div align="center">

# 🔗 Daniel's Graph Editor

### A Modern Visual Graph Authoring Application

[![SvelteKit](https://img.shields.io/badge/SvelteKit-5.0-FF3E00?style=for-the-badge&logo=svelte&logoColor=white)](https://kit.svelte.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-4.x-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

<br />

**Create, edit, and visualise graph structures with an intuitive drag-and-drop interface.**

<br />

[**View on GitHub**](https://github.com/danielmatthewsgrout/graph-edit) · [**Report Bug**](https://github.com/danielmatthewsgrout/graph-edit/issues) · [**Request Feature**](https://github.com/danielmatthewsgrout/graph-edit/issues)

</div>

---

## ✨ Features

### 🎨 Rich Graph Visualisation
- **16 Node Shapes** — Circle, square, diamond, star, hexagon, triangle, user, building, database, server, globe, and more
- **Customisable Colours** — Full colour picker for nodes and edges with live preview
- **Weighted Edges** — Visual thickness scales with weight values
- **Line Styles** — Solid, dashed, dotted, and dash-dot edges per edge type
- **Directed Arrows** — Clear directional indicators with coloured arrowheads
- **Multi-Edge Support** — Automatic curve offsetting for parallel edges

### 🖱️ Intuitive Interactions
- **Drag & Drop** — Click and drag nodes to reposition
- **Zoom & Pan** — Mouse wheel to zoom, middle-drag to pan
- **Quick Node Creation** — Double-click canvas or use the Add button
- **Easy Edge Creation** — Right-click a node to start, click another to connect
- **Visual Selection** — Glowing highlight effects for selected items
- **Centre View** — One-click button to centre all nodes in view
- **Multi-select** — Shift/Ctrl click to select multiple nodes or edges
- **Copy & Paste** — Duplicate selected nodes and edges with keyboard shortcuts
- **Minimap** — Navigate large graphs with an interactive overview map
- **Snap to Grid** — Optional grid alignment for precise node positioning

### 🎛️ Type Management
- **Collapsible Panels** — Clean interface with expandable type lists
- **Smart Dropdowns** — Type selectors show icon and colour preview inline
- **Edge Styles** — Choose edge line styles (solid/dashed/dotted/dash-dot) per type
- **Live Preview** — See type changes reflected immediately on canvas
- **Active Type Selection** — New items use the currently selected type

### 📝 Properties Inspector
- **Edit Labels** — Rename nodes with instant updates
- **Change Types** — Dropdown with icon and colour preview
- **Custom Properties** — Add unlimited key-value metadata
- **Weight Control** — Adjust edge thickness in real-time
- **Edge Styling** — Quick controls for weight and line style on selected edges

### 📊 Graph Analytics
- **Statistics Panel** — Real-time metrics including node/edge counts, connectivity, and degree statistics
- **Type Distribution** — See counts for each node and edge type
- **Graph Health** — Identify isolated nodes and connectivity metrics

### 💾 Data Persistence & Export
- **Auto-Save** — Graph, camera position (pan/zoom), and theme saved to browser storage
- **JSON Export** — Download your graph as a `.json` file
- **JSON Import** — Load existing graphs from files
- **New Graph** — Reset with confirmation
- **SVG/PNG Export** — One-click export of the current canvas
- **Graph Validation** — Clean up invalid edges and missing node references


---

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) 18.x or higher
- npm, pnpm, or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/danielmatthewsgrout/graph-edit.git
cd graph-edit

# Install dependencies
npm install

# Start development server
npm run dev
```

Open your browser to `http://localhost:5173`

### Production Build

```bash
npm run build
npm run preview
```

---

## 🎮 Controls

### Mouse & Canvas
| Action | Control |
|--------|---------|
| **Add Node** | Double-click canvas or click `+ Add Node` |
| **Start Edge** | Right-click on a node |
| **Complete Edge** | Click on target node |
| **Cancel Edge** | Click on empty canvas |
| **Move Node** | Drag the node |
| **Select Item** | Click on node or edge |
| **Multi-select** | Shift/Ctrl + Click |
| **Zoom** | Mouse wheel scroll |
| **Pan** | Middle-mouse button drag |
| **Centre View** | Click centre button (crosshair icon) |
| **Reset Zoom** | Click zoom percentage display |

### Keyboard Shortcuts
| Action | Shortcut |
|--------|----------|
| **Undo** | Ctrl/Cmd + Z |
| **Redo** | Ctrl/Cmd + Shift + Z |
| **Copy Selection** | Ctrl/Cmd + C |
| **Paste** | Ctrl/Cmd + V |
| **Delete Selection** | Delete / Backspace |
| **Search** | Enter text in Search box, press Enter |
| **Show Shortcuts** | ? |

### Toolbar Actions
| Action | Control |
|--------|---------|
| **Layout Presets** | Select from dropdown (Grid, Force-Directed, Radial, Tree) |
| **Export SVG/PNG** | Click export buttons |
| **Validate Graph** | Click Validate button |
| **New Graph** | Click `New` button (with confirmation) |
| **Toggle Dark Mode** | Click theme toggle button |

---

## 📁 Data Structure

The application uses a structured JSON format:

```typescript
interface GraphData {
  node_types: Record<string, {
    label: string;
    colour: string;      // Hex colour
    icon?: NodeIcon;     // Shape type
  }>;
  edge_types: Record<string, {
    label: string;
    colour: string;
    line_style?: 'solid' | 'dashed' | 'dotted' | 'dashdot';
  }>;
  nodes: Record<string, {
    node_type: string;
    label: string;
    properties: Record<string, string>;
    layout_properties: {
      x_pos: number;
      y_pos: number;
    };
  }>;
  edges: Record<string, {
    from_node: string;
    to_node: string;
    edge_type: string;
    weight: number;
    properties: Record<string, string>;
  }>;
}
```

### Available Node Icons

`circle` · `square` · `diamond` · `star` · `hexagon` · `triangle` · `user` · `building` · `folder` · `file` · `database` · `server` · `globe` · `heart` · `zap` · `shield`

---

## 🏗️ Project Structure

```
src/
├── lib/
│   ├── components/
│   │   ├── GraphCanvas.svelte         # Main SVG canvas with zoom/pan
│   │   ├── GraphRenderer.svelte       # SVG rendering logic
│   │   ├── GraphMinimap.svelte         # Interactive overview map
│   │   ├── GraphStatistics.svelte     # Analytics panel
│   │   ├── CanvasToolbar.svelte        # Top toolbar controls
│   │   ├── CanvasSearch.svelte         # Search functionality
│   │   ├── EdgeStylingPanel.svelte    # Quick edge styling
│   │   ├── KeyboardShortcutsModal.svelte # Shortcuts overlay
│   │   ├── TypeManager.svelte         # Collapsible type palette
│   │   ├── PropertiesEditor.svelte     # Inspector with inline previews
│   │   ├── ImportExport.svelte        # File operations & dark mode
│   │   └── NodeIcon.svelte            # Icon component renderer
│   ├── utils/
│   │   ├── layoutUtils.ts             # Layout algorithms
│   │   └── iconPaths.ts               # Icon path utilities
│   ├── stores.ts                      # Persistent Svelte stores
│   └── types.ts                       # TypeScript interfaces
└── routes/
    └── +page.svelte                   # Main layout
```

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| [SvelteKit 5](https://kit.svelte.dev/) | Full-stack framework with Runes |
| [TypeScript](https://www.typescriptlang.org/) | Type safety |
| [TailwindCSS 4](https://tailwindcss.com/) | Utility-first styling |
| [Vite](https://vitejs.dev/) | Lightning-fast builds |
| [Lucide Svelte](https://lucide.dev/) | Icon library |
| **SVG** | Precise, scalable graph rendering |
| LocalStorage | Persists graph data, dark mode, and camera (zoom/pan) |

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 👤 Author

<table>
  <tr>
    <td align="center">
      <b>Daniel Matthews-Grout</b><br />
      <a href="https://www.damg.uk">www.damg.uk</a><br />
      <a href="https://github.com/danielmatthewsgrout">@danielmatthewsgrout</a>
    </td>
  </tr>
</table>

---

<div align="center">

Made with ❤️ and ☕ using SvelteKit

<br />

⭐ **Star this repo if you find it useful!** ⭐

</div>
