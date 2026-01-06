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
