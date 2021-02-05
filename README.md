<p align="center">
  <img src="public/assets/icon/favicon.png" width="96">
</p>
<h3 align="center">Transmissionic</h3>

<p align="center">
  Transmissionic is a free multi-platform remote for Transmission Daemon built with <a href="https://ionicframework.com/">Ionic</a> and <a href="https://vuejs.org/">Vue.js</a>.<br>
  It can be used as <a href="https://github.com/transmission/transmission/wiki/Web-Interface">Web Interface</a>, Android app and Windows/Linux program. (More platform could be added such as Mac OS and iOS)
</p>
<p align="center">
  
</p>

----

![Version](https://img.shields.io/github/v/release/6c65726f79/Transmissionic?label=Release&style=for-the-badge) ![Build WebUI](https://img.shields.io/github/workflow/status/6c65726f79/Transmissionic/Build?label=Build&style=for-the-badge) ![POEditor](https://img.shields.io/poeditor/progress/389563/en?token=c2a5935a2b069e687490b29b02f3964c&style=for-the-badge) ![POEditor](https://img.shields.io/poeditor/progress/389563/fr?token=c2a5935a2b069e687490b29b02f3964c&style=for-the-badge)

<a href='https://play.google.com/store/apps/details?id=com.sleroy.transmissionic&pcampaignid=pcampaignidMKT-Other-global-all-co-prtnr-py-PartBadge-Mar2515-1'><img alt='Get it on Google Play' width="240" src='https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png'/></a>

### Table of contents

- [About](#about)
  - [Main features](#main-features)
  - [Screenshots](#screenshots)
  - [Motivations](#motivations)
  - [Inspirations](#inspirations)
- [Installation](#installation)
  - [Web UI](#web-ui)
  - [Other](#other)
- [Build](#build)
  - [Requirements](#requirements)
  - [Web UI](#web-ui-1)
  - [Electron](#electron)
  - [Android](#android)
- [Development](#development)
- [Translation](#translation)
- [TODO](#todo)

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

### Screenshots

<img src="https://i.imgur.com/6wB1Czd.png" width="300"> <img src="https://i.imgur.com/k5DH0hi.png" width="300">

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

Unzip it inside the `web` folder of Transmission, whose location varies depending on your operating system :

Windows

```
C:\Program Files\Transmission\web
```

Linux

```
/usr/share/transmission/web
```

Mac OS

```
/Applications/Transmission.app/Contents/Resources/web
```

Then access the Web UI as described [here](https://github.com/transmission/transmission/wiki/Web-Interface).

### Other

Simply download the installer for the desired platform from the [latest release](https://github.com/6c65726f79/Transmissionic/releases/latest) page and install it.

# Build

### Requirements

You must have [Node.js](https://nodejs.org/) installed, then you can clone this repo and install dependencies by running this in the root folder of the project :

```
npm install
npm install -g @ionic/cli
npm install -g @capacitor/cli
```

If you want to build the APK, you need to install [Android Studio](https://developer.android.com/studio).

### Web UI

Simply run the following commands :

```
npm run-script prebuild:webui
ionic build
npm run-script postbuild:webui
```

This will build the Web UI inside the `dist` folder.

### Electron

Only Windows and Linux are currently supported, but feel free to make some changes to support other platforms.

First, synchronize Electron content by running this in the root folder of the project :

```
ionic cap sync @capacitor-community/electron
npm run-script postbuild:electron
```

Then place your terminal in the `electron` folder and run this :

```
# Install dependencies
npm install
# Build Windows installer
npm run-script electron:build-windows
# Build Linux installer
npm run-script electron:build-linux
```

The installer will be located in the `electron/dist` folder.

### Android

Start by running this in the root folder of the project :

```
ionic cap sync android
```

Then open Android Studio by running :

```
ionic cap open android
```

Once Android Studio has loaded the project, build the app from `Build > Make Project`

# Development

You can start a local dev server using Ionic, but you need to disable CORS policy in your browser to connect to Transmission RPC from a different host. For example, run a new instance of chrome with these flags : `--disable-web-security --disable-gpu --user-data-dir=~/chromeTemp`

Then start the dev server by running : 

```
ionic serve
```

This will open http://localhost:8100/ in a new tab.

# Translation

You can help with the translation by joining the project on [POEditor](https://poeditor.com/join/project?hash=sbVnI9eo3d). If your language is not availaible, feel free to suggest it.

# TODO

* Add iOS/Mac OS support
* Add server configurations modal
* Add magnet url handling on Windows
* Use ion-virtual-scroll when availaible for Vue.js
