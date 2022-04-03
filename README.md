<p align="center">
  <img src="public/assets/icon/favicon.png" width="96">
</p>
<h3 align="center">Transmissionic</h3>

<p align="center">
  Transmissionic is a free multi-platform remote for Transmission Daemon built with <a href="https://ionicframework.com/">Ionic</a> and <a href="https://vuejs.org/">Vue.js</a>.<br>
  It can be used as <a href="https://github.com/transmission/transmission/wiki/Web-Interface">Web Interface</a>, Android/iOS app and Windows/Linux/macOS program.
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

## Main features

* Manage multiple servers
* Add torrent from local file or magnet link
* Drag & drop torrent file
* Magnet protocol support
* Start/stop/reannounce/verify/delete one or more torrents
* Modify torrent's options
* Set the location of a torrent
* Select and rename torrent's files
* Edit tracker list
* View the list of peers with country flags
* Sort torrents by trackers
* Open files in explorer
* Use presets when adding torrents

## Screenshots

<img src="https://i.imgur.com/STtzxrY.png" width="300"> <img src="https://i.imgur.com/5Y9ML4s.png" width="300">

## Translation

![POEditor](https://img.shields.io/poeditor/progress/389563/de-at?token=c2a5935a2b069e687490b29b02f3964c)
![POEditor](https://img.shields.io/poeditor/progress/389563/zh-Hans?token=c2a5935a2b069e687490b29b02f3964c)
![POEditor](https://img.shields.io/poeditor/progress/389563/zh-Hant?token=c2a5935a2b069e687490b29b02f3964c)
![POEditor](https://img.shields.io/poeditor/progress/389563/nl?token=c2a5935a2b069e687490b29b02f3964c)
![POEditor](https://img.shields.io/poeditor/progress/389563/en?token=c2a5935a2b069e687490b29b02f3964c)
![POEditor](https://img.shields.io/poeditor/progress/389563/fr?token=c2a5935a2b069e687490b29b02f3964c)
![POEditor](https://img.shields.io/poeditor/progress/389563/de?token=c2a5935a2b069e687490b29b02f3964c)
![POEditor](https://img.shields.io/poeditor/progress/389563/hu?token=c2a5935a2b069e687490b29b02f3964c)
![POEditor](https://img.shields.io/poeditor/progress/389563/it?token=c2a5935a2b069e687490b29b02f3964c)
![POEditor](https://img.shields.io/poeditor/progress/389563/pl?token=c2a5935a2b069e687490b29b02f3964c)
![POEditor](https://img.shields.io/poeditor/progress/389563/ru?token=c2a5935a2b069e687490b29b02f3964c)
![POEditor](https://img.shields.io/poeditor/progress/389563/es-cr?token=c2a5935a2b069e687490b29b02f3964c)
![POEditor](https://img.shields.io/poeditor/progress/389563/fr-ch?token=c2a5935a2b069e687490b29b02f3964c)
![POEditor](https://img.shields.io/poeditor/progress/389563/uk?token=c2a5935a2b069e687490b29b02f3964c)

Available languages:
- **Austrian German** (Alain Nussbaumer, Tobias W)
- **Chinese (simplified)** (Cuiweiqiang dlnu, xiatian)
- **Chinese (traditional)** (Steven F)
- **Dutch** (John)
- **English**
- **French**
- **German** (Alain Nussbaumer)
- **Hungarian** (Daniel)
- **Italian** (Emanuele Ruzza)
- **Polish** (Maciej Siwko)
- **Russian** (Alek Depler)
- **Spanish** (Zenón Monge)
- **Swiss French** (Alain Nussbaumer)
- **Ukrainian** (Oleksandr Popov)

You can help with the translation by joining the project on [POEditor](https://poeditor.com/join/project?hash=sbVnI9eo3d). If your language is not availaible, feel free to add it.

Thanks to all contributors.

## Compatibility

### Web UI

| Browser         | Chrome    | Firefox   | Safari    | Edge      | IE        | Chrome for Android | Safari on iOS  |
| --------------- | --------- | --------- | --------- | --------- | --------- | ------------------ | -------------- |
| Version         | ≥23 ✔     | ≥21 ✔     | ≥6 ✔      | ≥79 ✔     | ❌         | ≥90 ✔              | ≥6 ✔           |

### Application

| OS              | Windows   | Linux     | macOS     | Android   | iOS       |
| --------------- | --------- | --------- | --------- | --------- | --------- |
| Version         | ≥7 ✔      | ✔        | ≥10.11 ✔  | ≥5.0 ✔    | ≥12 ✔     |

## Motivations

* Provide a unified interface for all platforms
* Improve myself on Vue.js and Ionic
* Get familiar with GitHub

## Inspirations

Interface and features inspired by [Transmission Remote](https://github.com/y-polek/TransmissionRemote) and [Transmission Remote GUI](https://github.com/transmission-remote-gui/transgui).

# Installation

You must first enable remote access in Transmission settings.

## Web UI

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

## Linux

Download the [AppImage](https://appimage.org/) from the [latest release](https://github.com/6c65726f79/Transmissionic/releases/latest) page.

It's recommended to use [AppImageLauncher](https://github.com/TheAssassin/AppImageLauncher) to take advantage of the torrent file assosiation and magnet link handling.

## macOS

Download the DMG from the [latest release](https://github.com/6c65726f79/Transmissionic/releases/latest) page.

When you try to install it, you will get an error. After getting the error, go to `System Preferences > Security & Privacy` and click on `Open Anyway`.

## iOS

Download the IPA from the [latest release](https://github.com/6c65726f79/Transmissionic/releases/latest) page.

Use a tool like [AltStore](https://altstore.io/) to sideload the app on your device.

## Other

Simply download the installer for the desired platform from the [latest release](https://github.com/6c65726f79/Transmissionic/releases/latest) page and install it.

# Configuration

## Web UI

You don't need to specify the server details as they will be automatically detected from the URL of the Web UI.

### Default settings

The settings are stored on the client side, but you can overwrite the default settings by creating a file named `default.json` in the root folder of the Web UI.

The file can contain the following key/value pairs:

| Key                    | Type          | Description                           |
| ---------------------- | ------------- | ------------------------------------- |
| colorScheme            | `string`      | Possible values: `light` or `dark`    |
| language               | `string`      | An ISO 639-1 language code, example: `en` |
| orderBy                | `string`      | Examples: `name`, `addedDate`, `uploadRatio`, `activityDate` |
| reverse                | `boolean`     | Reversed ordering                     |
| useBits                | `boolean`     | Display speed in bit/s                |
| expandMenu             | `boolean`     | Expand side menu on large screen      |
| ipFlags                | `boolean`     | Display peer flag                     |
| openMagnetLinks        | `boolean`     | Open magnet links with Transmissionic |
| searchByName           | `boolean`     | Search torrents by name               |
| searchByDirectory      | `boolean`     | Search torrents by download directory |
| rememberSelectedPreset | `boolean`     | Remember selected preset when adding torrents |
| compactMode            | `boolean`     | Compact torrent list                  |
| refreshInterval        | `number`      | Refresh interval in seconds           |
| timeout                | `number`      | Connection timeout in seconds         |

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

### Magnet protocol

You can handle magnet links directly with the Web UI, but this feature is only available in secure contexts (HTTPS) or from localhost.

To use the Web UI in HTTPS, you must set up a reverse proxy: [[GUIDE] Transmission web in SSL (https) - using nginx as a reverse proxy](https://discourse.osmc.tv/t/guide-transmission-web-in-ssl-https-using-nginx-as-a-reverse-proxy/22549)

List of supported browsers: [Browser compatibility](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/registerProtocolHandler#browser_compatibility)

### Bookmarklet

When using the Web UI, you can import magnet and torrent links using a [bookmarklet](https://en.wikipedia.org/wiki/Bookmarklet). To set up the bookmarklet, open the Web UI settings and simply drag and drop the corresponding button into your bookmarks bar.

You can use the text selection to highlight a magnet link or a hash before cliking on the bookmarklet, otherwise the script will look for a clickable magnet or torrent link in the page.

For mobile users:
1. Long-press the bookmarklet button and select "Copy link address".
2. Add the current page to your favorites and edit the bookmark.
3. Replace the address with the one you previously copied and change the name to "Download with Transmissionic".
4. Go on a torrent page.
5. Tap on the address bar, search for "Download with Transmissionic" and select the bookmark. ([Screenshot](https://i.imgur.com/xcFA4Ez.png))

## Electron

### Magnet protocol

To handle magnet links in Windows, you need to set Transmissionic as the default program.

To do so, go to "Choose default apps by protocol" in the Windows settings, scroll down to "MAGNET" then select Transmissionic.

### Path mapping

You can configure path mapping on computer, this allow you to match remote paths with local paths to open the file explorer. This parameter works exactly the same way as [Transmission Remote GUI](https://github.com/transmission-remote-gui/transgui).

Example:
```
/mnt/ssd = \\192.168.1.1\ssd
```
`/mnt/ssd` = Remote path on the server where Transmission daemon is running.

`\\192.168.1.1\ssd` = Local path to access the shared folder.

In this case, the remote server IP is `192.168.1.1`, and the folder `/mnt/ssd` must be shared on the network as `ssd`.

# Keyboard shortcuts

| Keys                    | Action               |
| ----------------------- | -------------------- |
| `Alt` `T`               | Open torrent         |
| `Alt` `M`               | Open magnet          |
| `Alt` `U`               | Open URL             |
| `Alt` `S`               | Settings             |
| `Alt` `N`               | New server           |
| `Alt` `I`               | Server information   |
| `Alt` `C`               | Server configuration |
| `Alt` `A`               | About                |
| `Alt` `1`-`9`           | Select filter        |
| `Cmd/Ctrl` `Alt` `S`    | Search               |
| `Cmd/Ctrl` `Alt` `T`    | Toggle side menu     |
| `Cmd/Ctrl` `RightArrow` | Next tab             |
| `Cmd/Ctrl` `LeftArrow`  | Previous tab         |
| `Shift` `Click`         | Select torrent       |
| `Ctrl` `A`              | Select all           |
| `Esc`                   | Cancel selection     |

# Build

## Requirements

You must have [Node.js](https://nodejs.org/) installed, then you can clone this repo and install dependencies by running this in the root folder of the project:

```
npm install
```

If you want to build the APK, you must install [Android Studio](https://developer.android.com/studio) or [JDK](https://www.oracle.com/java/technologies/javase/javase-jdk8-downloads.html).

If you want to build the IPA, you must install [Xcode](https://apps.apple.com/app/xcode/id497799835).

## Web UI

Simply run the following command:

```
npm run build:webui
```

This will build the Web UI inside the `dist` folder.

## Electron

First, synchronize Electron content by running this in the root folder of the project:

```
npm run sync:electron
```

Then place your terminal in the `electron` folder and run this:

```
npm install
```

### Windows

```
npm run electron:build-windows
```

### Linux

```
npm run electron:build-linux
```

### macOS

```
npm run electron:build-mac
```

The installer will be located in the `electron/dist` folder.

## Android

Start by running this in the root folder of the project:

```
npm run sync:android
```

### With Android Studio

Open Android Studio by running:

```
npx cap open android
```

Once Android Studio has loaded the project, build the app from `Build > Make Project`

### Without Android Studio

Place your terminal in the `android` folder and run this:

```
./gradlew build
```

The APK will be located in the `android/app/build/outputs/apk` folder.

## iOS

Start by running this in the root folder of the project:

```
npm run sync:ios
```

Then open Xcode by running:

```
npx cap open ios
```

# Development

You can start a local dev server using Ionic, but you need to disable same origin policy in your browser to connect to Transmission RPC from a different host. For example, run a new instance of chrome with these flags : `--disable-web-security --disable-gpu --user-data-dir=~/chromeTemp`

Then start the dev server by running this in the root folder of the project: 

```
npm run serve
```

If you want to contribute and pull your changes to this project, please work on the `dev` branch as it contains all the latest changes.

# TODO

- [x] Add iOS/macOS support
- [x] Add server configurations modal
- [x] Add magnet url handling on Windows
- [ ] ~~Use ion-virtual-scroll when availaible for Vue.js~~
