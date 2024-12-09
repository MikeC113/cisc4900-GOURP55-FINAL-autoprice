require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');
const app = express();

// Import models
const User = require('./models/User');
const Car = require('./models/Car');

// Handle JSON and CORS
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Helper function to remove spaces from CSV headers USELSS
const formatHeaders = (data) => {
  const formattedData = {};
  for (const key in data) {
    const newKey = key.replace(/\s+/g, ''); 
    formattedData[newKey] = data[key];
  }
  return formattedData;
};


app.get('/', (req, res) => {
  res.send('Test from the backend!');
});

// POST request to add user
app.post('/api/users', async (req, res) => {
  const { name, password } = req.body;
  const newUser = new User({ name, password });

  try {
    const savedUser = await newUser.save();
    res.json(savedUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});


app.post('/api/signin', async (req, res) => {
  const { name, password } = req.body;

  try {
    const user = await User.findOne({ name });

    if (!user) {
      return res.json({ success: false, message: 'User not found' });
    }

    if (user.password === password) {
      return res.json({ success: true, message: 'Login successful' });
    } else {
      return res.json({ success: false, message: 'Incorrect password' });
    }
  } catch (error) {
    console.error('Error during sign-in:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});


app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST request to upload car data from CSV pain
app.post('/api/upload-cars', upload.single('file'), async (req, res) => {
  const filePath = req.file.path;
  const targetCollection = req.body.collection || 'cars'; // deafult 'cars'
  const cars = [];

  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (data) => {
      const formattedData = formatHeaders(data);
      cars.push(formattedData);
    })
    .on('end', async () => {
      try {
        const collection = mongoose.connection.db.collection(targetCollection);
        await collection.insertMany(cars);
        res.json({ success: true, message: 'Cars uploaded successfully' });
      } catch (error) {
        console.error('Error uploading cars:', error);
        res.status(500).json({ message: 'Error uploading cars' });
      } finally {
        fs.unlinkSync(filePath);
      }
    });
});

// GET search cars
app.get('/api/search-cars', async (req, res) => {
  const { make, model, year } = req.query;
  const query = {};

  if (make) query.Make = make;
  if (model) query.Model = model;
  if (year && !isNaN(year)) query.Year = parseInt(year);

  console.log('Constructed MongoDB query:', query); 

  try {
    const cars = await Car.find(query).select('Vin Year Make Model Trim MMR BidAmount BuyNowPrice');
    const results = cars.map(car => ({
      Vin: car.Vin,
      Year: car.Year,
      Make: car.Make,
      Model: car.Model,
      Trim: car.Trim,
      Market: car.MMR,
      BPrice: car.BidAmount,
      FPrice: car.BuyNowPrice
    }));
    res.json(results);
  } catch (error) {
    console.error('Error searching cars:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// below MMR cars
app.get('/api/below-mmr-cars', async (req, res) => {
  try {
    const { collection } = req.query;
    if (!collection) {
      return res.status(400).json({ message: 'Collection name is required' });
    }

    const db = mongoose.connection.db;
    
    // 检查集合是否存在
    const collectionExists = await db.listCollections({ name: collection }).hasNext();
    if (!collectionExists) {
      return res.status(404).json({ message: 'Collection not found' });
    }

    // 获取所有数据
    const cars = await db.collection(collection)
      .find({})
      .toArray();

    console.log(`Total documents in ${collection}:`, cars.length);

    const normalizedCars = cars.map(car => {
      // 转换字段为数字类型
      const mmr = parseFloat(car.MMR || car.mmr);
      const buyNowPrice = parseFloat(car.BuyNowPrice || car.buynowprice || car['Buy Now Price']);
      
      // 只有当两个值都是有效数字时才返回
      if (!isNaN(mmr) && !isNaN(buyNowPrice) && buyNowPrice > 0) {
        return {
          Year: car.Year || car.year,
          Make: car.Make || car.make,
          Model: car.Model || car.model,
          MMR: mmr,
          BuyNowPrice: buyNowPrice,
          savings: mmr - buyNowPrice,
          savingsPercentage: ((mmr - buyNowPrice) / mmr) * 100,
          ConditionReportGrade: car.ConditionReportGrade || car.conditionreportgrade || car['Condition Report Grade'],
          Vin: car.Vin || car.vin || car.VIN
        };
      }
      return null;
    }).filter(car => car !== null);

    console.log(`Normalized cars count:`, normalizedCars.length);

    // 过滤低于 MMR 的车辆
    const results = normalizedCars
      .filter(car => car.BuyNowPrice < car.MMR)
      .sort((a, b) => b.savingsPercentage - a.savingsPercentage);

    console.log(`Final results count:`, results.length);

    res.json(results);
  } catch (error) {
    console.error('Error fetching below MMR cars:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// 修改获取collections的路由
app.get('/api/collections', async (req, res) => {
  try {
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections
      .map(collection => collection.name)
      .filter(name => name !== 'users' && name !== 'system.indexes'); // 过滤掉 users 集合和系统集合
    res.json(collectionNames);
  } catch (error) {
    console.error('Error fetching collections:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// 添加创建新集合的路由
app.post('/api/create-collection', async (req, res) => {
  try {
    const { name } = req.body;
    
    // 检查集合是否已存在
    const collections = await mongoose.connection.db.listCollections().toArray();
    const exists = collections.some(col => col.name === name);
    
    if (exists) {
      return res.json({ 
        success: false, 
        message: 'Collection already exists' 
      });
    }

    // 创建新集合
    await mongoose.connection.db.createCollection(name);
    
    res.json({ 
      success: true, 
      message: 'Collection created successfully' 
    });
  } catch (error) {
    console.error('Error creating collection:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error creating collection' 
    });
  }
});

// 添加删除集合的路由
app.delete('/api/delete-collection', async (req, res) => {
  try {
    const { name } = req.body;
    
    // 基础验证
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Collection name is required'
      });
    }

    // 防止删除系统集合和用户集合
    if (name === 'users' || name.startsWith('system.')) {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete protected collections'
      });
    }

    const db = mongoose.connection.db;
    
    // 检查集合是否存在
    const collectionExists = await db.listCollections({ name: name }).hasNext();
    if (!collectionExists) {
      return res.status(404).json({
        success: false,
        message: 'Collection not found'
      });
    }

    // 删除集合
    await db.dropCollection(name);
    
    res.json({
      success: true,
      message: `Collection ${name} deleted successfully`
    });
  } catch (error) {
    console.error('Error deleting collection:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting collection',
      error: error.message
    });
  }
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
