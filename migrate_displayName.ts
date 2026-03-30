import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load .env
dotenv.config({ path: path.join(__dirname, '.env') });

async function run() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.log("No MongoDB URI found");
    process.exit(1);
  }
  await mongoose.connect(uri);
  try {
    const usersCollection = mongoose.connection.collection('users');
    
    // Find users where displayName is missing
    const usersToUpdate = await usersCollection.find({ displayName: { $exists: false } }).toArray();
    console.log(`Found ${usersToUpdate.length} users to update.`);

    for (const user of usersToUpdate) {
      await usersCollection.updateOne(
        { _id: user._id },
        { $set: { displayName: user.username } }
      );
      console.log(`Updated user: ${user.username}`);
    }

    console.log("✅ Migration complete: displayName initialized for all users.");
  } catch (e: any) {
    console.log("Error during migration:", e.message);
  }
  process.exit(0);
}
run();
