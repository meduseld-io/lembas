<p align="center">
  <img src="frontend/public/logo.png" alt="Lembas" width="250">
</p>

# Lembas

A simple, phone-first PWA for shopping lists and custom to-do lists. Switch between modes with a tap - your data stays separate and persists locally in the browser.

## Features

- **Two modes** - Shopping (default) for grocery runs, Lists for custom task categories. Toggle between them with the icons in the header
- **Drag to reorder** - grip handle on each item, drag to rearrange (uses @dnd-kit, works on touch and desktop)
- **Drag to delete** - drop an item on the red delete zone that appears at the bottom while dragging
- **Autocomplete** - regulars appear as suggestions while typing in the add bar
- **Offline support** - fully functional offline as a PWA with service worker caching
- **No account needed** - all data stored in browser localStorage, no backend

### Shopping Mode (default)

- Add items with quantity, price, and aisle/location metadata
- Tap any item to open an edit modal (bottom sheet on mobile)
- Estimated shop total shown when items have prices
- Star items to save as regulars for future lists
- Check off items to move them into a dated shop with a running total
- Shop history with expandable cards showing what was bought
- Drag uncompleted items onto past shop cards to add retroactively
- Regulars tab with grid of starred items, tap to re-add to list

### Lists Mode

- Multiple user-created list categories (tasks, packing, errands, etc.)
- Default "Tasks" list (migrates existing data on first load)
- List picker dropdown to switch between lists
- Create, rename, and delete lists from the dropdown
- Each list has its own items and regulars stored independently
- Simple checklist UI with checkbox, tap name to edit, "Move to list" option
- Clear completed items, or clear entire list

## Tech Stack

- **Frontend**: React 19 + Vite 6
- **Drag and drop**: @dnd-kit
- **Icons**: lucide-react
- **Storage**: browser localStorage (no backend)
- **PWA**: service worker with network-first caching, installable via manifest

## Development

```bash
cd frontend
npm install
npm run dev
```

## Build

```bash
cd frontend
npm run build
```

Output goes to `frontend/dist/`.

## Contributing

Contributions are welcome - feel free to open issues or submit pull requests on [GitHub](https://github.com/meduseld-io/lembas).

Lembas is developed and maintained by [@quietarcade](https://github.com/quietarcade) as part of [Meduseld](https://github.com/meduseld-io).

## License

MIT - see [LICENSE](LICENSE).
