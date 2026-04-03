<p align="center">
  <img src="frontend/public/logo.png" alt="Lembas" width="250">
</p>

# Lembas

A simple, phone-first PWA for to-do lists and shopping lists. Switch between modes with a tap - your data stays separate and persists locally in the browser.

## Features

- **Two modes** - To-Do for task lists, Shopping for grocery runs. Toggle between them with the icons in the header
- **Regulars** - star frequently used items to save them. Tap a regular to quickly re-add it to your current list. Shared across both modes
- **Drag to reorder** - long-press (300ms) to pick up an item, drag to rearrange
- **Drag to delete** - drop an item on the trash zone that appears at the bottom while dragging
- **Autocomplete** - regulars appear as suggestions while typing in the add bar
- **Offline support** - fully functional offline as a PWA with service worker caching
- **No account needed** - all data stored in browser localStorage, no backend

### To-Do Mode (default)

- Add tasks, check them off, clear completed
- Star tasks to save as regulars

### Shopping Mode

- Add items with quantity, price, and aisle/location metadata
- Check off items to move them into a dated shop with a running total
- Shop history with expandable cards showing what was bought
- Drag items onto past shop cards to add retroactively
- Estimated total shown when items have prices

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

Source Available - see [LICENSE](LICENSE).
