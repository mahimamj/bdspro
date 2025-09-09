import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export async function GET(request: NextRequest) {
  try {
    // Get database connection
    const db = mysql.createPool({
      host: process.env.MYSQL_HOST || "hopper.proxy.rlwy.net",
      port: Number(process.env.MYSQL_PORT) || 50359,
      user: process.env.MYSQL_USER || "root",
      password: process.env.MYSQL_PASSWORD || "QxNkIyShqDFSigZzxHaxiyZmqtzekoXL",
      database: process.env.MYSQL_DATABASE || "railway",
      ssl: {
        rejectUnauthorized: false
      },
      connectionLimit: 10,
      waitForConnections: true,
      queueLimit: 0
    });

    // Check if images table exists
    const [tables] = await db.execute('SHOW TABLES LIKE "images"') as any;
    
    if (tables.length === 0) {
      return NextResponse.json({ 
        error: 'Images table does not exist',
        suggestion: 'Run: node create-images-table.js'
      }, { status: 404 });
    }

    // Check table structure
    const [columns] = await db.execute('DESCRIBE images') as any;
    
    // Try to insert a test record
    const testResult = await db.execute(
      'INSERT INTO images (referred_id, referrer_id, image_url, transaction_hash, amount, status) VALUES (?, ?, ?, ?, ?, ?)',
      [1, null, '/test/test.jpg', 'test_hash', 50.00, 'pending']
    );

    return NextResponse.json({ 
      success: true,
      message: 'Images table exists and is working',
      tableExists: true,
      columns: columns.map((col: any) => col.Field),
      testInsert: 'Success'
    });

  } catch (error) {
    console.error('Error testing images table:', error);
    return NextResponse.json(
      { 
        error: 'Database error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}
