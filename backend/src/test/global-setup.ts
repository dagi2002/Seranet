import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import { testDatabasePath } from './test-db.js';

export default function globalSetup() {
  fs.rmSync(testDatabasePath, { force: true });

  execFileSync('sqlite3', [
    testDatabasePath,
    `
      PRAGMA foreign_keys = ON;

      CREATE TABLE Merchant (
        id TEXT NOT NULL PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        passwordHash TEXT NOT NULL,
        businessName TEXT NOT NULL,
        ownerName TEXT NOT NULL,
        phone TEXT NOT NULL,
        storeSlug TEXT NOT NULL UNIQUE,
        logoUrl TEXT,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL
      );

      CREATE TABLE Product (
        id TEXT NOT NULL PRIMARY KEY,
        merchantId TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        price REAL NOT NULL,
        stock INTEGER NOT NULL,
        imageUrl TEXT,
        isActive BOOLEAN NOT NULL DEFAULT 1,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL,
        CONSTRAINT Product_merchantId_fkey FOREIGN KEY (merchantId) REFERENCES Merchant(id) ON DELETE RESTRICT ON UPDATE CASCADE
      );

      CREATE TABLE "Order" (
        id TEXT NOT NULL PRIMARY KEY,
        merchantId TEXT NOT NULL,
        customerName TEXT NOT NULL,
        customerPhone TEXT NOT NULL,
        customerAddress TEXT NOT NULL,
        totalAmount REAL NOT NULL,
        status TEXT NOT NULL,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL,
        CONSTRAINT Order_merchantId_fkey FOREIGN KEY (merchantId) REFERENCES Merchant(id) ON DELETE RESTRICT ON UPDATE CASCADE
      );

      CREATE TABLE OrderItem (
        id TEXT NOT NULL PRIMARY KEY,
        orderId TEXT NOT NULL,
        productId TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        priceAtPurchase REAL NOT NULL,
        CONSTRAINT OrderItem_orderId_fkey FOREIGN KEY (orderId) REFERENCES "Order"(id) ON DELETE RESTRICT ON UPDATE CASCADE,
        CONSTRAINT OrderItem_productId_fkey FOREIGN KEY (productId) REFERENCES Product(id) ON DELETE RESTRICT ON UPDATE CASCADE
      );

      CREATE TABLE Payment (
        id TEXT NOT NULL PRIMARY KEY,
        orderId TEXT NOT NULL UNIQUE,
        merchantId TEXT NOT NULL,
        status TEXT NOT NULL,
        amount REAL NOT NULL,
        payload TEXT NOT NULL,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT Payment_orderId_fkey FOREIGN KEY (orderId) REFERENCES "Order"(id) ON DELETE RESTRICT ON UPDATE CASCADE,
        CONSTRAINT Payment_merchantId_fkey FOREIGN KEY (merchantId) REFERENCES Merchant(id) ON DELETE RESTRICT ON UPDATE CASCADE
      );

      CREATE INDEX Product_merchantId_idx ON Product(merchantId);
      CREATE INDEX Order_merchantId_idx ON "Order"(merchantId);
      CREATE INDEX OrderItem_orderId_idx ON OrderItem(orderId);
      CREATE INDEX OrderItem_productId_idx ON OrderItem(productId);
      CREATE INDEX Payment_merchantId_idx ON Payment(merchantId);
    `,
  ]);
}
