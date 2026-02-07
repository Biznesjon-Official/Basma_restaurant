const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://basmaprox:basmaprox2026@cluster0.1rfwets.mongodb.net/basma_osh_markazi?retryWrites=true&w=majority&appName=Cluster0';

async function showMongoDBStructure() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB ga ulandi\n');
    
    console.log('═'.repeat(80));
    console.log('📍 MONGODB MANZIL VA STRUKTURA');
    console.log('═'.repeat(80));
    
    console.log('\n🌐 CONNECTION STRING:');
    console.log('   mongodb+srv://basmaprox:***@cluster0.1rfwets.mongodb.net/');
    
    console.log('\n📊 DATABASE:');
    console.log('   └─ basma_osh_markazi');
    
    console.log('\n📁 COLLECTIONS (Jadvallar):');
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    
    collections.forEach((coll, index) => {
      const isLast = index === collections.length - 1;
      const prefix = isLast ? '   └─' : '   ├─';
      console.log(`${prefix} ${coll.name}`);
    });
    
    console.log('\n' + '═'.repeat(80));
    console.log('📋 TABLES COLLECTION - BATAFSIL MA\'LUMOT');
    console.log('═'.repeat(80));
    
    const Table = mongoose.model('Table', new mongoose.Schema({}, { strict: false }));
    const tables = await Table.find({}).lean();
    
    console.log('\n📍 To\'liq yo\'l:');
    console.log('   MongoDB Atlas → Cluster0 → basma_osh_markazi → tables');
    
    console.log('\n📊 Collection nomi: tables');
    console.log(`📈 Hujjatlar soni: ${tables.length}`);
    
    if (tables.length > 0) {
      console.log('\n📄 HUJJATLAR (Documents):');
      console.log('─'.repeat(80));
      
      tables.forEach((table, index) => {
        console.log(`\n${index + 1}. HUJJAT #${index + 1}:`);
        console.log('   {');
        console.log(`     "_id": ObjectId("${table._id}"),`);
        console.log(`     "number": ${table.number},`);
        console.log(`     "capacity": ${table.capacity},`);
        console.log(`     "status": "${table.status}",`);
        console.log(`     "qrCode": "${table.qrCode}",`);
        console.log(`     "qrCodeUrl": "${table.qrCodeUrl}",`);
        if (table.currentOrder) {
          console.log(`     "currentOrder": ObjectId("${table.currentOrder}"),`);
        }
        if (table.currentWaiter) {
          console.log(`     "currentWaiter": ObjectId("${table.currentWaiter}"),`);
        }
        console.log(`     "createdAt": ISODate("${table.createdAt}"),`);
        console.log(`     "updatedAt": ISODate("${table.updatedAt}")`);
        console.log('   }');
      });
    }
    
    console.log('\n' + '═'.repeat(80));
    console.log('🔍 MONGODB COMPASS DA OCHISH:');
    console.log('═'.repeat(80));
    console.log('\n1. MongoDB Compass dasturini oching');
    console.log('2. Connection string ni kiriting:');
    console.log('   mongodb+srv://basmaprox:basmaprox2026@cluster0.1rfwets.mongodb.net/');
    console.log('\n3. Connect tugmasini bosing');
    console.log('\n4. Quyidagi yo\'lni kuzating:');
    console.log('   Cluster0');
    console.log('   └─ basma_osh_markazi (database)');
    console.log('      └─ tables (collection)');
    console.log('         └─ Stollar ro\'yxati ko\'rinadi');
    
    console.log('\n' + '═'.repeat(80));
    console.log('🌐 MONGODB ATLAS WEB INTERFACE:');
    console.log('═'.repeat(80));
    console.log('\n1. https://cloud.mongodb.com/ ga kiring');
    console.log('2. Login qiling (basmaprox account)');
    console.log('3. Cluster0 ni tanlang');
    console.log('4. "Browse Collections" tugmasini bosing');
    console.log('5. Yo\'l: basma_osh_markazi → tables');
    
    console.log('\n' + '═'.repeat(80));
    console.log('💻 MONGO SHELL ORQALI:');
    console.log('═'.repeat(80));
    console.log('\nKomandalar:');
    console.log('   mongosh "mongodb+srv://cluster0.1rfwets.mongodb.net/" --username basmaprox');
    console.log('   use basma_osh_markazi');
    console.log('   db.tables.find().pretty()');
    console.log('   db.tables.countDocuments()');
    console.log('   db.tables.findOne({ number: 13 })');
    
    console.log('\n' + '═'.repeat(80));
    console.log('🔗 API ORQALI:');
    console.log('═'.repeat(80));
    console.log('\nBackend API endpoint:');
    console.log('   GET http://localhost:5002/api/tables');
    console.log('   (Authorization header kerak)');
    
    console.log('\n' + '═'.repeat(80));
    
    await mongoose.disconnect();
    console.log('\n✅ MongoDB dan uzildi\n');
  } catch (error) {
    console.error('❌ Xatolik:', error.message);
  }
}

showMongoDBStructure();
