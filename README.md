<div align="center">

# 🔗 Daniel's Graph Editor

### A Modern Visual Graph Authoring Application

[![SvelteKit](https://img.shields.io/badge/SvelteKit-5.0-FF3E00?style=for-the-badge&logo=svelte&logoColor=white)](https://kit.svelte.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-4.x-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-Apache_2.0-green?style=for-the-badge)](LICENSE)

<br />

**Create, edit, and visualize graph structures with an intuitive drag-and-drop interface.**

<br />

[**Report Bug**](https://github.com/danielmatthewsgrout/graph-edit/issues) · [**Request Feature**](https://github.com/danielmatthewsgrout/graph-edit/issues)

</div>

---

## ✨ Features

### 🎨 Rich Graph Visualization
- **16 Node Shapes** — Circle, square, diamond, star, hexagon, triangle, user, building, database, server, globe, and more
- **Customizable Colors** — Full color picker for nodes and edges with live preview
- **Weighted Edges** — Visual thickness scales with weight values
- **Directed Arrows** — Clear directional indicators with colored arrowheads
- **Multi-Edge Support** — Automatic curve offsetting for parallel edges

### 🖱️ Intuitive Interactions
- **Drag & Drop** — Click and drag nodes to reposition
- **Zoom & Pan** — Mouse wheel to zoom, middle-drag to pan
- **Quick Node Creation** — Double-click canvas or use the Add button
- **Easy Edge Creation** — Right-click a node to start, click another to connect
- **Visual Selection** — Glowing highlight effects for selected items
- **Center View** — One-click button to center all nodes in view

### 🎛️ Type Management
- **Collapsible Panels** — Clean interface with expandable type lists
- **Smart Dropdowns** — Type selectors show icon and color preview inline
- **Live Preview** — See type changes reflected immediately on canvas
- **Active Type Selection** — New items use the currently selected type

### 📝 Properties Inspector
- **Edit Labels** — Rename nodes with instant updates
- **Change Types** — Dropdown with icon and color preview
- **Custom Properties** — Add unlimited key-value metadata
- **Weight Control** — Adjust edge thickness in real-time

### 💾 Data Persistence
- **Auto-Save** — Graph automatically saved to browser storage
- **JSON Export** — Download your graph as a `.json` file
- **JSON Import** — Load existing graphs from files


---

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) 18.x or higher
- npm, pnpm, or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/danielmatthewsgrout/graphedit.git
cd graphedit

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

| Action | Control |
|--------|---------|
| **Add Node** | Double-click canvas or click `+ Add Node` |
| **Start Edge** | Right-click on a node |
| **Complete Edge** | Click on target node |
| **Cancel Edge** | Click on empty canvas |
| **Move Node** | Drag the node |
| **Select Item** | Click on node or edge |
| **Zoom** | Mouse wheel scroll |
| **Pan** | Middle-mouse button drag |
| **Auto Layout** | Click `Auto Layout` button |
| **Center View** | Click center button (crosshair icon) |
| **Reset Zoom** | Click zoom percentage display |

---

## 📁 Data Structure

The application uses a structured JSON format:

```typescript
interface GraphData {
  node_types: Record<string, {
    label: string;
    colour: string;      // Hex color
    icon?: NodeIcon;     // Shape type
  }>;
  edge_types: Record<string, {
    label: string;
    colour: string;
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
│   │   ├── GraphCanvas.svelte      # Main SVG canvas with zoom/pan
│   │   ├── TypeManager.svelte      # Collapsible type palette
│   │   ├── PropertiesEditor.svelte # Inspector with inline previews
│   │   ├── ImportExport.svelte     # File operations & dark mode
│   │   └── NodeIcon.svelte         # SVG icon renderer
│   ├── stores.ts                   # Persistent Svelte stores
│   └── types.ts                    # TypeScript interfaces
└── routes/
    └── +page.svelte                # Main layout
```

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| [SvelteKit 5](https://kit.svelte.dev/) | Full-stack framework with Runes |
| [TypeScript](https://www.typescriptlang.org/) | Type safety |
| [TailwindCSS 4](https://tailwindcss.com/) | Utility-first styling |
| [Vite](https://vitejs.dev/) | Lightning-fast builds |
| **SVG** | Precise, scalable graph rendering |

---

## 📄 License

This project is licensed under the **Apache License 2.0** — see the [LICENSE](LICENSE) file for details.

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
