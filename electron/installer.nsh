!macro customInstall
  DetailPrint "Register Magnet URI Handler"
  DeleteRegKey HKCU "Software\Classes\Transmissionic.Magnet"
  WriteRegStr HKCU "Software\Classes\Transmissionic.Magnet" "" "URL:magnet"
  WriteRegStr HKCU "Software\Classes\Transmissionic.Magnet" "URL Protocol" ""
  WriteRegStr HKCU "Software\Classes\Transmissionic.Magnet\DefaultIcon" "" `"$INSTDIR\${APP_EXECUTABLE_FILENAME}",0`
  WriteRegStr HKCU "Software\Classes\Transmissionic.Magnet\shell" "" ""
  WriteRegStr HKCU "Software\Classes\Transmissionic.Magnet\shell\open" "" ""
  WriteRegStr HKCU "Software\Classes\Transmissionic.Magnet\shell\open\command" "" `"$INSTDIR\${APP_EXECUTABLE_FILENAME}" "%1"`
!macroend