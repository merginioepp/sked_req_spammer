import fs from 'fs';
import { format } from 'date-fns';

class RequestManager {
    constructor(req, court, timeslot) {
        this.req = req;
        this.court = court;
        this.timeslot = timeslot;
        this.stopLoop = false;
        this.logMessages = [];
        this.errorMessageToStop = 'your booking because it conflicts with one already scheduled'; // Replace with your specific error message
    }

    // Start spamming the request
    start() {
        this.spamRequest();
    }

    spamRequest() {
        if (!this.stopLoop) {
            this.sendRequest();
            setTimeout(() => this.spamRequest(), 150); // Wait 0.15 seconds between requests
        } else {
            const timestamp = format(new Date(), 'yyyyMMdd_HHmmss'); // Format: YYYYMMDD_HHmmss
            const logFolder = format(new Date(), 'yyyy-MM-dd'); 

            const dir = `logs/${logFolder}`;
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }

            fs.writeFileSync(`logs/${logFolder}/${this.court}_${this.timeslot}_${timestamp}.log`, this.logMessages.join('\n'), 'utf8');
            //   process.exit();
            // logging no yet optimized as we could not wait for the result of the requests
        }
    }

    sendRequest() {
        console.log(`${this.court}_${this.timeslot}: Sending request.`);
        this.logMessages.push(`${this.court}_${this.timeslot}: Sending request.`);

        // this.req
        // .then((response) => response.json().then((data) => ({ status: response.status, data })))
        // .then(({status, data }) => {
        //     console.log(`status: ${status} \n\n`);
        //     console.log(`data: ${data} \n\n`);
        // })
        // .catch((error) => {
        //     console.log(`error: ${error} \n\n`);
        // });

        eval(this.req)
        .then(response => {
            if (response.ok) {
                console.log(`${this.court}_${this.timeslot}: 200: Booking Success.`);
                this.logMessages.push(`${this.court}_${this.timeslot}: 200: Booking Success.`);
                this.stopLoop = true; // Stop the loop on success
            } else {
                return response.text();          
            }
        })
        .then((text) => {
            if (text.includes(this.errorMessageToStop)) {
                console.error(`${this.court}_${this.timeslot}: Error: Already Booked.`);
                this.logMessages.push(`${this.court}_${this.timeslot}: Error: Already Booked.`);
                this.stopLoop = true;
            }
            // EXTEND: add custom errors here based on result e.g previous date not allowed. 
            // <= advisable if you're using task scheduler(windows) /cron job (ubuntu) every night
        })
        .catch(error => {
            console.error(`${this.court}_${this.timeslot}: Request failed: ${error.message}`);
            this.logMessages.push(`${this.court}_${this.timeslot}: Request failed: ${error.message}`);

            // 403 and message below = IP BAN
            // We've detected something unusual or malicious about your request (or the requests of others on your network) 
            // and decided to temporarily forbid you from accessing this resource. Please reach out to our support team 
            // if you need assistance resolving this.
            // IPs banned: XXX.XXX.XX.218
        });
    } 
}

export default RequestManager;
