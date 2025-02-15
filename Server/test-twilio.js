// test-twilio.js
import { sendSMSOTP } from './services/otpService.js';

async function testSMS() {
    try {
        const success = await sendSMSOTP('+919649211944', '123456');
        console.log('Test SMS result:', success ? 'Success' : 'Failed');
    } catch (error) {
        console.error('Test failed:', error);
    }
}

testSMS();
