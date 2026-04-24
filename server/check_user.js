import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI;

if (!MONGO_URI) {
  console.error('❌ MONGODB_URI tapılmadı!');
  process.exit(1);
}

async function checkUser() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Bazaya qoşuldu...');

    const email = 'poladrb@code.edu.az';
    const user = await User.findOne({ email: email });

    if (user) {
      console.log(`\n🔍 İstifadəçi tapıldı!`);
      console.log(`------------------------`);
      console.log(`Ad: ${user.firstName} ${user.lastName}`);
      console.log(`Email: ${user.email}`);
      console.log(`Universitet: ${user.university}`);
      console.log(`Kurs: ${user.course}`);
      console.log(`Qeydiyyat Tarixi: ${user.createdAt}`);
      console.log(`------------------------\n`);
    } else {
      console.log(`\n❌ '${email}' maili ilə istifadəçi tapılmadı.\n`);
    }

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Xəta baş verdi:', error.message);
    process.exit(1);
  }
}

checkUser();
