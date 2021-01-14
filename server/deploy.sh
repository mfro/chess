yarn build
scp main.js api.mfro.me:server/chess
ssh api.mfro.me "startup/chess.sh"
