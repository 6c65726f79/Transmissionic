!macro customInstall
  DetailPrint "Register Magnet URI Handler"
  DeleteRegKey HKCR "Magnet"
  WriteRegStr HKCR "Magnet" "" "URL:magnet"
  WriteRegStr HKCR "Magnet" "URL Protocol" ""
  WriteRegStr HKCR "Magnet\DefaultIcon" "" "$INSTDIR\${APP_EXECUTABLE_FILENAME},0"
  WriteRegStr HKCR "Magnet\shell" "" ""
  WriteRegStr HKCR "Magnet\shell\Open" "" ""
  WriteRegStr HKCR "Magnet\shell\Open\command" "" `$INSTDIR\${APP_EXECUTABLE_FILENAME} "%1"`
!macroend