<p align="center">
  <img src="public/assets/icon/favicon.png" width="96">
</p>
<h3 align="center">Transmissionic</h3>

<p align="center">
  Transmissionic is a free multi-platform remote for Transmission Daemon built with <a href="https://ionicframework.com/">Ionic</a> and <a href="https://vuejs.org/">Vue.js</a>.<br>
  It can be used as <a href="https://github.com/transmission/transmission/wiki/Web-Interface">Web Interface</a>, Android app and Windows/Linux program. (More platform could be added such as macOS and iOS)
</p>
<p align="center">
  
</p>

----

![Version](https://img.shields.io/github/v/release/6c65726f79/Transmissionic?label=Release)
![Dev](https://img.shields.io/github/package-json/v/6c65726f79/Transmissionic/dev?color=orange&label=Dev)
![GitHub all releases](https://img.shields.io/github/downloads/6c65726f79/Transmissionic/total?label=Downloads)
![Build](https://img.shields.io/github/workflow/status/6c65726f79/Transmissionic/Build?label=Build)
[![Sonar Quality Gate](https://img.shields.io/sonar/quality_gate/6c65726f79_Transmissionic?label=Quality%20gate&logo=sonarcloud&server=https%3A%2F%2Fsonarcloud.io)](https://sonarcloud.io/dashboard?id=6c65726f79_Transmissionic)
[![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=6c65726f79_Transmissionic&metric=sqale_rating)](https://sonarcloud.io/dashboard?id=6c65726f79_Transmissionic)

<a href='https://play.google.com/store/apps/details?id=com.sleroy.transmissionic&pcampaignid=pcampaignidMKT-Other-global-all-co-prtnr-py-PartBadge-Mar2515-1'><img alt='Get it on Google Play' width="240" src='https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png'/></a>

# About

### Main features

* Manage multiple servers
* Add torrent from local file or magnet link
* Drag & drop torrent file
* Start/stop/reannonce/verify/delete one or more torrents
* Modify torrent options
* Set the location of a torrent
* Select and rename torrent files
* Edit tracker list
* View peer list with flags
* Sort torrents by trackers
* Open files in explorer

### Screenshots

<img src="https://i.imgur.com/STtzxrY.png" width="300"> <img src="https://i.imgur.com/5Y9ML4s.png" width="300">

### Translation

![POEditor](https://img.shields.io/poeditor/progress/389563/zh-Hant?token=c2a5935a2b069e687490b29b02f3964c)
![POEditor](https://img.shields.io/poeditor/progress/389563/nl?token=c2a5935a2b069e687490b29b02f3964c)
![POEditor](https://img.shields.io/poeditor/progress/389563/en?token=c2a5935a2b069e687490b29b02f3964c)
![POEditor](https://img.shields.io/poeditor/progress/389563/fr?token=c2a5935a2b069e687490b29b02f3964c)
![POEditor](https://img.shields.io/poeditor/progress/389563/it?token=c2a5935a2b069e687490b29b02f3964c)
![POEditor](https://img.shields.io/poeditor/progress/389563/ru?token=c2a5935a2b069e687490b29b02f3964c)
![POEditor](https://img.shields.io/poeditor/progress/389563/es-cr?token=c2a5935a2b069e687490b29b02f3964c)

Available languages:
- Chinese (Steven F.)
- Dutch (John)
- English
- French
- Italian (Emanuele Ruzza)
- Russian (Alek Depler)
- Spanish (Zenón Monge)

You can help with the translation by joining the project on [POEditor](https://poeditor.com/join/project?hash=sbVnI9eo3d). If your language is not availaible, feel free to add it.

Thanks to all contributors.

### Compatibility

**Web UI**

| Browser         | Chrome    | Firefox   | Safari    | Edge      | IE        | Chrome for Android | Safari on iOS  |
| --------------- | --------- | --------- | --------- | --------- | --------- | ------------------ | -------------- |
| Version         | ≥23 ✔     | ≥21 ✔     | ≥6 ✔      | ≥79 ✔     | ❌         | ≥90 ✔              | ≥6 ✔           |

**Application**

| OS              | Windows   | Linux     | macOS     | Android   | iOS       |
| --------------- | --------- | --------- | --------- | --------- | --------- |
| Version         | ≥7 ✔      | ✔         | ❌         | ≥5.0 ✔     | ❌         |

### Motivations

* Provide a unified interface for all platforms
* Improve myself on Vue.js 3 and Ionic 5
* Get familiar with GitHub

### Inspirations

Interface and features inspired by [Transmission Remote](https://github.com/y-polek/TransmissionRemote) and [Transmission Remote GUI](https://github.com/transmission-remote-gui/transgui).

# Installation

You must first enable remote access in Transmission settings.

### Web UI

Download `Transmissionic-webui-[version].zip` from the [latest release](https://github.com/6c65726f79/Transmissionic/releases/latest) page.

Unzip it and replace the `web` folder of Transmission, whose location varies depending on your operating system:

Windows

```
C:\Program Files\Transmission\web
```

Linux

```
/usr/share/transmission/web
```

macOS

```
/Applications/Transmission.app/Contents/Resources/web
```

Don't forget to save your current `web` folder if you want to switch back.

Then access the Web UI as described [here](https://github.com/transmission/transmission/wiki/Web-Interface).

### Other

Simply download the installer for the desired platform from the [latest release](https://github.com/6c65726f79/Transmissionic/releases/latest) page and install it.

# Configuration

### Web UI

You don't need to specify the server details as they will be automatically detected from the URL of the Web UI.

The settings are stored on the client side, but you can overwrite the default settings by creating a file named `default.json` in the root folder of the Web UI.

The file can contain the following key/value pairs:

| Key             | Type          | Description                       |
| --------------- | ------------- | --------------------------------- |
| colorScheme     | `string`      | Possible values: `light` or `dark`|
| language        | `string`      | An ISO 639-1 language code, example: `en` |
| orderBy         | `string`      | Examples: `name`, `addedDate`, `uploadRatio`, `activityDate` |
| reverse         | `boolean`     | Reversed ordering                 |
| useBits         | `boolean`     | Display speed in bit/s            |
| expandMenu      | `boolean`     | Expand side menu on large screen  |
| ipFlags         | `boolean`     | Display peer flag                 |
| refreshInterval | `number`      | Refresh interval in seconds       |
| timeout         | `number`      | Connection timeout in seconds     |

Configuration file example:

```
{
  "colorScheme":"dark",
  "language":"en",
  "orderBy":"name",
  "reverse":false,
  "ipFlags":true,
  "refreshInterval":10,
  "timeout":20
}
```

### Electron

You can configure path mapping on computer, this allow you to match remote paths with local paths to open the file explorer. This setting works exacly the same as [Transmission Remote GUI](https://github.com/transmission-remote-gui/transgui).

Example:
```
/mnt/ssd = \\192.168.1.1\ssd
```
`/mnt/ssd` = Remote path on the server where Transmission daemon is running.

`\\192.168.1.1\ssd` = Local path to access the shared folder.

In this case, the remote server IP is `192.168.1.1`, and the folder `/mnt/ssd` must be shared on the network as `ssd`.

# Bookmarklet

When using the Web UI, you can import magnet and torrent links using a [bookmarklet](https://en.wikipedia.org/wiki/Bookmarklet). To set up the bookmarklet, open the Web UI settings and simply drag and drop the corresponding button into your bookmarks bar.

You can use the text selection to highlight a magnet link or a hash before cliking on the bookmarklet, otherwise the script will look for a clickable magnet or torrent link in the page.

For mobile users:
1. Long-press the bookmarklet button and select "Copy link address".
2. Add the current page to your favorites and edit the bookmark.
3. Replace the address with the one you previously copied and change the name to "Download with Transmissionic".
4. Go on a torrent page.
5. Tap on the address bar, search for "Download with Transmissionic" and select the bookmark. ([Screenshot](https://i.imgur.com/xcFA4Ez.png))

# Keyboard shortcuts

| Keys            | Action               |
| --------------- | -------------------- |
| Alt+T           | Open torrent         |
| Alt+M           | Open magnet          |
| Alt+U           | Open URL             |
| Alt+S           | Settings             |
| Alt+N           | New server           |
| Alt+I           | Server information   |
| Alt+C           | Server configuration |
| Alt+[1-9]       | Select filter        |
| Ctrl+Alt+S      | Search               |
| Ctrl+Alt+T      | Toggle side menu     |
| Ctrl+RightArrow | Next tab             |
| Ctrl+LeftArrow  | Previous tab         |
| Ctrl+A          | Select all           |
| Ctrl+Alt+C      | Cancel selection     |
| Alt+H           | About                |

# Build

### Requirements

You must have [Node.js](https://nodejs.org/) installed, then you can clone this repo and install dependencies by running this in the root folder of the project:

```
npm install
```

If you want to build the APK, you need to install [Android Studio](https://developer.android.com/studio).

### Web UI

Simply run the following commands:

```
npm run prebuild:webui
npm run build
npm run postbuild:webui
```

This will build the Web UI inside the `dist` folder.

### Electron

Only Windows and Linux are currently supported, but feel free to make some changes to support other platforms.

First, synchronize Electron content by running this in the root folder of the project:

```
npx cap sync @capacitor-community/electron
npm run postbuild:electron
```

Then place your terminal in the `electron` folder and run this:

```
# Install dependencies
npm install
# Build Windows installer
npm run electron:build-windows
# Build Linux installer
npm run electron:build-linux
```

The installer will be located in the `electron/dist` folder.

### Android

Start by running this in the root folder of the project:

```
npx cap sync android
```

Then open Android Studio by running:

```
npx cap open android
```

Once Android Studio has loaded the project, build the app from `Build > Make Project`

# Development

You can start a local dev server using Ionic, but you need to disable same origin policy in your browser to connect to Transmission RPC from a different host. For example, run a new instance of chrome with these flags : `--disable-web-security --disable-gpu --user-data-dir=~/chromeTemp`

Then start the dev server by running this in the root folder of the project: 

```
npm run serve
```

If you want to contribute and pull your changes to this project, please work on the `dev` branch as it contains all the latest changes.

# TODO

- [ ] Add iOS/macOS support
- [x] Add server configurations modal
- [ ] Add magnet url handling on Windows
- [ ] ~~Use ion-virtual-scroll when availaible for Vue.js~~
