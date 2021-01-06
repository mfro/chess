git push

ssh mfro.me "cd server/chess ; git pull ; screen -S chess -p 0 -X stuff $'\003' ; ~/startup/chess.sh"

cd web
yarn build
scp -r dist/* mfro.me:wwwroot/chess/
