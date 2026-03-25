@echo off

echo 🔨 Building Angular...
call ng build --base-href /voley/

echo 🚀 Deploy directo...

ssh debian@164.132.52.142 "rm -rf /var/www/nervagest/voley/*"

scp -r dist/lawea/browser/* debian@164.132.52.142:/var/www/nervagest/voley/

ssh debian@164.132.52.142 "systemctl restart nginx"

echo ✅ Deploy terminado
pause