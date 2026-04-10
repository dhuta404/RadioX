# Beginner Guide

## 1. Install Node.js

Install Node.js 20 or newer from [nodejs.org](https://nodejs.org/).

Then check that both commands work:

```bash
node -v
npm -v
```

## 2. Open The Project Folder

In PowerShell:

```powershell
cd "D:\Desktop\Fmod Pjkt\RadioX-main"
```

## 3. Install Dependencies

```bash
npm install
```

## 4. Start The Desktop App

```bash
npm run dev
```

## 5. Add Audio

Open `Media Library`, then:

1. Import files
2. Import a folder once
3. Or add a managed folder for a live library

## 6. Build The Schedule

Open `Schedule Grid`, then:

1. Create a block
2. Set the start and end time
3. Choose the source type
4. Choose a playout strategy
5. Save the block

## 7. Set Branding And Timezone

Open `Station`, then:

1. Select the original Babylon screenshot file
2. Choose a station timezone or enable auto-detect
3. Save settings

## 8. Start Automation

Go back to `Playout` and click `Start Automation`.

## 9. Build A Windows Installer

```bash
npm run dist:win
```

The installer will be created in the `release/` folder.
