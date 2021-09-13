!macro customInstall
  DetailPrint "Register Magnet URI Handler"
  DeleteRegKey HKCU "Software\Classes\Transmissionic.Magnet"
  DeleteRegKey HKCU "Software\Clients\StartMenuInternet\Transmissionic"
  DeleteRegValue HKCU "Software\RegisteredApplications" "Transmissionic"
  WriteRegStr HKCU "Software\Classes\Transmissionic.Magnet" "" "URL:magnet"
  WriteRegStr HKCU "Software\Classes\Transmissionic.Magnet" "URL Protocol" ""
  WriteRegStr HKCU "Software\Classes\Transmissionic.Magnet\DefaultIcon" "" `"$INSTDIR\${APP_EXECUTABLE_FILENAME}",0`
  WriteRegStr HKCU "Software\Classes\Transmissionic.Magnet\shell" "" ""
  WriteRegStr HKCU "Software\Classes\Transmissionic.Magnet\shell\open" "" ""
  WriteRegStr HKCU "Software\Classes\Transmissionic.Magnet\shell\open\command" "" `"$INSTDIR\${APP_EXECUTABLE_FILENAME}" "%1"`
  WriteRegStr HKCU "Software\Clients\StartMenuInternet\Transmissionic" "" "Transmissionic"
  WriteRegStr HKCU "Software\Clients\StartMenuInternet\Transmissionic\Capabilities" "" ""
  WriteRegStr HKCU "Software\Clients\StartMenuInternet\Transmissionic\Capabilities\URLAssociations" "magnet" "Transmissionic.Magnet"
  WriteRegStr HKCU "Software\Clients\StartMenuInternet\Transmissionic\DefaultIcon" "" `"$INSTDIR\${APP_EXECUTABLE_FILENAME}",0`
  WriteRegStr HKCU "Software\Clients\StartMenuInternet\Transmissionic\shell" "" ""
  WriteRegStr HKCU "Software\Clients\StartMenuInternet\Transmissionic\shell\open" "" ""
  WriteRegStr HKCU "Software\Clients\StartMenuInternet\Transmissionic\shell\open\command" "" `"$INSTDIR\${APP_EXECUTABLE_FILENAME}"`
  WriteRegStr HKCU "Software\RegisteredApplications" "Transmissionic" "Software\Clients\StartMenuInternet\Transmissionic\Capabilities"
!macroend

!macro customUnInstall
  DeleteRegKey HKCU "Software\Classes\Transmissionic.Magnet"
  DeleteRegKey HKCU "Software\Clients\StartMenuInternet\Transmissionic"
  DeleteRegValue HKCU "Software\RegisteredApplications" "Transmissionic"
!macroend