cd ../website/raspberry_website
node index.js &

cd -
/home/pi/ngrok/ngrok http 3000 --log=stdout > stdoutngrok &
sleep 2

grep url stdoutngrok > logngrok
sleep 1

sudo node app.js
