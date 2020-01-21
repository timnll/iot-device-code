echo "Step 1"
cd /home/pi/Documents/website/raspberry_website
node index.js &

echo "Step 2"
/home/pi/ngrok/ngrok http 3000 --log=stdout > /home/pi/Documents/iot_sensor/stdoutngrok &
sleep 2
bash -c 'while true; do grep url /home/pi/Documents/iot_sensor/stdoutngrok > /home/pi/Documents/iot_sensor/logngrok; sleep 5; done' &

echo "Step 3"
sleep 1
cd /home/pi/Documents/iot_sensor/
sudo node app.js &
