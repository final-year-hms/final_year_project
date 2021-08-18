#include <OneWire.h>                //Import onewire library for interfacing with ds18b20
#include <DallasTemperature.h>      //Import library for parsing data from ds18b20
#include <Wire.h>                   // Import library for I2C(i squared c) communication
#include "MAX30100_PulseOximeter.h" //Library for parsing data from max30100
#include <ESP8266WiFi.h>            // Library for wifi connection and accessing api

#define REPORTING_PERIOD_MS 5000 // Period to update data from max30100 and ds18b20

const char *host = "192.168.1.100";
String url = "/req"; //The Mongodb api endpoint

const char *ssid = "JioFi_2440A0E";     // Wifi ssid
const char *pass = "dghaq79cxs"; //Wifi password

const int oneWireBus = 2;            // Pin to which ds18b20 is connected, It's the physical D4
OneWire oneWire(oneWireBus);         //Creating Onewire object with the pin
DallasTemperature sensors(&oneWire); //Creating Sensor object with the onewire object

PulseOximeter pox;                      //Creating a pulseOximeterobject
uint32_t tsLastReport = 0, disLast = 0; // Variables to keep track of time

WiFiClient client; //client object to acces the api

float t, b, s;
int ecg[10];

void onBeatDetected() //This function runs when a beat is detected
{
    // Serial.println("Beat!");
}

void sendMongo()
{

    Serial.print("connecting to ");
    Serial.println(host);

    if (!client.connect(host, 80))
    { //works!
        Serial.println("connection failed");
        return;
    }

    String newURI = "temp=" + String(t) + "&bpm=" + String(b) + "&spo2=" + String(s) + "&patient_id=PT00001&ecg=[";

    newURI += String(ecg[0]);
    for (int i = 1; i < 10; i++)
    {
        newURI += ",";
        newURI += String(ecg[i]);
    }

    newURI += "]";

    Serial.print("Requesting URL: ");
    Serial.println(url);

    // This will send the request to the server
    client.print("POST " + url + " HTTP/1.1\n");
    client.print("Host: " + String(host) + "\n");
    client.print("Connection: close\n");
    client.print("Content-Type: application/x-www-form-urlencoded\n");
    client.print("Content-Length: ");
    client.print(newURI.length());
    client.print("\n\n");
    client.print(newURI);
    Serial.println();
    while (client.available())
    {
        String line = client.readStringUntil('\r');
        Serial.println(line);
    }
    Serial.println("closing connection");
}

void setup() //The setup function. IT runs once on reset and initialises things
{
    pinMode(A0, INPUT); //Sets the A0 pin to which Ad8232 is connected, as input
    pinMode(14, INPUT);
    pinMode(12, INPUT);
    pinMode(2, OUTPUT); // The onboard led on esp8266

    Serial.begin(115200); //Serial communication starts at baud rate of 115200

    digitalWrite(2, LOW);
    Serial.println("Connecting to ");
    Serial.println(ssid);
    WiFi.mode(WIFI_STA);
    WiFi.begin(ssid, pass);
    Serial.print("Connecting to SSID: ");
    Serial.println(ssid);
    Serial.print("PAssword: ");
    Serial.println(pass);
    while (WiFi.status() != WL_CONNECTED)
    {
        delay(500);
        Serial.print("!");
    }
    Serial.println("");
    Serial.println("WiFi connected");
    Serial.println("IP address: ");
    Serial.println(WiFi.localIP());
    digitalWrite(2, HIGH);

    // Serial.print("Initializing pulse oximeter..");

    if (!pox.begin()) //This part runs if max30100 initialisation fails
    {
        Serial.println("FAILED");
        for (;;)
            ;
    }
    else
    {
        // Serial.println("SUCCESS");
    }
    pox.setIRLedCurrent(MAX30100_LED_CURR_7_6MA); //Set the current of the ir led on oxymeter

    pox.setOnBeatDetectedCallback(onBeatDetected); //Callback function
}
//variables to keep track of data
float temperatureF, hr;
uint8_t sp;

void loop() //loop function runs like an endless loop
{

    pox.update();                                      //updates the data in the max30100
    if (millis() - tsLastReport > REPORTING_PERIOD_MS) //this block triggers every 1000 milli second or according to the value in the REPORTING_PERIOD_MS variable
    {

        hr = pox.getHeartRate(); // heart rate is stored

        sp = pox.getSpO2(); //o2 level is stored

        sensors.requestTemperatures();             //gets temperature from ds18b20
        temperatureF = sensors.getTempFByIndex(0); //stores farenheit temp into temperatureF

        t = temperatureF;
        s = sp;
        b = hr;
        sendMongo();

        tsLastReport = millis(); // updates the time tracking variable
        // delay(5e3);
    }

    if (millis() - disLast > 10000) //this block runs every 100 ms
    {
        if ((digitalRead(10) == 1) || (digitalRead(11) == 1)) //Thisblock runs if ecg module return probe error
        {
            Serial.print("Min:0,Max:150,");         //The min and max values of the graph is printed to the serial port
            Serial.print("ECG:");                   // the ecg title is printed
            Serial.print("-1");                     //ecg value is printed
            Serial.print(",");                      //seperator is printed
            Serial.print("HeartRate:");             // title
            Serial.print(map(hr, 0, 200, 10, 110)); // value scaled to fit the graph
            Serial.print(",");
            Serial.print("SPO2:");
            Serial.print(sp);
            Serial.print(",");
            Serial.print("temperature:");
            Serial.println(map(temperatureF, 90, 110, 10, 110));
        }
        else //everything same as above but actual ecg value is printed
        {
            // Serial.print("Min:0,Max:150,");
            // Serial.print("ECG:");
            // Serial.print(map(analogRead(A0), 0, 600, 10, 110));
            // Serial.print(",");
            // Serial.print("HeartRate:");
            // Serial.print(map(hr, 0, 200, 10, 110));
            // Serial.print(",");
            // Serial.print("SPO2:");
            // Serial.print(sp);
            // Serial.print(",");
            // Serial.print("temperature:");
            // // Serial.println(map(temperatureF, 90, 110, 10, 110));
            // Serial.println(temperatureF);

            for (int i = 9; i >= 0; i--)
            {
                if (i == 0)
                {
                    ecg[i] = analogRead(A0);
                }
                else
                {
                    ecg[i] = ecg[i - 1];
                }
            }

            for (int i = 0; i < 10; i++)
            {
                Serial.print(ecg[i]);
                Serial.print('\t');
            }
            Serial.println("");
        }
        disLast = millis();
    }
}
