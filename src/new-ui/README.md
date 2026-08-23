# New UI

This folder contains the new streaming-style UI while keeping the original project files intact.

- `netflix-ui.js` – profile gate, home screen, movie rails, search and details modal.
- `netflix-ui.css` – all new UI styling.
- `profile-store.js` – browser `localStorage` profile CRUD.

The original `index.html` was backed up as `legacy-index.html`.
The new `index.html` loads this UI directly.

Profiles are stored under:
- `movieiguess.profiles.v1`
- `movieiguess.activeProfile.v1`
