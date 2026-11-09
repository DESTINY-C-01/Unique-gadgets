import { NestFactory } from '@nestjs/core';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AppModule } from './app.module';
import { Product } from './products/product.schema';

// Sample stock. Edit it, or manage products from the /admin page instead.
const sample: any[] = [
 {n:"iPhone 11 128GB",v:"Apple",sp:["6.1-inch","A13 Bionic","4GB","128GB"],p:165000,c:"pho",e:"📱",k:"t",b:1},
 {n:"iPhone 12 64GB",v:"Apple",sp:["6.1-inch","A14 Bionic","4GB","64GB"],p:215000,c:"pho",e:"📱",k:"t",b:1},
 {n:"Samsung Galaxy S21 5G",v:"Samsung",sp:["6.2-inch","Exynos 2100","8GB","128GB"],p:150000,o:175000,c:"pho",e:"📱",k:"t"},
 {n:"Tecno Spark 20 Pro",v:"Tecno",sp:["6.78-inch","Helio G99","8GB","256GB"],p:95000,c:"pho",e:"📱",k:"n",b:1},
 {n:"Infinix Hot 40 Pro",v:"Infinix",sp:["6.78-inch","Helio G99","8GB","256GB"],p:85000,c:"pho",e:"📱",k:"n"},
 {n:"HP EliteBook 840 G7",v:"HP",sp:["14-inch","Core i5","8GB","256GB SSD"],p:285000,c:"lap",e:"💻",k:"t",b:1},
 {n:"Lenovo ThinkPad X13 Yoga",v:"Lenovo",sp:["13.3-inch","Core i5","8GB","256GB SSD"],p:305000,c:"lap",e:"💻",k:"t"},
 {n:"HP EliteBook x360 1040 G6",v:"HP",sp:["14-inch","Core i7","16GB","256GB SSD"],p:320000,o:360000,c:"lap",e:"💻",k:"t"},
 {n:"Dell Chromebook 3100",v:"Dell",sp:["11.6-inch","Celeron","4GB","16GB eMMC"],p:47000,c:"lap",e:"💻",k:"t",b:1},
 {n:"Apple iMac Retina 4K 21.5\"",v:"Apple",sp:["21.5-inch","Core i5","16GB","1TB SSD"],p:235000,o:290000,c:"desk",e:"🖥️",k:"t"},
 {n:"AirPods Pro 2nd Gen",v:"Apple",s:"Active noise cancelling · MagSafe case",p:95000,c:"gad",e:"🎧",k:"n",b:1},
 {n:"Wireless Over-Ear Headphones",v:"Unique",s:"Bluetooth 5.3 · 40-hour battery",p:25000,c:"gad",e:"🎧",k:"n"},
 {n:"Apple Watch Series 7 45mm",v:"Apple",s:"GPS · always-on display · health tracking",p:120000,c:"gad",e:"⌚",k:"t"},
 {n:"Smartwatch Ultra Series",v:"Unique",s:"Calls from wrist · heart rate · 7-day battery",p:18000,o:25000,c:"gad",e:"⌚",k:"n"},
 {n:"HP USB-C Dock G5",v:"HP",s:"HDMI, dual DisplayPort, Ethernet, 100W",p:60000,c:"acc",e:"🔌",k:"t"},
 {n:"25W Fast Charger + Cable",v:"Unique",s:"USB-C · fast charging",p:8500,c:"acc",e:"🔋",k:"n"}
];

async function run() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const model = app.get<Model<Product>>(getModelToken(Product.name));
  if ((await model.countDocuments()) > 0 && !process.argv.includes('--force')) {
    console.log('Products already exist. To replace them all run: npm run seed -- --force');
    await app.close();
    return;
  }
  await model.deleteMany({});
  await model.insertMany(sample.map((x) => ({
    name: x.n, brand: x.v, description: x.s, specs: x.sp ?? [], price: x.p, oldPrice: x.o,
    category: x.c, emoji: x.e, condition: x.k === 'n' ? 'new' : 'tested', bestSeller: !!x.b, image: x.i,
  })));
  console.log('Seeded', sample.length, 'products');
  await app.close();
}
run();
