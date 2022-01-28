schtasks /delete /tn "cg-retum-game-auto-checkin" /f
SCHTASKS /Create /SC ONLOGON /TN "cg-retum-game-auto-checkin" /TR "%~dp0%run.bat"