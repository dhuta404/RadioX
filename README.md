# BABYLON Radio Desk

BABYLON Radio Desk is a Windows desktop radio playout application built for 24-hour calendar scheduling, managed audio libraries, unattended automation, and day-to-day station operations.

## What It Does

- Imports local audio files and whole folders
- Keeps selected folders as managed libraries that can be rescanned
- Detects episode numbers and release dates from filenames
- Schedules shows in a day or week calendar view
- Supports sequential, random, reverse-order, and latest-episode playout strategies
- Runs unattended automation with dual-deck crossfades
- Uses a local JSON data file, so it works offline
- Supports manual force-play, skip, pause, and stop controls
- Lets the station choose a European timezone or auto-detect the computer timezone
- Uses the original Babylon screenshot file as the app logo

## Stack

- Electron
- React 18
- TypeScript
- Vite
- Ant Design
- Zustand
- dayjs
- music-metadata

## Project Structure

```text
RadioX-main/
  assets/
  electron/
    main/
    preload/
  src/
    components/
    modules/
    pages/
    services/
    store/
    types/
    utils/
  index.html
  package.json
  tsconfig.json
  vite.config.ts
```

## Install

Use Node.js 20 or newer.

```bash
npm install
```

## Run In Development

```bash
npm run dev
```

This starts:

- the Vite renderer
- the Electron main process watcher
- the Electron desktop window

## Build

```bash
npm run build
```

## Create A Windows Installer

Run this on Windows:

```bash
npm run dist:win
```

The installer is written to the `release/` folder.

## First-Run Workflow

1. Open `Media Library`.
2. Import files, import a folder once, or add a managed folder.
3. Set categories and tags.
4. Open `Schedule Grid`.
5. Create show blocks and choose a playout strategy.
6. Open `Station` to pick the Babylon screenshot and set the timezone.
7. Return to `Playout` and start automation.

## Data Storage

The desktop app stores its data in the Electron user-data folder. The main data file is:

```text
babylon-radio-desk.json
```

## Notes

- Managed folders are intended for podcast-style or episodic audio libraries.
- The `Latest Episode` strategy uses detected episode numbers or dates in filenames.
- The default timezone is `Europe/Dublin`.
- The app can switch to the computer timezone automatically.

## Current Limitations

- This environment did not have Node.js available during the latest refactor, so the current source changes were made without a fresh local build verification pass here.
- Startup registration and output-device routing are still configuration-first and may need deeper OS integration later.
